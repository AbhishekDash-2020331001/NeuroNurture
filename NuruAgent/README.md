# NeuroNurture AI Chatbot

A powerful AI-powered chatbot for the NeuroNurture educational platform that provides intelligent assistance for cognitive development games and school management.

## 🚀 Features

- **AI-Powered**: Uses GROQ's Llama 3.1 for intelligent responses
- **Database Integration**: Connected to PostgreSQL with NeuroNurture data
- **Role-Based Access**: Admin, School, Doctor, Child, Parent roles
- **Game Intelligence**: Knows all 5 NeuroNurture cognitive games
- **Real-time Chat**: Interactive chat interface
- **Context Awareness**: Provides role-specific responses

## 🎮 NeuroNurture Games

1. **Gaze Tracking** - Eye movement and cognitive training
2. **Gesture Control** - Hand movement and motor skills development
3. **Mirror Posture** - Physical coordination and posture training
4. **Dance Doodle** - Creative expression through movement
5. **Repeat With Me** - Memory and auditory processing

## 📁 Project Structure

```
sql2/
├── ai_agent.py          # Main AI agent with GROQ integration
├── main.py              # FastAPI application
├── config.py            # Configuration management
├── chat_interface.py    # Interactive command-line chat
├── web_chat.html        # Web-based chat interface
├── test_ai_agent.py     # Comprehensive test suite
├── start.py             # Simple startup script
├── requirements.txt     # Python dependencies
├── .env                 # Environment configuration
└── README.md           # This file
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Edit `.env` file with your credentials:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/neuronnurture

# GROQ AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 3. Start the Server
```bash
python start.py
```

The server will be available at: `http://localhost:8000`

## 🎯 Usage

### Method 1: Interactive Chat (Recommended)
```bash
python chat_interface.py
```

### Method 2: Web Interface
Open `web_chat.html` in your browser

### Method 3: API Testing
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user_role": "admin", "user_id": 1}'
```

## 🧪 Example Queries

**General:**
- "Hello, what can you help me with?"
- "Tell me about NeuroNurture"
- "What games are available?"

**Game-Specific:**
- "How does gaze tracking work?"
- "What is the gesture control game?"
- "Explain mirror posture training"

**Database:**
- "Show me the database tables"
- "What data do you have?"
- "Show me my progress"

**Role-Specific:**
- "Show me all children in my school" (School)
- "What children are assigned to me?" (Doctor)
- "Show me my game scores" (Child)
- "How is my child performing?" (Parent)

## 📊 API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed system status
- `POST /chat` - AI chat interface
- `GET /tables` - Database tables
- `GET /games` - Available games
- `GET /user/{id}` - User information
- `GET /progress/{id}` - User progress
- `GET /docs` - API documentation

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_ai_agent.py
```

## 🔧 Configuration

### Database
- PostgreSQL connection via `DATABASE_URL`
- Automatic table detection
- Role-based query security

### AI Service
- GROQ API integration
- Llama 3.1 model
- Context-aware responses

### Security
- Role-based access control
- Query validation
- Error handling

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure `.env` file with your database and GROQ API key**

3. **Start the server:**
   ```bash
   python start.py
   ```

4. **Start chatting:**
   ```bash
   python chat_interface.py
   ```

## 🎉 Your AI Agent is Ready!

The NeuroNurture AI Chatbot is now fully operational and ready to help users with:
- Game information and guidance
- Progress tracking and analytics
- Role-specific assistance
- Database queries and insights
- Educational support

**Happy chatting!** 🤖✨