import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Anthropic Claude AI Configuration
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY")


    # Application Configuration
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8005"))

settings = Settings()
