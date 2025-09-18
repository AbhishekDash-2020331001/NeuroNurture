# AI-Powered Ticket Classification Integration

This document describes the integration of AI-powered ticket classification and message refinement into the NeuroNurture parent ticketing system.

## Overview

The system now uses a Python-based AI service to:
1. **Classify ticket priority** (LOW, MEDIUM, HIGH, URGENT) based on content analysis
2. **Refine and improve** user messages for clarity and professionalism
3. **Provide reasoning** for priority classification decisions

## Architecture

### Frontend Components
- **NewTicketPage**: Enhanced with AI processing capabilities
- **aiService.ts**: Service layer for AI API communication
- **AI Preview Section**: Shows refined message and priority before submission

### Backend Services
- **Python AI Service** (Port 8005): Handles ticket classification
- **Parent Service** (Port 8082): Manages ticket creation and storage
- **Admin Service** (Port 8090): Handles admin ticket management

## Features

### 1. AI Enhancement Button
- Located next to the description field
- Processes both subject and description
- Shows loading state during processing
- Disabled when fields are empty
- **Required**: Must be used before ticket submission

### 2. AI Preview Section
- **Refined Message**: Grammatically corrected and professional version
- **AI Reasoning**: Explanation for priority classification
- **Action Buttons**: Accept refined message or keep original
- **Note**: Priority is automatically determined and displayed separately

### 3. AI-Determined Priority Display
- **Automatic Priority**: AI determines priority based on content analysis
- **No Manual Selection**: Parents cannot manually select priority
- **Visual Indicator**: Color-coded badge showing determined priority
- **Priority Levels**:
  - **URGENT**: System crashes, security issues, data loss, payment failures
  - **HIGH**: Major feature broken, significant UX issues
  - **MEDIUM**: Minor bugs, feature requests, general questions
  - **LOW**: Cosmetic issues, minor suggestions, informational requests

### 4. Mandatory AI Processing
- **Required Step**: AI processing is mandatory before ticket submission
- **Validation**: Submit button disabled until AI processing is complete
- **User Guidance**: Clear messaging about AI processing requirement

## API Endpoints

### AI Service (Port 8005)
```
POST /ticket/classify
{
  "message": "Subject: ...\n\nDescription: ...",
  "user_type": "parent",
  "user_id": 1
}

Response:
{
  "priority": "HIGH",
  "rewritten_message": "Refined message...",
  "reasoning": "Priority classification reasoning...",
  "error": false
}
```

### Health Check
```
GET /health
Response: Service status and database connection info
```

## Usage Workflow

1. **Parent fills out ticket form** (subject + description)
2. **Clicks "AI Enhance" button** to process with AI (REQUIRED)
3. **Reviews AI suggestions** in preview section:
   - Refined message text
   - AI reasoning for priority classification
4. **Chooses action**:
   - Accept refined message (updates description)
   - Keep original message
5. **Views AI-determined priority** (displayed separately, cannot be changed)
6. **Submits ticket** with final content and AI-determined priority

## Setup Instructions

### 1. Start AI Service
```bash
cd NuruAgent
pip install -r requirements.txt
python main.py
```

### 2. Verify AI Service
```bash
python test_ai_integration.py
```

### 3. Start Frontend
```bash
cd Frontend/spark-play-detect-main
npm install
npm run dev
```

## Configuration

### Environment Variables (AI Service)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/neuronurture
ANTHROPIC_API_KEY=your_anthropic_api_key
HOST=0.0.0.0
PORT=8005
DEBUG=True
```

### Frontend Configuration
- AI service URL: `http://localhost:8005`
- Parent service URL: `http://localhost:8082`
- Auth service URL: `http://localhost:8080`

## Error Handling

### AI Service Errors
- **Connection failed**: Shows fallback message, allows manual priority selection
- **Processing error**: Displays error alert, user can retry
- **Invalid response**: Falls back to MEDIUM priority

### Frontend Errors
- **Network issues**: Graceful degradation to manual form
- **Validation errors**: Clear error messages
- **Loading states**: Visual feedback during processing

## Benefits

1. **Improved Ticket Quality**: AI refines messages for clarity
2. **Better Priority Assignment**: Consistent priority classification
3. **Reduced Admin Workload**: Pre-processed, clear tickets
4. **Enhanced User Experience**: Helpful AI assistance
5. **Consistent Formatting**: Professional ticket presentation

## Future Enhancements

1. **Real-time Processing**: Auto-classify as user types
2. **Learning System**: Improve based on admin feedback
3. **Multi-language Support**: Process tickets in different languages
4. **Category Suggestions**: Auto-suggest ticket categories
5. **Escalation Rules**: Auto-escalate based on content analysis

## Troubleshooting

### Common Issues

1. **AI Service Not Responding**
   - Check if service is running on port 8005
   - Verify environment variables
   - Check logs for errors

2. **Classification Not Working**
   - Ensure Anthropic API key is valid
   - Check database connection
   - Verify message format

3. **Frontend Integration Issues**
   - Check CORS settings
   - Verify API endpoints
   - Check browser console for errors

### Debug Mode
Enable debug mode in AI service for detailed logging:
```bash
DEBUG=True python main.py
```

## Security Considerations

1. **API Key Protection**: Store Anthropic API key securely
2. **Input Validation**: Sanitize user input before AI processing
3. **Rate Limiting**: Implement rate limiting for AI endpoints
4. **Data Privacy**: Ensure ticket content is handled securely

## Performance

- **AI Processing Time**: ~2-3 seconds per request
- **Caching**: Consider caching for similar requests
- **Timeout Handling**: 30-second timeout for AI requests
- **Fallback**: Graceful degradation when AI unavailable
