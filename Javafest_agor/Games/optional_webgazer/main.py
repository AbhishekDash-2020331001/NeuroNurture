from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Screen dimensions (adjust to your screen resolution)
W, H = 1920, 1080  

# Confidence mapping
CONF_MAP = {
    "high": "HIGH",
    "med": "MEDIUM",
    "low": "LOW"
}

# Store last gaze data
last_gaze = None  

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def index():
    """
    Serves the WebGazer page (runs automatically in browser when server starts).
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebGazer FastAPI</title>
        <script src="https://webgazer.cs.brown.edu/webgazer.js"></script>
    </head>
    <body>
        <h1>WebGazer is running...</h1>
        <p>Keep this page open so gaze data is sent to FastAPI.</p>
        <script>
            window.onload = function() {{
                webgazer.setGazeListener(function(data, elapsedTime) {{
                    if (data == null) return;

                    // Add a fake confidence value (WebGazer doesn’t provide one natively)
                    let conf = "high";

                    fetch("http://127.0.0.1:8000/gaze", {{
                        method: "POST",
                        headers: {{"Content-Type": "application/json"}},
                        body: JSON.stringify({{
                            x: data.x,
                            y: data.y,
                            confidence: conf
                        }})
                    }});
                }}).begin();
            }};
        </script>
    </body>
    </html>
    """


@app.post("/gaze")
async def receive_gaze(request: Request):
    """
    Receives gaze data from WebGazer.
    """
    global last_gaze
    data = await request.json()

    conf = data.get("confidence", "low")  # default "low"
    last_gaze = {
        "x": data.get("x"),
        "y": data.get("y"),
        "confidence": CONF_MAP.get(conf, "UNKNOWN"),
        "screen_width": W,
        "screen_height": H
    }
    return {"status": "received"}


@app.get("/current-gaze")
async def get_current_gaze():
    """
    Returns the latest gaze data for your React frontend (or any client).
    """
    if last_gaze:
        return last_gaze
    return {"error": "No gaze data"}
