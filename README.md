# NeuroNurture

**An AI-Powered Autism Detection and Growth Platform for Children**

NeuroNurture is a comprehensive microservices-based platform designed to detect autism in children and provide personalized growth tracking through AI-powered insights, gameplay, and professional supervision.

## Overview

NeuroNurture combines cutting-edge AI technology with engaging gameplay to create a holistic approach to autism detection and child development. The platform serves three main user types: parents, schools, and doctors, each with specialized features and capabilities.

## Key Features

### Parent Features
- **Autism Detection**: Advanced AI algorithms to detect early signs of autism in children
- **AI Insights**: Comprehensive AI-powered analysis and recommendations for child development
- **Dedicated AI Agent**: Personalized AI assistant for tracking and supporting your child's growth journey
- **Growth Through Gameplay**: Interactive games designed to promote development while having fun

### School Features
- **Competition Management**: Organize and manage educational competitions for students
- **Progress Tracking**: Monitor and track the progress of all enrolled children
- **Child Comparison**: Compare development metrics between different students
- **Task Assignment**: Create and assign educational tasks to children
- **Subscription Model**: Paid subscription required for schools enrolling more than 10 children

### Doctor Features
- **Patient Progress Tracking**: Monitor the development progress of child patients
- **Dedicated Chat System**: Maintain secure, one-on-one communication with each child patient
- **Task Management**: Assign and track therapeutic tasks for children
- **Professional Subscription**: Paid subscription required for doctors supervising more than 3 children

### Platform Features
- **AI-Powered Issue Tracking**: Intelligent ticket system for support and feedback
- **Stripe Integration**: Secure payment processing for subscriptions and services
- **Secure Authentication**: JWT-based authentication with OAuth2 support
- **Responsive Design**: Cross-platform compatibility for web and mobile devices





## Project Structure

```
NeuroNurture/
├── Backend/
│   ├── Services/
│   │   ├── admin/                    # Admin service
│   │   ├── authentication/           # JWT auth service
│   │   ├── parent/                   # Parent service
│   │   ├── school/                   # School service
│   │   ├── doctor/                   # Doctor service
│   │   ├── nuru-chat/                # AI chat service
│   │   ├── dance-doodle/             # Dance game service
│   │   ├── gaze-game/                # Gaze tracking game
│   │   ├── gesture-game/             # Gesture control game
│   │   ├── mirror-posture-game/      # Mirror posture game
│   │   ├── repeat-with-me-game/      # Repeat with me game
│   │   ├── gateway/                  # API gateway
│   │   ├── config-server/            # Configuration server
│   │   └── discovery-service/        # Service discovery
├── Frontend/
│   ├── spark-play-detect-main/       # Main parent/child frontend
│   │   ├── src/
│   │   │   ├── features/             # Feature-based organization
│   │   │   │   ├── auth/             # Authentication features
│   │   │   │   ├── parent/           # Parent-specific features
│   │   │   │   ├── child/            # Child-specific features
│   │   │   │   ├── school/           # School features
│   │   │   │   ├── doctor/           # Doctor features
│   │   │   │   ├── games/            # Game components
│   │   │   │   └── shared/           # Shared utilities
│   │   │   ├── components/           # Reusable components
│   │   │   └── services/             # API services
│   │   └── package.json
│   └── admin-website/                # Admin dashboard
│       ├── src/
│       │   ├── features/             # Feature-based organization
│       │   │   ├── auth/             # Authentication
│       │   │   ├── dashboard/        # Admin dashboard
│       │   │   ├── users/            # User management
│       │   │   ├── tickets/          # Ticket management
│       │   │   ├── subscriptions/    # Subscription management
│       │   │   └── assistant/        # AI assistant
│       │   └── components/           # UI components
│       └── package.json
├── NuruAgent/                        # Python AI service
│   ├── main.py                       # AI service entry point
│   ├── requirements.txt              # Python dependencies
│   └── .env                          # Environment variables
└── README.md
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Python 3.8 or higher
- PostgreSQL 13 or higher
- MongoDB 4.4 or higher
- Maven 3.6 or higher

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NeuroNurture
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```bash
   # Database Configuration
   DATABASE_URL=jdbc:postgresql://localhost:5432/neuronurture
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neuronurture
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   
   # OAuth2 Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Email Configuration (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=your_email@domain.com
   
   # Payment Configuration (Stripe)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

### Backend Setup

1. **Start the services in order:**
   ```bash
   # 1. Start Discovery Service
   cd Backend/Services/discovery-service
   mvn spring-boot:run
   
   # 2. Start Config Server
   cd Backend/Services/config-server
   mvn spring-boot:run
   
   # 3. Start Gateway Service
   cd Backend/Services/gateway
   mvn spring-boot:run
   
   # 4. Start other services
   cd Backend/Services/authentication
   mvn spring-boot:run
   
   # Continue with other services...
   ```

### Frontend Setup

1. **Main Frontend (Parent/Child Interface)**
   ```bash
   cd Frontend/spark-play-detect-main
   npm install
   npm run dev
   ```

2. **Admin Website**
   ```bash
   cd Frontend/admin-website
   npm install
   npm run dev
   ```

### AI Service Setup

1. **Start the AI Agent**
   ```bash
   cd NuruAgent
   pip install -r requirements.txt
   python main.py
   ```





**NeuroNurture** - Empowering children with autism through technology and care.
