#!/usr/bin/env python3
"""
Startup script for the NeuroNurture Model Server
This script starts the FastAPI server with proper configuration
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'opencv-python',
        'numpy',
        'mediapipe',
        'joblib'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install missing packages with:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def main():
    print("🚀 Starting NeuroNurture Model Server...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Error: Please run this script from the model_server directory")
        print("   cd Games/model_server")
        print("   python start_server.py")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    print("\n🔧 Starting FastAPI server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📖 API documentation at: http://localhost:8000/docs")
    print("🔄 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
