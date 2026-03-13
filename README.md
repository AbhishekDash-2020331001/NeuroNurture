<div align="center">

# NeuroNurture

### A Unified Autism Support Platform Bridging Parents, Doctors & Schools

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

NeuroNurture is a microservices-based platform that combines **AI-driven autism detection**, **interactive therapeutic games**, and a **collaborative care network** connecting parents, doctors, and schools around a shared child profile. The platform uses machine learning models trained on gameplay data to compute an **Autism Likelihood Index (ALI)**, while providing each stakeholder with dedicated tools, an AI assistant (Nuru), and real-time progress tracking.

## Table of Contents

- [Architecture](#architecture)
- [Key Features](#key-features)
- [Interactive Games & ML Pipeline](#interactive-games--ml-pipeline)
- [ALI Detection Model](#ali-detection-model)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Service Ports Reference](#service-ports-reference)
- [Environment Variables](#environment-variables)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                             │
│   ┌───────────────────────┐       ┌───────────────────────┐        │
│   │  Main App (React/TS)  │       │  Admin Dashboard      │        │
│   │  Port 8081            │       │  Port 3001            │        │
│   │  Parent│School│Doctor │       │  User & Ticket Mgmt   │        │
│   └───────────┬───────────┘       └───────────┬───────────┘        │
└───────────────┼───────────────────────────────┼────────────────────┘
                │                               │
                ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (8085)                           │
│              Spring Cloud Gateway + Route Configuration             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  DISCOVERY       │  │  CONFIG SERVER   │  │  AUTH SERVICE        │
│  Eureka (8761)   │  │  (8888)          │  │  JWT + OAuth2 (8080) │
└─────────────────┘  └──────────────────┘  └──────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
┌────────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│  Parent    ││  School  ││  Doctor  ││  Admin   ││ Nuru Chat│
│  (8082)    ││  (8091)  ││  (8093)  ││  (8090)  ││  (8094)  │
└─────┬──────┘└────┬─────┘└────┬─────┘└──────────┘└──────────┘
      │            │           │
      └────────────┼───────────┘
                   ▼
      ┌─────────────────────────┐
      │     CHILD PROFILE       │
      │  (Central Shared Entity)│
      │  parent_id │ school_id  │
      │       doctor_id         │
      └────────────┬────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐  ┌───────────┐  ┌───────────┐
│ Games  │  │ ML Model  │  │  ALI      │
│Services│  │ Server    │  │  Model    │
│(5 games│  │ (8000)    │  │  (8088)   │
│ 8083-  │  │ MediaPipe │  │  Autism   │
│  8089) │  │ OpenCV    │  │  Detection│
└────────┘  └───────────┘  └───────────┘
                   │
           ┌───────┴────────┐
           ▼                ▼
    ┌────────────┐   ┌────────────┐
    │ PostgreSQL │   │  MongoDB   │
    │    (5432)  │   │  (Atlas)   │
    └────────────┘   └────────────┘
```

### The Parent-Doctor-School Bridge

The **child profile** is the central entity that connects all three stakeholders:

- **Parent** creates and owns the child profile, tracks development, and initiates games
- **School** sends enrollment requests to parents; upon acceptance, the child is linked to the school for academic tracking, competitions, and task assignments
- **Doctor** enrolls into a child's care team directly; can track progress, assign therapeutic tasks, and communicate via a dedicated chat system
- Each child can be linked to **one school** and **one doctor** simultaneously, creating a unified support network

This architecture ensures that every stakeholder has visibility into the child's progress while the parent retains control over access.

## Key Features

### For Parents
- **Autism Detection** — AI-powered screening through 5 interactive games that feed into the ALI prediction model
- **AI Insights & Nuru Assistant** — Personalized recommendations and a conversational AI agent for guidance
- **Child Profile Management** — Track growth metrics, game scores, and developmental milestones
- **Enrollment Control** — Accept or decline school enrollment requests; manage doctor assignments
- **Support Tickets** — AI-classified issue tracking for platform support

### For Schools
- **Student Progress Dashboard** — Monitor and compare development metrics across enrolled children
- **Competition & Tournament Management** — Organize educational events and track participation
- **Task Assignment System** — Create and assign structured educational tasks
- **Nuru AI Assistant** — School-specific insights and recommendations
- **Subscription Model** — Free for up to 10 children; paid subscription via Stripe for larger enrollments

### For Doctors
- **Patient Monitoring** — Comprehensive view of each child's game performance and developmental progress
- **Secure Chat System** — One-on-one encrypted communication channel with each patient
- **Therapeutic Task Management** — Assign, track, and evaluate therapeutic exercises
- **Nuru AI Assistant** — Clinical insights tailored for healthcare professionals
- **Subscription Model** — Free for up to 3 patients; paid subscription via Stripe beyond that

### For Admins
- **User Management** — Approve/reject doctor and school registrations, manage all platform users
- **Ticket Resolution** — Handle AI-classified support tickets from parents
- **Subscription Oversight** — Monitor and manage Stripe subscriptions across the platform
- **Platform Analytics** — AI-powered insights into platform health and usage

### Platform-Wide
- **JWT + OAuth2 Authentication** — Secure login with Google OAuth2 support for parents
- **Email Verification** — SendGrid-powered verification flow for new registrations
- **Stripe Payments** — Integrated subscription billing for schools and doctors
- **Responsive UI** — Modern interface built with shadcn/ui and Tailwind CSS

## Interactive Games & ML Pipeline

NeuroNurture features **5 interactive therapeutic games**, each targeting specific cognitive and motor skills. Game sessions are processed by a dedicated ML model server using MediaPipe, OpenCV, and scikit-learn.

| Game | Port | What It Measures | ML Technique |
|------|------|------------------|--------------|
| **Gaze Game** | 8086 | Eye contact & visual attention | Eyeware Beam eye tracking |
| **Gesture Game** | 8084 | Hand gesture recognition & motor planning | MediaPipe Hands + Random Forest |
| **Mirror Posture Game** | 8083 | Body imitation & spatial awareness | MediaPipe Pose + Face Detection |
| **Dance Doodle** | 8087 | Rhythm, coordination & creative expression | MediaPipe PoseLandmarker + Random Forest |
| **Repeat With Me** | 8089 | Speech pattern & language development | Groq Whisper (Bengali transcription) + Levenshtein similarity |

All game inference runs through the **Games Model Server** (port 8000), which exposes endpoints for real-time pose prediction, gesture classification, gaze tracking, and speech transcription.

## ALI Detection Model

The **Autism Likelihood Index (ALI)** model is a machine learning pipeline that aggregates game performance data to predict autism likelihood.

- **Algorithm**: Logistic Regression with Stratified K-Fold cross-validation
- **Training Data**: Composite scores from all 5 games (age, game-specific metrics, `is_asd` labels)
- **Model Architecture**: Supports flexible game subsets via a bitmask — can predict from any combination of available game data using pre-trained models for each combination
- **API Endpoint**: `POST /predict_ali_score` accepts game scores and returns a probability score
- **Location**: `ALI_Model/` — training notebook (`ALI_model_pipeline.ipynb`) and prediction API (`model/main.py`)

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Core language |
| Spring Boot 3.1–3.2 | Microservice framework |
| Spring Cloud (Eureka, Config, Gateway) | Service discovery, centralized config, API routing |
| Spring Security + JWT (jjwt 0.11.5) | Authentication & authorization |
| Spring Data JPA | ORM & database access |
| Resilience4j | Circuit breaker & fault tolerance |
| PostgreSQL 15 | Primary relational database |
| MongoDB | Chat, tickets & document storage |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| TanStack Query 5 | Server state management & caching |
| Radix UI + shadcn/ui | Accessible component library |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization & charts |
| React Hook Form + Zod | Form handling & validation |
| Stripe.js | Payment integration |
| MediaPipe Tasks Vision | In-browser ML inference for games |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| FastAPI + Uvicorn | Python API servers |
| LangChain + Anthropic Claude | Nuru AI agent conversational engine |
| Google Gemini | AI insights in frontend |
| MediaPipe (Pose, Hands, Face) | Real-time body & gesture tracking |
| OpenCV | Computer vision processing |
| scikit-learn | Game classifiers & ALI model |
| Groq Whisper | Bengali speech transcription |
| Eyeware Beam | Eye gaze tracking |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker + Docker Compose | PostgreSQL & pgAdmin containerization |
| Spring Cloud Eureka | Service registry & discovery |
| Spring Cloud Config Server | Centralized configuration management |
| SendGrid | Transactional email delivery |
| Stripe | Subscription payment processing |

## Project Structure

```
NeuroNurture/
│
├── Backend/
│   ├── Services/
│   │   ├── discovery/                # Eureka service registry (8761)
│   │   ├── config-server/            # Centralized configuration (8888)
│   │   ├── gateway/                  # API gateway with route mapping (8085)
│   │   ├── jwt_auth/                 # JWT + OAuth2 authentication (8080)
│   │   ├── parent/                   # Parent & child management (8082)
│   │   ├── school/                   # School management & enrollment (8091)
│   │   ├── doctor/                   # Doctor management & chat (8093)
│   │   ├── admin/                    # Admin dashboard backend (8090)
│   │   ├── nuru_chat/                # Nuru AI chat service (8094)
│   │   ├── gaze_game/                # Gaze tracking game service (8086)
│   │   ├── gesture_game/             # Gesture recognition game service (8084)
│   │   ├── mirror_posture_game/      # Mirror posture game service (8083)
│   │   ├── dance_doodle/             # Dance & doodle game service (8087)
│   │   └── repeat_with_me_game/      # Speech repetition game service (8089)
│   └── docker-compose.yml            # PostgreSQL 15 + pgAdmin
│
├── Frontend/
│   ├── main-frontend/                # Primary app — Parent, School, Doctor UI
│   │   └── src/
│   │       ├── features/             # Feature modules (auth, parent, child, school, doctor, games)
│   │       ├── components/           # Shared UI components (shadcn/ui)
│   │       └── services/             # API client layer
│   └── admin-website/                # Admin dashboard
│       └── src/
│           └── features/             # Dashboard, users, tickets, subscriptions, AI assistant
│
├── NuruAgent/                        # AI conversational agent (FastAPI)
│   ├── main.py                       # Entry point
│   ├── ai_agent.py                   # LangChain + Gemini agent logic
│   ├── config.py                     # API keys & DB config
│   └── requirements.txt
│
├── Games/
│   └── model_server/                 # ML inference server for all games (FastAPI)
│       ├── app/
│       │   ├── main.py               # FastAPI app with game endpoints
│       │   ├── dance_doodle.py        # Pose prediction with MediaPipe
│       │   ├── gesture.py             # Hand gesture classification
│       │   ├── mirror_posture.py      # Face & posture detection
│       │   ├── repeat_with_me.py      # Speech transcription & similarity
│       │   └── gaze.py                # Eye gaze tracking
│       ├── models/                    # Trained sklearn models (.pkl)
│       └── requirements.txt
│
├── ALI_Model/                        # Autism Likelihood Index
│   ├── ALI_model_pipeline.ipynb      # Training notebook (Logistic Regression + CV)
│   └── model/
│       ├── main.py                   # Prediction API endpoint
│       ├── all_game_models.pkl        # Pre-trained models for game combinations
│       └── requirements.txt
│
└── README.md
```

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Java | 17+ |
| Node.js | 18+ |
| Python | 3.10+ |
| PostgreSQL | 15+ (or use Docker) |
| MongoDB | 4.4+ (or MongoDB Atlas) |
| Maven | 3.6+ |
| Docker | Latest (optional, for database) |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/NeuroNurture.git
cd NeuroNurture
```

### 2. Database Setup

**Option A — Docker (recommended):**

```bash
cd Backend
docker-compose up -d
```

This starts PostgreSQL 15 on port `5432` and pgAdmin on port `5050`.

**Option B — Manual:**

Create a PostgreSQL database named `neuronurture` and configure your connection credentials in the environment variables below.

### 3. Backend Services

Start services **in this order** — discovery and config must be running before other services register.

```bash
# Step 1: Service Discovery (Eureka)
cd Backend/Services/discovery
mvn spring-boot:run

# Step 2: Config Server
cd Backend/Services/config-server
mvn spring-boot:run

# Step 3: API Gateway
cd Backend/Services/gateway
mvn spring-boot:run

# Step 4: Authentication
cd Backend/Services/jwt_auth
mvn spring-boot:run

# Step 5: Core services (can start in parallel)
cd Backend/Services/parent && mvn spring-boot:run
cd Backend/Services/school && mvn spring-boot:run
cd Backend/Services/doctor && mvn spring-boot:run
cd Backend/Services/admin && mvn spring-boot:run
cd Backend/Services/nuru_chat && mvn spring-boot:run

# Step 6: Game services (can start in parallel)
cd Backend/Services/gaze_game && mvn spring-boot:run
cd Backend/Services/gesture_game && mvn spring-boot:run
cd Backend/Services/mirror_posture_game && mvn spring-boot:run
cd Backend/Services/dance_doodle && mvn spring-boot:run
cd Backend/Services/repeat_with_me_game && mvn spring-boot:run
```

### 4. AI & ML Services

```bash
# Nuru AI Agent
cd NuruAgent
pip install -r requirements.txt
python main.py                    # Starts on port 8005

# Games ML Model Server
cd Games/model_server
pip install -r requirements.txt
uvicorn app.main:app --port 8000  # Starts on port 8000

# ALI Prediction Model
cd ALI_Model/model
pip install -r requirements.txt
uvicorn main:app --port 8088      # Starts on port 8088
```

### 5. Frontend

```bash
# Main Application (Parent / School / Doctor)
cd Frontend/main-frontend
npm install
npm run dev                       # Starts on port 8081

# Admin Dashboard
cd Frontend/admin-website
npm install
npm run dev                       # Starts on port 3001
```

## Service Ports Reference

| Service | Port | Description |
|---------|------|-------------|
| Eureka Discovery | 8761 | Service registry |
| Config Server | 8888 | Centralized configuration |
| API Gateway | 8085 | Request routing |
| JWT Auth | 8080 | Authentication & OAuth2 |
| Parent Service | 8082 | Parent & child management |
| School Service | 8091 | School management |
| Doctor Service | 8093 | Doctor management |
| Admin Service | 8090 | Admin operations |
| Nuru Chat | 8094 | AI chat backend |
| Nuru Agent | 8005 | AI conversational engine |
| Games Model Server | 8000 | ML inference for all games |
| ALI Model | 8088 | Autism likelihood prediction |
| Mirror Posture Game | 8083 | Game session management |
| Gesture Game | 8084 | Game session management |
| Gaze Game | 8086 | Game session management |
| Dance Doodle | 8087 | Game session management |
| Repeat With Me | 8089 | Game session management |
| Main Frontend | 8081 | Primary web application |
| Admin Frontend | 3001 | Admin dashboard |
| PostgreSQL | 5432 | Relational database |
| pgAdmin | 5050 | Database management UI |

## Environment Variables

### Backend (Spring Cloud Config)

```bash
# PostgreSQL
DATABASE_URL=jdbc:postgresql://localhost:5432/neuronurture
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neuronurture

# Authentication
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@neuronurture.com

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Frontend

```bash
# Gemini AI (for in-app AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Python Services

```bash
# NuruAgent
ANTHROPIC_API_KEY=your_anthropic_api_key

# Games Model Server
GROQ_API_KEY=your_groq_api_key
HF_API_KEY=your_huggingface_api_key
```

---

<div align="center">

**NeuroNurture** — Empowering children with autism through technology, play, and unified care.

</div>
