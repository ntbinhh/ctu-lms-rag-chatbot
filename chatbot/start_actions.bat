@echo off
echo 🎬 Starting Rasa Actions Server
echo ================================

echo.
echo 🔧 Checking current directory...
if not exist "actions\actions.py" (
    echo ❌ actions.py not found. Make sure you're in the chatbot directory
    pause
    exit /b 1
)

echo ✅ Found actions.py

echo.
echo 🚀 Starting Actions Server on port 5055...
echo 💡 Actions server will be available at: http://localhost:5055
echo 🔗 Webhook endpoint: http://localhost:5055/webhook
echo.
echo ⚠️  Keep this terminal open while using the chatbot
echo.

rasa run actions --port 5055 --debug

pause
