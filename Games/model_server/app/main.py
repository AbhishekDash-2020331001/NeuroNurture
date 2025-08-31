from fastapi import FastAPI, UploadFile, File, Form
from app.predictor import *
from app.dance_doodle import *
from fastapi.middleware.cors import CORSMiddleware
from app.gaze import get_gaze
import cv2
import threading
import mediapipe as mp
from groq import Groq
import os
from Levenshtein import distance as levenshtein_distance

# Initialize Groq client for speech transcription
try:
    from app.config import GROQ_API_KEY
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY
    client = Groq(api_key=os.environ["GROQ_API_KEY"])
except ImportError:
    print("Warning: GROQ_API_KEY not found in config. Speech transcription will not work.")
    client = None

# Store repeat game results
repeat_game_results = {}

def sentence_similarity(target_sentence, spoken_sentence):
    """
    Compute similarity between two sentences (any language)
    Returns a percentage (0-100) of similarity
    """
    # Compute edit distance
    dist = levenshtein_distance(target_sentence, spoken_sentence)
    # Normalize by the length of the longer sentence
    max_len = max(len(target_sentence), len(spoken_sentence))
    similarity = (1 - dist / max_len) * 100
    return round(similarity, 2)

def transcribe_audio(file_bytes, file_id, target_text, round_number):
    """Transcribe audio and calculate similarity score"""
    tmp_path = f"tmp_{file_id}.mp3"
    
    try:
        # Save temporary file
        with open(tmp_path, "wb") as f:
            f.write(file_bytes)

        print(f"Transcribing audio for round {round_number}...")
        
        if client is None:
            raise Exception("Groq client not initialized - check GROQ_API_KEY")
        
        # Transcribe with Groq (Bengali language)
        with open(tmp_path, "rb") as f:
            transcription = client.audio.transcriptions.create(
                file=f,
                model="whisper-large-v3",
                response_format="verbose_json",
                language="bn",  # Bengali language code
                temperature=0.0
            )

        transcribed_text = transcription.text.strip()
        print(f"Transcription complete for round {round_number}: {transcribed_text}")
        
        # Calculate similarity
        similarity_score = sentence_similarity(target_text, transcribed_text)
        
        # Store result
        repeat_game_results[round_number] = {
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
        repeat_game_results[round_number] = {
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
# MediaPipe Implementation (KEPT BUT NOT USED)
# This code is preserved for reference but the endpoints use Beam Eye Tracker
W, H = 1920, 1080
CONF_MAP = {
    "high": "HIGH",
    "med": "MEDIUM",
    "low": "LOW"
}
last_gaze = None
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
gaze_thread = None
camera_active = False
def gaze_tracker():
    """MediaPipe gaze tracking function (KEPT BUT NOT USED)"""
    global last_gaze, camera_active
    cap = cv2.VideoCapture(0)  # open webcam
    while camera_active:
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
    
    # Release camera when loop ends
    cap.release()

# Camera will be started on-demand when needed
# camera_active = False  # Camera starts inactive
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
    """Get current gaze data from Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        gaze_data = get_gaze()
        if "error" in gaze_data:
            return {"status": "error", "message": gaze_data["error"]}
        return {"status": "success", "data": gaze_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/start-camera")
async def start_camera():
    """Start the Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        from app.gaze import initialize_eye_tracker
        initialize_eye_tracker()
        return {"status": "success", "message": "Beam Eye Tracker started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/stop-camera")
async def stop_camera():
    """Stop the Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        from app.gaze import api
        if api is not None:
            api.stop_the_beam_eye_tracker()
            return {"status": "success", "message": "Beam Eye Tracker stopped"}
        return {"status": "info", "message": "Beam Eye Tracker not running"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/camera-status")
async def get_camera_status():
    """Get Beam Eye Tracker status (MediaPipe code kept but not used)"""
    try:
        from app.gaze import api
        if api is not None:
            try:
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
                        "active": True,
                        "tracking_status": tracking_status
                    }
                }
            except Exception as api_error:
                # If we can't get status, but API exists, assume it's active
                return {
                    "status": "success", 
                    "data": {
                        "active": True,
                        "tracking_status": "UNKNOWN"
                    }
                }
        return {"status": "success", "data": {"active": False}}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/start-eye-tracker")
async def start_eye_tracker():
    """Manually start the Eyeware Beam eye tracker"""
    try:
        from app.gaze import initialize_eye_tracker
        initialize_eye_tracker()
        return {"status": "success", "message": "Eye tracker started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
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

@app.get("/gesture-labels")
async def get_gesture_labels():
    """Get all available gesture labels from the model"""
    try:
        from .predictor import gesture_model
        labels = gesture_model.classes_.tolist()
        return {"labels": labels, "count": len(labels)}
    except Exception as e:
        return {"error": str(e)}


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
        from app.gaze import W, H, api, initialize_eye_tracker
        if api is None:
            initialize_eye_tracker()
        
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

@app.get("/test-gaze")
async def test_gaze():
    """Test endpoint to check if gaze data is available"""
    try:
        from app.gaze import get_gaze
        gaze_data = get_gaze()
        return {
            "status": "success",
            "data": gaze_data,
            "message": "Gaze test completed"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/calibration-status")
async def get_calibration_status():
    """Check if the Beam Eye Tracker is properly calibrated"""
    try:
        from app.gaze import get_gaze
        gaze_data = get_gaze()
        
        if "error" in gaze_data:
            return {
                "status": "needs_calibration",
                "message": gaze_data["error"],
                "data": gaze_data
            }
        
        # Check if we have valid data
        if gaze_data.get("confidence") in ["LOST_TRACKING", "LOW"]:
            return {
                "status": "needs_calibration",
                "message": "Eye tracker needs better calibration",
                "data": gaze_data
            }
        
        return {
            "status": "calibrated",
            "message": "Eye tracker is properly calibrated",
            "data": gaze_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/beam-status")
async def get_beam_status():
    """Check the status of the Beam Eye Tracker connection"""
    try:
        from app.gaze import api
        if api is None:
            return {
                "status": "not_connected",
                "message": "Beam Eye Tracker API not initialized",
                "data": None
            }
        
        # Try to get tracking status
        try:
            tracking_status = api.get_tracking_data_reception_status()
            return {
                "status": "connected",
                "message": f"Beam Eye Tracker connected - Status: {tracking_status}",
                "data": {
                    "tracking_status": str(tracking_status),
                    "api_initialized": True
                }
            }
        except Exception as e:
            return {
                "status": "connection_error",
                "message": f"Error getting tracking status: {str(e)}",
                "data": {
                    "api_initialized": True,
                    "error": str(e)
                }
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    


# Run the server with: uvicorn app.main:app --reload

# ============================================================================
# REPEAT WITH ME GAME ENDPOINTS
# ============================================================================

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), target_text: str = Form(...), round_number: int = Form(...)):
    """Transcribe audio file and calculate similarity with target text"""
    file_bytes = await file.read()
    file_id = file.filename

    # Run transcription in a separate thread (non-blocking)
    import threading
    thread = threading.Thread(target=transcribe_audio, args=(file_bytes, file_id, target_text, round_number))
    thread.start()

    return {"status": "processing", "file_id": file_id}

@app.get("/game-results")
def get_game_results():
    """Get all completed repeat game results"""
    completed_results = {}
    for round_number, result in repeat_game_results.items():
        if result["status"] == "completed":
            completed_results[round_number] = result
    
    return {
        "status": "success",
        "total_rounds": len(completed_results),
        "results": completed_results
    }

@app.post("/clear-game-results")
def clear_game_results():
    """Clear all repeat game results for a new game session"""
    global repeat_game_results
    repeat_game_results.clear()
    return {"status": "success", "message": "Game results cleared"}

@app.get("/round-result/{round_number}")
def get_round_result(round_number: int):
    """Get result for a specific round of repeat game"""
    if round_number in repeat_game_results:
        return {
            "status": "success",
            "result": repeat_game_results[round_number]
        }
    return {
        "status": "not_found",
        "message": f"Result for round {round_number} not found"
    }


## ============================================================================
# DANCE DOODLE GAME ENDPOINTS
## ============================================================================
@app.post("/predictDancePose")
async def predict_dance_pose(file: UploadFile = File(...)):
    """Predict dance pose from uploaded image"""
    contents = await file.read()
    print("Received dance pose file:", file.filename)
    result = predict_dance_pose_from_image_bytes(contents)
    return result

@app.get("/dancePoseStatus")
async def get_dance_pose_status():
    """Get dance pose model status and available labels"""
    try:
        status = check_model_status()
        return {
            "status": "success",
            "data": status
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    