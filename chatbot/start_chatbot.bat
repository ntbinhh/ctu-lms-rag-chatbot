@echo off
echo 🤖 Starting Rasa Chatbot with Actions Server
echo =============================================

echo.
echo 🔧 Checking if Rasa is installed...
rasa --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Rasa is not installed or not in PATH
    echo Installing Rasa...
    pip install rasa
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Rasa
        pause
        exit /b 1
    )
)

echo ✅ Rasa is ready

echo.
echo 🏗️ Training the model (if needed)...
if not exist "models\" (
    echo Training new model...
    rasa train
    if %errorlevel% neq 0 (
        echo ❌ Failed to train model
        pause
        exit /b 1
    )
) else (
    echo Model directory exists, skipping training
)

echo.
echo 🎬 Starting Actions Server on port 5055...
start "Rasa Actions Server" cmd /k "echo Starting Actions Server... && rasa run actions --port 5055"

echo.
echo ⏳ Waiting for Actions Server to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Rasa Server on port 5005...
echo.
echo 💡 Server endpoints:
echo    - Rasa API: http://localhost:5005
echo    - Actions: http://localhost:5055  
echo    - Webhook: http://localhost:5005/webhooks/rest/webhook
echo.
echo 🤖 You can now test the chatbot!
echo 📱 Frontend chatbot will connect to: http://localhost:5005/webhooks/rest/webhook
echo.
echo ⚠️  Keep both terminal windows open
echo.

rasa run --enable-api --cors "*" --port 5005 --endpoints endpoints.yml

pause
