import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")
