from fastapi import FastAPI, UploadFile, File, Form
from app.predictor import predict_posture_from_image_bytes, predict_gesture_from_image_bytes
from app.gaze import get_gaze
from fastapi.middleware.cors import CORSMiddleware
import cv2
from groq import Groq
import threading
import mediapipe as mp
from threading import Thread
import time
from Levenshtein import distance as levenshtein_distance

import os
from app.config import GROQ_API_KEY

os.environ["GROQ_API_KEY"] = GROQ_API_KEY
client = Groq(api_key=os.environ["GROQ_API_KEY"])

# Store game results with round information
game_results = {}

def sentence_similarity(target_sentence, spoken_sentence):
    """
    Compute similarity between two sentences (Bangla or any language)
    Returns a percentage (0-100) of similarity
    """
    # Compute edit distance
    dist = levenshtein_distance(target_sentence, spoken_sentence)
    # Normalize by the length of the longer sentence
    max_len = max(len(target_sentence), len(spoken_sentence))
    similarity = (1 - dist / max_len) * 100
    return round(similarity, 2)

def transcribe_audio(file_bytes, file_id, target_text, round_number):
    tmp_path = f"tmp_{file_id}.mp3"
    with open(tmp_path, "wb") as f:
        f.write(file_bytes)

    print(f"Transcribing audio for round {round_number}...")
    
    try:
        with open(tmp_path, "rb") as f:
            transcription = client.audio.transcriptions.create(
                file=f,
                model="whisper-large-v3",
                response_format="verbose_json",
                language="bn",
                temperature=0.0
            )

        transcribed_text = transcription.text.strip()
        print(f"Transcription complete for round {round_number}: {transcribed_text}")
        
        # Calculate similarity
        similarity_score = sentence_similarity(target_text, transcribed_text)
        
        # Store result with round information
        game_results[round_number] = {
            "target_text": target_text,
            "transcribed_text": transcribed_text,
            "similarity_score": similarity_score,
            "status": "completed"
        }
        
        print(f"Round {round_number} - Target: {target_text}")
        print(f"Round {round_number} - Transcribed: {transcribed_text}")
        print(f"Round {round_number} - Similarity: {similarity_score}%")
        
    except Exception as e:
        print(f"Error in transcription for round {round_number}: {e}")
        game_results[round_number] = {
            "target_text": target_text,
            "transcribed_text": "Error in transcription",
            "similarity_score": 0,
            "status": "error",
            "error": str(e)
        }
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)




#############################################
W, H = 1920, 1080
CONF_MAP = {
    "high": "HIGH",
    "med": "MEDIUM",
    "low": "LOW"
}
last_gaze = None
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
def gaze_tracker():
    global last_gaze
    cap = cv2.VideoCapture(0)  # open webcam
    while True:
        ret, frame = cap.read()
        frame=cv2.flip(frame,1)# horizontal flip
        if not ret:
            continue

        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            # Use right iris center as approximate gaze point
            iris = landmarks[468]  
            x, y = int(iris.x * W), int(iris.y * H)

            last_gaze = {
                "x": x,
                "y": y,
                "confidence": CONF_MAP["high"],  # we just mark as HIGH
                "screen_width": W,
                "screen_height": H
            }
        time.sleep(0.01)

thread = threading.Thread(target=gaze_tracker, daemon=True)
thread.start()

#############################################





app = FastAPI()

# ✅ Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#############################################
@app.get("/current-gaze")
async def get_current_gaze():
    if last_gaze:
        return {"status": "success", "data": last_gaze}
    return {"error": "No gaze data"}
#############################################

@app.post("/predictPosture")
async def predict_posture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_posture_from_image_bytes(contents)
    return result

@app.post("/predictGesture")
async def predict_gesture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_gesture_from_image_bytes(contents)
    return result

@app.get("/getGaze")
async def get_gaze_data():
    """Get current eye gaze data from the eye tracker"""
    try:
        gaze_data = get_gaze()
        if "error" in gaze_data:
            return {"status": "error", "message": gaze_data["error"]}
        return {"status": "success", "data": gaze_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/gazeStatus")
async def get_gaze_status():
    """Get eye tracker status and screen resolution"""
    try:
        from app.gaze import W, H, api
        status = api.get_tracking_data_reception_status()
        
        # Convert the tracking status to a string representation
        if hasattr(status, 'name'):
            tracking_status = status.name
        elif hasattr(status, '__str__'):
            tracking_status = str(status)
        else:
            tracking_status = "UNKNOWN"
        
        return {
            "status": "success",
            "data": {
                "tracking_status": tracking_status,
                "screen_resolution": {"width": W, "height": H},
                "is_active": True
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), target_text: str = Form(...), round_number: int = Form(...)):
    file_bytes = await file.read()
    file_id = file.filename  # you can generate UUID for uniqueness

    # Run transcription in a separate thread (non-blocking)
    thread = Thread(target=transcribe_audio, args=(file_bytes, file_id, target_text, round_number))
    thread.start()

    return {"status": "processing", "file_id": file_id}

@app.get("/transcription/{file_id}")
def get_transcription(file_id: str):
    # This endpoint is now primarily for retrieving results, not the raw transcription
    # It will return the latest result for the file_id if available
    for round_number, result in game_results.items():
        if result["status"] == "completed" and result["transcribed_text"] == file_id:
            return {"status": "done", "text": result["transcribed_text"]}
    return {"status": "processing"}

@app.get("/game-results")
def get_game_results():
    """Get all completed game results"""
    completed_results = {}
    for round_number, result in game_results.items():
        if result["status"] == "completed":
            completed_results[round_number] = result
    
    return {
        "status": "success",
        "total_rounds": len(completed_results),
        "results": completed_results
    }

@app.post("/clear-game-results")
def clear_game_results():
    """Clear all game results for a new game session"""
    global game_results
    game_results.clear()
    return {"status": "success", "message": "Game results cleared"}

@app.get("/round-result/{round_number}")
def get_round_result(round_number: int):
    """Get result for a specific round"""
    if round_number in game_results:
        return {
            "status": "success",
            "result": game_results[round_number]
        }
    return {
        "status": "not_found",
        "message": f"Result for round {round_number} not found"
    }
    

    
