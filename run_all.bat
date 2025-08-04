@echo off
REM ===== BACKEND SERVICES =====
start "Config Server" cmd /k "cd Backend\Services\config-server && mvn spring-boot:run"
start "Discovery Server" cmd /k "cd Backend\Services\discovery && mvn spring-boot:run"
start "JWT Auth Service" cmd /k "cd Backend\Services\jwt_auth && mvn spring-boot:run"
start "Parent Service" cmd /k "cd Backend\Services\parent && mvn spring-boot:run"
start "Mirror Posture Game" cmd /k "cd Backend\Services\Mirror_Posture_Game && mvn spring-boot:run"

REM ===== FRONTEND =====
start "React Frontend" cmd /k "cd Frontend\spark-play-detect-main && npm run dev"

REM ===== FASTAPI BACKEND =====
start "FastAPI Server" cmd /k "cd Javafest\Dataset_for_faceposture\Mirror_Posture_Game && uvicorn app.main:app --reload"
