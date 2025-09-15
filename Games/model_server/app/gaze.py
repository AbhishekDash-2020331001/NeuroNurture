# import time
# import ctypes
# from eyeware import beam_eye_tracker as beam

# # Get screen size
# def get_screen_size():
#     user32 = ctypes.windll.user32
#     user32.SetProcessDPIAware()
#     return user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)

# W, H = get_screen_size()
# vp = beam.ViewportGeometry()
# vp.point_00 = beam.Point(0, 0)
# vp.point_11 = beam.Point(W - 1, H - 1)

# api = None
# CONF_MAP = {0: "LOST_TRACKING", 1: "LOW", 2: "MEDIUM", 3: "HIGH"}

# def initialize_eye_tracker():
#     global api
#     if api is None:
#         try:
#             print("Initializing Eyeware Beam eye tracker...")
#             print(f"Viewport: {vp.point_00} to {vp.point_11}")
#             api = beam.API("Python Gaze API", vp)
#             print("API created, attempting to start tracker...")
#             api.attempt_starting_the_beam_eye_tracker()
#             print("Eyeware Beam eye tracker initialized successfully")
            
#             # Test if we can get tracking data
#             try:
#                 state = api.get_latest_tracking_state_set()
#                 print(f"Initial tracking state test: {state}")
#             except Exception as test_error:
#                 print(f"Warning: Could not get initial tracking state: {test_error}")
                
#         except Exception as e:
#             print(f"Error initializing eye tracker: {e}")
#             api = None
#             raise e

# def get_gaze():
#     global api
#     if api is None:
#         print("API is None, initializing eye tracker...")
#         initialize_eye_tracker()
    
#     try:
#         if api is None:
#             print("API is still None after initialization attempt")
#             return {"error": "Failed to initialize eye tracker"}
        
#         print("Getting latest tracking state...")
#         state = api.get_latest_tracking_state_set()
#         print(f"Tracking state: {state}")
        
#         # Check if state exists
#         if not state:
#             print("No tracking state available - Beam Eye Tracker may not be running")
#             return {"error": "Beam Eye Tracker not running - please start the Beam Eye Tracker software"}
        
#         # Check if user state exists
#         user_state = state.user_state()
#         if not user_state:
#             print("No user state available - no user detected")
#             return {"error": "No user detected - please ensure you are visible to the camera"}
        
#         gaze = user_state.unified_screen_gaze
#         pog = gaze.point_of_regard
#         conf = gaze.confidence
        
#         # Debug: print coordinates and screen resolution
#         print(f"Raw gaze: x={pog.x}, y={pog.y}, conf={conf}, Screen: {W}x{H}")
        
#         # Check if we have valid tracking data
#         if conf == 0:  # LOST_TRACKING
#             return {"error": "Eye tracker needs calibration - please look at the screen and ensure good lighting"}
#         elif conf == 1:  # LOW confidence
#             return {"error": "Low tracking confidence - please sit closer to the camera and ensure good lighting"}
#         elif pog.x == 0 and pog.y == 0:
#             return {"error": "No gaze data detected - please look at the screen and ensure the camera can see your eyes"}
        
#         return {
#             "x": pog.x,
#             "y": pog.y,
#             "confidence": CONF_MAP.get(conf, "UNKNOWN"),
#             "screen_width": W,
#             "screen_height": H
#         }
#     except Exception as e:
#         print(f"Error getting gaze data: {e}")
#         import traceback
#         traceback.print_exc()
#         return {"error": f"Gaze tracking error: {str(e)}"}
