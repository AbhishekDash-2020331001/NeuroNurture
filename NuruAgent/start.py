#!/usr/bin/env python3
"""
Simple startup script for NeuroNurture AI Chatbot
"""

import uvicorn
from config import settings

if __name__ == "__main__":
    print("🚀 Starting NeuroNurture AI Chatbot...")
    print(f"📡 Server: http://localhost:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    print("🛑 Press Ctrl+C to stop")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
