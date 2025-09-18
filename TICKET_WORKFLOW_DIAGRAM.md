# AI-Enhanced Ticket Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARENT TICKET SUBMISSION                    │
└─────────────────────────────────────────────────────────────────┘

1. Parent fills out ticket form
   ┌─────────────────┐    ┌─────────────────┐
   │ Subject Field   │    │ Description     │
   │ (Required)      │    │ (Required)      │
   └─────────────────┘    └─────────────────┘
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
2. Parent clicks "AI Enhance" button
   ┌─────────────────────────────────┐
   │        AI PROCESSING            │
   │  ┌─────────────────────────┐    │
   │  │  Python AI Service      │    │
   │  │  (Port 8005)            │    │
   │  │                         │    │
   │  │  POST /ticket/classify  │    │
   │  │  - Analyzes content     │    │
   │  │  - Classifies priority  │    │
   │  │  - Refines message      │    │
   │  └─────────────────────────┘    │
   └─────────────────────────────────┘
                       │
                       ▼
3. AI Preview Section appears
   ┌─────────────────────────────────┐
   │     AI ENHANCEMENT PREVIEW      │
   │                                 │
   │  ┌─────────────────────────┐    │
   │  │ Suggested Priority:     │    │
   │  │ [HIGH] [MEDIUM] [LOW]   │    │
   │  └─────────────────────────┘    │
   │                                 │
   │  ┌─────────────────────────┐    │
   │  │ Refined Message:        │    │
   │  │ "Clear, professional    │    │
   │  │  version of original"   │    │
   │  └─────────────────────────┘    │
   │                                 │
   │  ┌─────────────────────────┐    │
   │  │ AI Reasoning:           │    │
   │  │ "Priority HIGH because  │    │
   │  │  game crashes affect    │    │
   │  │  child's therapy"       │    │
   │  └─────────────────────────┘    │
   │                                 │
   │  [Accept Suggestion] [Keep Original] │
   └─────────────────────────────────┘
                       │
                       ▼
4. Parent chooses action
   ┌─────────────────┐    ┌─────────────────┐
   │ Accept AI       │    │ Keep Original   │
   │ Suggestion      │    │ Content         │
   │                 │    │                 │
   │ Updates form    │    │ No changes      │
   │ with AI data    │    │ to form         │
   └─────────────────┘    └─────────────────┘
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
5. Parent submits final ticket
   ┌─────────────────────────────────┐
   │        TICKET CREATION          │
   │                                 │
   │  ┌─────────────────────────┐    │
   │  │ Parent Service          │    │
   │  │ (Port 8082)             │    │
   │  │                         │    │
   │  │ POST /api/tickets       │    │
   │  │ - Creates ticket        │    │
   │  │ - Auto-assigns admin    │    │
   │  │ - Stores in MongoDB     │    │
   │  └─────────────────────────┘    │
   └─────────────────────────────────┘
                       │
                       ▼
6. Admin receives ticket
   ┌─────────────────────────────────┐
   │        ADMIN DASHBOARD          │
   │                                 │
   │  ┌─────────────────────────┐    │
   │  │ Admin Service           │    │
   │  │ (Port 8090)             │    │
   │  │                         │    │
   │  │ GET /api/admin/tickets  │    │
   │  │ - Lists assigned tickets│    │
   │  │ - Shows AI-refined msg  │    │
   │  │ - Displays priority     │    │
   │  └─────────────────────────┘    │
   └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

Frontend (React)          AI Service (Python)        Backend (Java)
     │                           │                         │
     │ 1. User input             │                         │
     ├──────────────────────────►│                         │
     │                           │                         │
     │ 2. AI Enhance click       │                         │
     ├──────────────────────────►│                         │
     │                           │ 3. Classify ticket      │
     │                           ├─────────────────────────►│
     │                           │ 4. Return classification │
     │ 5. Show AI preview        │◄─────────────────────────┤
     │◄──────────────────────────┤                         │
     │                           │                         │
     │ 6. User accepts/rejects   │                         │
     │                           │                         │
     │ 7. Submit final ticket    │                         │
     ├─────────────────────────────────────────────────────►│
     │                           │ 8. Create ticket        │
     │ 9. Redirect to ticket     │◄─────────────────────────┤
     │◄─────────────────────────────────────────────────────┤
     │                           │                         │
     │ 10. Admin views ticket    │                         │
     │◄─────────────────────────────────────────────────────┤

┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                            │
└─────────────────────────────────────────────────────────────────┘

AI Service Unavailable:
├── Show fallback message
├── Allow manual priority selection
└── Continue with original content

Network Error:
├── Display error alert
├── Allow retry
└── Graceful degradation

Invalid AI Response:
├── Fallback to MEDIUM priority
├── Use original message
└── Log error for debugging
