@echo off
echo 🌐 Starting Rasa Server
echo =======================

echo.
echo 🔧 Checking configuration...
if not exist "endpoints.yml" (
    echo ❌ endpoints.yml not found
    pause
    exit /b 1
)

if not exist "domain.yml" (
    echo ❌ domain.yml not found
    pause
    exit /b 1
)

echo ✅ Configuration files found

echo.
echo 🏗️ Checking if model exists...
if not exist "models\" (
    echo No model found, training...
    rasa train
    if %errorlevel% neq 0 (
        echo ❌ Failed to train model
        pause
        exit /b 1
    )
) else (
    echo ✅ Model directory exists
)

echo.
echo 🚀 Starting Rasa Server...
echo 💡 Server will be available at: http://localhost:5005
echo 🔗 Webhook endpoint: http://localhost:5005/webhooks/rest/webhook
echo 🌐 CORS enabled for frontend integration
echo.
echo ⚠️  Make sure Actions Server is running on port 5055
echo ⚠️  Keep this terminal open while using the chatbot
echo.

rasa run --enable-api --cors "*" --port 5005 --endpoints endpoints.yml --debug

pause
