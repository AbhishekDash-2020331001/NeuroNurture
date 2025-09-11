from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import settings
from simple_langchain_agent import simple_langchain_agent
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NeuroNurture AI Chatbot",
    description="AI-powered chatbot for NeuroNurture educational platform",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting NeuroNurture AI Chatbot...")
    logger.info("Application started successfully")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "NeuroNurture AI Chatbot is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    db_status = simple_langchain_agent.db_connection is not None
    llm_status = simple_langchain_agent.claude_client is not None
    return {
        "status": "healthy",
        "database": "connected" if db_status else "disconnected",
        "ai_service": "connected" if llm_status else "disconnected",
        "version": "4.0.0",
        "framework": "Compatible LangChain + Claude"
    }

@app.post("/chat")
async def chat_endpoint(request: dict):
    """AI-powered chat endpoint"""
    try:
        message = request.get("message", "")
        user_type = request.get("user_type", "admin")  # Default to admin
        user_id = request.get("user_id", None)  # Optional user ID
        
        logger.info(f"Received message from {user_type}: {message[:50]}...")
        
        # Process the message with user type restrictions
        response = simple_langchain_agent.process_message(message, user_type, user_id)
        
        logger.info("AI response generated successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        return {"response": "Sorry, I encountered an error. Please try again.", "error": True}

@app.get("/roles")
async def get_available_roles():
    """Get list of available user roles"""
    return {
        "roles": [
            {"value": "admin", "label": "Admin"},
            {"value": "parent", "label": "Parent"},
            {"value": "school", "label": "School"}
        ]
    }

@app.get("/parents")
async def get_parents():
    """Get list of available parents"""
    try:
        if simple_langchain_agent.db_connection:
            cursor = simple_langchain_agent.db_connection.cursor()
            cursor.execute("""
                SELECT p.id, p.name, p.email, COUNT(c.id) as children_count
                FROM parent p
                LEFT JOIN child c ON p.id = c.parent_id
                GROUP BY p.id, p.name, p.email
                ORDER BY p.name
            """)
            parents = []
            for row in cursor.fetchall():
                parents.append({
                    "id": row[0],
                    "name": row[1] or f"Parent {row[0]}",
                    "email": row[2] or "No email",
                    "children_count": row[3]
                })
            cursor.close()
            return {"parents": parents}
        else:
            return {"error": "Database not connected", "parents": []}
    except Exception as e:
        return {"error": str(e), "parents": []}

@app.get("/schools")
async def get_schools():
    """Get list of available schools"""
    try:
        if simple_langchain_agent.db_connection:
            cursor = simple_langchain_agent.db_connection.cursor()
            cursor.execute("""
                SELECT s.id, s.school_name, s.city, s.state, s.email, s.student_count, COUNT(c.id) as enrolled_children
                FROM schools s
                LEFT JOIN child c ON s.id = c.school_id
                GROUP BY s.id, s.school_name, s.city, s.state, s.email, s.student_count
                ORDER BY s.school_name
            """)
            schools = []
            for row in cursor.fetchall():
                schools.append({
                    "id": row[0],
                    "name": row[1] or f"School {row[0]}",
                    "location": f"{row[2]}, {row[3]}" if row[2] and row[3] else "Location not specified",
                    "email": row[4] or "No email",
                    "student_count": row[5] or 0,
                    "enrolled_children": row[6]
                })
            cursor.close()
            return {"schools": schools}
        else:
            return {"error": "Database not connected", "schools": []}
    except Exception as e:
        return {"error": str(e), "schools": []}

@app.get("/tables")
async def get_tables():
    """Get database tables"""
    try:
        if simple_langchain_agent.db_connection:
            cursor = simple_langchain_agent.db_connection.cursor()
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return {"tables": tables}
        else:
            return {"error": "Database not connected", "tables": []}
    except Exception as e:
        return {"error": str(e), "tables": []}

@app.get("/games")
async def get_games():
    """Get available games"""
    return {
        "games": [
            {"name": "gaze_tracking", "title": "Gaze Tracking", "description": "Eye movement and cognitive training"},
            {"name": "gesture_control", "title": "Gesture Control", "description": "Hand movement and motor skills development"},
            {"name": "mirror_posture", "title": "Mirror Posture", "description": "Physical coordination and posture training"},
            {"name": "dance_doodle", "title": "Dance Doodle", "description": "Creative expression through movement"},
            {"name": "repeat_with_me", "title": "Repeat With Me", "description": "Memory and auditory processing"}
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )







