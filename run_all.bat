@echo off
echo Starting all microservices...

start cmd /k "cd Backend\services\config-server && mvn spring-boot:run"
start cmd /k "cd Backend\services\discovery && mvn spring-boot:run"
start cmd /k "cd Backend\services\jwt_auth && mvn spring-boot:run"
start cmd /k "cd Backend\services\parent && mvn spring-boot:run"
start cmd /k "cd Backend\services\Mirror_Posture_Game && mvn spring-boot:run"
start cmd /k "cd Backend\services\dance_doodle && mvn spring-boot:run"
start cmd /k "cd Backend\services\gaze_game && mvn spring-boot:run"
start cmd /k "cd Backend\services\gesture_game && mvn spring-boot:run"
start cmd /k "cd Backend\services\repeat_with_me_game && mvn spring-boot:run"
start cmd /k "cd Frontend\spark-play-detect-main && npm run dev"
start cmd /k "cd Frontend\admin-website && npm run dev"
start cmd /k "conda activate tf_gpu && cd Games\model_server && python -m uvicorn app.main:app --reload"

echo All services are starting in new windows...
pause
