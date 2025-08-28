# Repeat with Me Game Setup

## Overview
The Repeat with Me game is a speech recognition game where children listen to Bengali sentences and repeat them. The system then calculates a similarity score between the target and spoken text using GROQ's Whisper model optimized for Bengali language.

## Setup Requirements

### 1. GROQ API Key
You need a GROQ API key for speech transcription:
- Sign up at: https://console.groq.com/
- Get your API key
- Create a `.env` file in the `Games/model_server/` directory with:
```
GROQ_API_KEY=your_actual_api_key_here
```

### 2. Python Dependencies
Install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Audio Files
The game comes with 12 pre-recorded audio files in Bengali language:
- `audio1.mp3` to `audio12.mp3` in `public/repeatGame/audio/` directory
- Corresponding label files `label1.txt` to `label12.txt` in `public/repeatGame/label/` directory
- Each label file contains Bengali text that matches the audio content
- Example labels:
  - `label1.txt`: "আমি গান গাইতে ভালবাসি" (I love to sing)
  - `label2.txt`: "হেলো তুমি কেমন আছো" (Hello, how are you?)
  - `label8.txt`: "আমাদের জাতীয় ফল কাঁঠাল" (Our national fruit is jackfruit)

## How It Works

1. **Game Flow**: 5 rounds of audio playback and recording
2. **Audio Playback**: Child listens to pre-recorded sentences
3. **Recording**: Child records their voice repeating the sentence
4. **Transcription**: Audio is sent to GROQ for speech-to-text conversion
5. **Similarity Calculation**: Levenshtein distance algorithm calculates similarity score
6. **Results**: Display round-by-round scores and overall performance

## API Endpoints

- `POST /transcribe` - Submit audio for transcription
- `GET /game-results` - Get all game results
- `POST /clear-game-results` - Clear results for new game
- `GET /round-result/{round_number}` - Get specific round result

## Frontend Integration

The game is integrated into the NeuroNurture platform with:
- Game page: `/games/repeat-with-me`
- Insights page: `/games/repeat-with-me/insights`
- Dashboard card with progress tracking

## Troubleshooting

- **No Audio Files**: Check that audio files exist in the correct directory
- **Transcription Errors**: Verify GROQ API key is set correctly
- **Microphone Access**: Ensure browser has permission to access microphone
