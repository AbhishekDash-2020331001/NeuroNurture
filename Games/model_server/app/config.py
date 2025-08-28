import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# GROQ API Key for speech transcription
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Other configuration variables can be added here
HF_API_KEY = os.getenv("HF_API_KEY")
