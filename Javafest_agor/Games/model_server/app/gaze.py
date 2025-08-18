import time
import ctypes
from eyeware import beam_eye_tracker as beam

# Get screen size
def get_screen_size():
    user32 = ctypes.windll.user32
    user32.SetProcessDPIAware()
    return user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)

W, H = get_screen_size()
vp = beam.ViewportGeometry()
vp.point_00 = beam.Point(0, 0)
vp.point_11 = beam.Point(W - 1, H - 1)

api = beam.API("Python Gaze API", vp)
api.attempt_starting_the_beam_eye_tracker()

CONF_MAP = {0: "LOST_TRACKING", 1: "LOW", 2: "MEDIUM", 3: "HIGH"}

def get_gaze():
    state = api.get_latest_tracking_state_set()
    if state and state.user_state():
        gaze = state.user_state().unified_screen_gaze
        pog = gaze.point_of_regard
        conf = gaze.confidence
        
        # Debug: print coordinates and screen resolution
        print(f"Raw gaze: x={pog.x}, y={pog.y}, Screen: {W}x{H}")
        
        return {
            "x": pog.x,
            "y": pog.y,
            "confidence": CONF_MAP.get(conf, "UNKNOWN"),
            "screen_width": W,
            "screen_height": H
        }
    return {"error": "No gaze data"}

def get_wegazer():
    try:
        import webgazer
        prediction = webgazer.getCurrentPrediction()
        
        if prediction:
            x = prediction.x
            y = prediction.y
            confidence = prediction.confidence
            
            # Debug: print coordinates and screen resolution
            print(f"Raw webgazer: x={x}, y={y}, Screen: {W}x{H}, Confidence: {confidence}")
            
            return {
                "x": x,
                "y": y,
                "confidence": confidence,
                "screen_width": W,
                "screen_height": H
            }
        else:
            return {"error": "No webgazer prediction available"}
    except ImportError:
        return {"error": "webgazer library not available"}
    except Exception as e:
        return {"error": f"webgazer error: {str(e)}"}