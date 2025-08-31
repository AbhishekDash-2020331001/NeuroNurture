import cv2
import mediapipe as mp
import numpy as np
import joblib
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os

# -------------------------
# Load trained model & encoder
# -------------------------
def load_models():
    """Load the trained decision tree model and label encoder"""
    try:
        
        model_path = "app/models/dance_doodle/dance_doodle_random_forest_model.pkl"
        encoder_path = "app/models/dance_doodle/dance_doodle_label_encoder.pkl"
        pose_model_path = "app/models/dance_doodle/pose_landmarker.task"
        

        
        rf_model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)
        
        # Initialize MediaPipe PoseLandmarker
        base_options = python.BaseOptions(model_asset_path=pose_model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            output_segmentation_masks=False,
            running_mode=vision.RunningMode.IMAGE
        )
        detector = vision.PoseLandmarker.create_from_options(options)
        
        return rf_model, encoder, detector
    except Exception as e:
        print(f"Error loading models: {e}")
        return None, None, None

# Global variables for loaded models
rf_model, encoder, detector = load_models()

# -------------------------
# Helper to extract landmarks from image bytes
# -------------------------
def extract_landmarks_from_image_bytes(image_bytes):
    """Extract pose landmarks from image bytes"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return None, "Failed to decode image"
        
        # Convert BGR to RGB for MediaPipe
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )
        
        # Detect pose landmarks
        result = detector.detect(mp_image)
        
        if not result.pose_landmarks:
            return None, "No pose landmarks detected"
        
        # Extract coordinates
        coords = []
        for lm in result.pose_landmarks[0]:
            coords.extend([lm.x, lm.y, lm.z, lm.visibility])
        
        landmarks = np.array(coords).reshape(1, -1)
        return landmarks, None
        
    except Exception as e:
        return None, f"Error processing image: {str(e)}"

# -------------------------
# Main prediction function
# -------------------------
def predict_dance_pose_from_image_bytes(image_bytes, confidence_threshold=40.0):
    """
    Predict dance pose from image bytes using Random Forest.
    
    Args:
        image_bytes: Bytes of the image to process.
        confidence_threshold: Minimum confidence (%) required to accept prediction.
        
    Returns:
        dict with prediction results
    """
    try:
        # Check if models are loaded
        if rf_model is None or encoder is None or detector is None:
            return {
                "status": "error",
                "message": "Models not loaded properly",
                "prediction": None,
                "confidence": 0.0
            }

        # Extract landmarks
        landmarks, error_msg = extract_landmarks_from_image_bytes(image_bytes)
        if landmarks is None:
            return {
                "status": "error",
                "message": error_msg,
                "prediction": None,
                "confidence": 0.0
            }

        # Check features match
        if landmarks.shape[1] != rf_model.n_features_in_:
            return {
                "status": "error",
                "message": f"Expected {rf_model.n_features_in_} features, got {landmarks.shape[1]}",
                "prediction": None,
                "confidence": 0.0
            }

        # Make prediction
        pred_idx = rf_model.predict(landmarks)[0]
        label = encoder.inverse_transform([pred_idx])[0]

        # Get prediction probabilities
        probabilities = rf_model.predict_proba(landmarks)[0]
        confidence = float(max(probabilities))*100

        print(f"Confidence: {confidence}")
        print(f"Label: {label}")

        # Return None if confidence below threshold
        if confidence < confidence_threshold:
            return {
                "status": "warning",
                "message": f"Low confidence ({round(confidence,2)}%) - pose not reliable",
                "prediction": label,
                "confidence": round(confidence, 2),
                "landmarks_count": landmarks.shape[1],
                "model_features": rf_model.n_features_in_
            }

        return {
            "status": "success",
            "message": "Dance pose detected successfully",
            "prediction": label,
            "confidence": round(confidence, 2),
            "landmarks_count": landmarks.shape[1],
            "model_features": rf_model.n_features_in_
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Prediction failed: {str(e)}",
            "prediction": None,
            "confidence": 0.0
        }



# -------------------------
# Alternative function for direct image path
# -------------------------
def predict_dance_pose_from_image_path(image_path):
    """
    Predict dance pose from image file path
    Returns: dict with prediction results
    """
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        return predict_dance_pose_from_image_bytes(image_bytes)
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to read image file: {str(e)}",
            "prediction": None,
            "confidence": 0.0
        }

# -------------------------
# Health check function
# -------------------------
def check_model_status():
    """Check if all models are loaded and ready"""
    return {
        "random_forest_model": rf_model is not None,
        "label_encoder": encoder is not None,
        "pose_detector": detector is not None,
        "expected_features": rf_model.n_features_in_ if rf_model else None,
        "available_labels": list(encoder.classes_) if encoder else None
    }
