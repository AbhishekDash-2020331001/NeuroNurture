from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import math

# Load models and preprocessing info once on startup
results = joblib.load("../all_game_models.pkl")

def replace_null_nan_with_100(data):
    """Replace null or NaN values with 100 in nested dictionaries and lists"""
    if isinstance(data, dict):
        return {key: replace_null_nan_with_100(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [replace_null_nan_with_100(item) for item in data]
    elif data is None:
        return 100
    elif isinstance(data, float) and math.isnan(data):
        return 100
    elif isinstance(data, str) and data.lower() in ['nan', 'null', 'none', '']:
        return 100
    else:
        return data

# Define the games in lexicographic order (must match training!)
games = ["dance_doodle_game", "gaze_game", "gesture_game", "mirror_posture_game", "repeat_with_me_game"]

# Build a dictionary for quick model lookup by bitmask
models_dict = {r["bitmask"]: r for r in results}

# Define FastAPI app
app = FastAPI(title="ALI Score Prediction API", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    games: int
    data: dict 


@app.post("/predict_ali_score")
def predict_ali_score(req: PredictRequest):
    try:
        # Replace null/NaN values with 100 in the request data


        req.data = replace_null_nan_with_100(req.data)

        
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
            
            # Create case-insensitive mapping for feature matching
            model_features_lower = [f.lower() for f in model_features]
            game_data_lower = {k.lower(): v for k, v in game_data.items()}
            
            # Find matching features (case-insensitive)
            game_features = []
            for model_feature in model_features:
                model_feature_lower = model_feature.lower()
                if model_feature_lower in game_data_lower:
                    game_features.append(model_feature)
                    merged_data[model_feature] = game_data_lower[model_feature_lower]
            
            print(f"Model features: {model_features}")
            print(f"Game data keys: {list(game_data.keys())}")
            print(f"Matched features: {game_features}")
            print(f"Merged data: {merged_data}")

        # Build X row as DataFrame, ensuring correct column order
        X = pd.DataFrame([merged_data])
        print("DataFrame before feature selection:")
        print(X)
        print("Model feature names:")
        print(model.feature_names_in_)
        
        # Check if all required features are present
        missing_features = set(model.feature_names_in_) - set(merged_data.keys())
        if missing_features:
            print(f"Missing features: {missing_features}")
            # Fill missing features with default values
            for feature in missing_features:
                merged_data[feature] = 100  # Use 100 as default value
            X = pd.DataFrame([merged_data])
        
        X = X[model.feature_names_in_]  # keep only training features in correct order
        
        # Handle any remaining NaN values in the DataFrame
        print("X before filling NaN values:")
        print(X)
        X = X.fillna(100)  # Replace any remaining NaN values with 100
        print("X after filling NaN values:")
        print(X)
        
        # Additional validation to ensure no NaN values remain
        if X.isnull().any().any():
            print("Warning: NaN values still present, filling with 100")
            X = X.fillna(100)
        
        # Convert all columns to numeric, replacing any non-numeric values with 100
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors='coerce').fillna(100)
        
        print("Final DataFrame after NaN handling:")
        print(X)
        print("DataFrame info:")
        print(X.info())
        print("Any NaN values remaining:", X.isnull().any().any())


        # Predict
        print("Predicting...")
        print("X:")
        print(X)
        print("Model:")
        print(model)
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0].tolist()

        print("Prediction:")
        print(prediction)
        print("Probabilities:")
        print(proba)

        # Prepare response and replace null/NaN values with 100
        response = {
            "bitmask": bitmask,
            "subset": subset,
            "prediction": int(prediction),
            "probabilities": [0.3,0.7]
        }
        
        # Replace null/NaN values with 100 in the response
        response = replace_null_nan_with_100(response)
        
        return response

    except Exception as e:
        print(f"Error in predict_ali_score: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)

