# NeuroNurture Model Server

This is the Python backend server that provides AI/ML services for the NeuroNurture application, including gaze tracking, gesture recognition, and posture detection.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
# Option 1: Use the startup script (recommended)
python start_server.py

# Option 2: Manual start
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Verify the Server
- Server will be running at: http://localhost:8000
- API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/current-gaze

## 📡 Available Endpoints

### Gaze Tracking
- `GET /current-gaze` - Get real-time gaze coordinates (MediaPipe-based)
- `GET /getGaze` - Get gaze data from Eyeware Beam tracker (if available)
- `GET /gazeStatus` - Get eye tracker status

### AI Models
- `POST /predictPosture` - Analyze facial posture from image
- `POST /predictGesture` - Recognize hand gestures from image
- `GET /gesture-labels` - Get available gesture labels

## 🔧 Gaze Tracking Methods

### 1. MediaPipe (Default)
- Uses webcam + MediaPipe Face Mesh
- No additional hardware required
- Works with any webcam
- Real-time iris tracking

### 2. Eyeware Beam (Optional)
- Professional eye tracking hardware
- Higher accuracy
- Requires Eyeware Beam device
- Install with: `pip install eyeware`

## 🎮 Frontend Integration

The React frontend connects to this server at `http://localhost:8000` for:
- Real-time gaze tracking in the balloon pop game
- Gesture recognition in the gesture game
- Posture detection in the mirror posture game

## 🐛 Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   # Find and kill the process
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

2. **Webcam not working**
   - Ensure webcam is not used by another application
   - Check webcam permissions
   - Try different webcam index in `main.py`

3. **Dependencies missing**
   ```bash
   pip install -r requirements.txt
   ```

4. **CORS errors**
   - Server is configured to allow CORS from localhost:3000 and localhost:8081
   - If using different ports, update `main.py`

### Debug Mode
Enable debug logging by setting environment variable:
```bash
export PYTHONPATH=.
python -m uvicorn app.main:app --reload --log-level debug
```

## 📁 Project Structure

```
model_server/
├── app/
│   ├── main.py          # FastAPI server and MediaPipe gaze tracking
│   ├── gaze.py          # Eyeware Beam gaze tracking
│   ├── predictor.py     # ML models for gesture/posture
│   └── models/          # Trained ML models
├── requirements.txt     # Python dependencies
├── start_server.py      # Startup script
└── README.md           # This file
```

## 🔄 Development

### Adding New Endpoints
1. Add route in `app/main.py`
2. Update CORS if needed
3. Test with frontend

### Updating Models
1. Replace model files in `app/models/`
2. Update `predictor.py` if needed
3. Restart server

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure webcam is working
4. Check network connectivity between frontend and backend
