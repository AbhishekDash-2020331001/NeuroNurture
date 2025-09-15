# Child Performance Overview API

## Overview
The Child Performance Overview API provides AI-generated insights about a child's performance across all educational games in the NeuroNurture platform.

## Endpoint
```
GET /child/{child_id}/performance-overview
```

## Description
This endpoint retrieves performance data for a specific child across all five educational games and uses an LLM (Claude Sonnet 4) to generate personalized, encouraging insights and recommendations for parents.

## Parameters
- `child_id` (path parameter): The unique identifier of the child

## Response Format
```json
{
  "overview": "AI-generated performance insights and recommendations",
  "has_data": true,
  "child_info": {
    "name": "Child Name",
    "date_of_birth": "2020-01-01",
    "gender": "boy",
    "parent_id": 123,
    "parent_name": "Parent Name"
  },
  "performance_summary": {
    "child_info": { ... },
    "dance_doodle": {
      "sessions": 5,
      "recent_scores": [85, 90, 88],
      "average_score": 87.7,
      "latest_session": { ... }
    },
    "gesture_game": { ... },
    "gaze_game": { ... },
    "mirror_posture": { ... },
    "repeat_with_me": { ... }
  }
}
```

## Features
1. **Comprehensive Data Retrieval**: Fetches performance data from all 5 educational games
2. **AI-Powered Insights**: Uses Claude Sonnet 4 to generate personalized recommendations
3. **Parent-Friendly Language**: Provides clear, encouraging feedback for parents
4. **Performance Analytics**: Includes session counts, average scores, and recent performance trends
5. **Error Handling**: Graceful handling of missing data and service unavailability

## Games Covered
1. **Dance Doodle Game**: Creative expression through movement
2. **Gesture Game**: Hand movement and motor skills development
3. **Gaze Tracking Game**: Eye movement and cognitive training
4. **Mirror Posture Game**: Physical coordination and posture training
5. **Repeat With Me Game**: Memory and auditory processing

## Usage in Frontend
The API is integrated into the Parent Child Dashboard (`ChildPlaygroundPage`) where it displays:
- AI-generated performance insights
- Quick stats for each game
- Encouraging messages for parents
- Recommendations for continued development

## Error Handling
- Returns appropriate messages when no performance data is available
- Handles database connection issues gracefully
- Provides fallback messages when AI service is unavailable
- Includes retry functionality for failed requests

## Dependencies
- PostgreSQL database with game performance tables
- Anthropic Claude API for AI insights generation
- FastAPI for the REST API framework

