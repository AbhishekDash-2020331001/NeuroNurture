# Dance Doodle Game

## Overview
A React-based game that uses AI pose detection to recognize dance poses from uploaded images. Players are given a target pose and must upload an image of themselves performing that pose to score points.

## Features
- **AI Pose Detection**: Integrates with the backend dance pose detection API
- **10 Dance Poses**: Supports all poses from the trained model
- **Scoring System**: Players earn points for correct pose matches
- **Round-based Gameplay**: Progressive difficulty with multiple rounds
- **Timer**: 30-second time limit per game session
- **Real-time Feedback**: Immediate results with confidence scores

## Game Mechanics
1. **Start Game**: Click "Start Game" to begin
2. **Target Pose**: A random dance pose is displayed with emoji and name
3. **Upload Image**: Take a photo of yourself performing the pose and upload it
4. **AI Detection**: The backend processes the image and returns the detected pose
5. **Scoring**: Correct matches earn 10 points and advance to the next round
6. **Game End**: Game ends when time runs out or player chooses to stop

## Available Dance Poses
- 💪 Cool Arms (`cool_arms`)
- 🤸 Crossy Play (`crossy_play`)
- 😊 Happy Stand Left (`happy_stand_left`)
- 😊 Happy Stand Right (`happy_stand_right`)
- 🦅 Open Wings (`open_wings`)
- 🎯 Ready Pose (`ready_pose`)
- 🤫 Shh Fun (`shh_fun`)
- 🥊 Silly Boxer (`silly_boxer`)
- 🧘 Stretch Left (`stretch_left`)
- 🧘 Stretch Right (`stretch_right`)

## Technical Implementation
- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend Integration**: Calls `/predictDancePose` API endpoint
- **State Management**: React hooks for game state and UI updates
- **Responsive Design**: Mobile-friendly interface with grid layouts
- **Error Handling**: Graceful handling of API failures and edge cases

## API Endpoints Used
- `POST /predictDancePose` - Main pose detection endpoint
- `GET /dancePoseStatus` - Model status check (for debugging)

## File Structure
```
dance_doodle/
├── DanceDoodleGame.tsx    # Main game component
├── index.ts               # Export file
└── README.md              # This documentation
```

## Future Enhancements
- Camera integration for real-time pose capture
- Pose preview/instruction images
- Multiplayer support
- Leaderboard system
- Custom pose creation
- Difficulty levels
- Sound effects and animations

## Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- React Router for navigation
