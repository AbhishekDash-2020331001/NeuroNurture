from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn

# Load models and preprocessing info once on startup
results = joblib.load("../all_game_models.pkl")

# Define the games in lexicographic order (must match training!)
games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]

# Build a dictionary for quick model lookup by bitmask
models_dict = {r["bitmask"]: r for r in results}

# Define FastAPI app
app = FastAPI(title="ALI Score Prediction API", version="1.0")


class PredictRequest(BaseModel):
    games: int
    data: dict 


@app.post("/predict_ali_score")
def predict_ali_score(req: PredictRequest):
    try:
        # Convert integer to bitmask string
        bitmask = format(req.games, f"0{len(games)}b")[::-1]

        # Check if model exists
        if bitmask not in models_dict:
            raise HTTPException(status_code=400, detail=f"No model found for bitmask {bitmask}")

        model_entry = models_dict[bitmask]
        model = model_entry["model"]

        # Get subset of games included
        subset = [games[j] for j in range(len(games)) if bitmask[j] == "1"]

        # Merge data from included games into a single feature row
        merged_data = {}  # placeholder ID

        for game in subset:
            if game not in req.data:
                raise HTTPException(status_code=400, detail=f"Missing data for game {game}")

            game_data = req.data[game]

            # Keep only features that the model saw during training
            model_features = model_entry["model"].feature_names_in_
            game_features = [f for f in game_data.keys() if f in model_features]
            print(game_features)
            # Add them to merged_data
            for f in game_features:
                merged_data[f] = game_data[f]
            print(merged_data)

        # Build X row as DataFrame, ensuring correct column order
        X = pd.DataFrame([merged_data])
        print(X)
        X = X[model.feature_names_in_]  # keep only training features in correct order

        # Predict
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0].tolist()

        return {
            "bitmask": bitmask,
            "subset": subset,
            "prediction": int(prediction),
            "probabilities": proba
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
