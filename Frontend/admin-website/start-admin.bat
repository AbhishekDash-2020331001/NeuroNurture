@echo off
echo Starting NeuroNurture Admin Website...
echo.
echo This will install dependencies and start the development server.
echo The admin website will be available at: http://localhost:3001
echo.
echo Demo credentials:
echo Email: admin@neuronurture.com
echo Password: admin123
echo.
pause

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error installing dependencies. Please check your Node.js installation.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo Starting development server...
echo.
npm run dev

pause
