@echo off
echo 🧪 Testing Chatbot Setup
echo =========================

echo.
echo 1️⃣ Testing Actions Server (port 5055)...
curl -s http://localhost:5055/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Actions Server is running
) else (
    echo ❌ Actions Server is NOT running
    echo 💡 Start it with: rasa run actions --port 5055
)

echo.
echo 2️⃣ Testing Rasa Server (port 5005)...
curl -s http://localhost:5005 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Rasa Server is running
) else (
    echo ❌ Rasa Server is NOT running  
    echo 💡 Start it with: rasa run --enable-api --cors "*" --endpoints endpoints.yml
)

echo.
echo 3️⃣ Testing Webhook Endpoint...
curl -s -X POST http://localhost:5005/webhooks/rest/webhook -H "Content-Type: application/json" -d "{\"sender\":\"test\",\"message\":\"xin chào\"}" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Webhook is responding
) else (
    echo ❌ Webhook is not responding
)

echo.
echo 4️⃣ Checking Configuration Files...
if exist "endpoints.yml" (
    echo ✅ endpoints.yml exists
    findstr /C:"action_endpoint:" endpoints.yml >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ action_endpoint is configured
    ) else (
        echo ❌ action_endpoint is not configured
    )
) else (
    echo ❌ endpoints.yml not found
)

if exist "domain.yml" (
    echo ✅ domain.yml exists
) else (
    echo ❌ domain.yml not found
)

if exist "models\" (
    echo ✅ models directory exists
) else (
    echo ❌ models directory not found - run 'rasa train'
)

echo.
echo 📋 Summary:
echo If all items show ✅, your chatbot is ready!
echo If any show ❌, follow the 💡 suggestions above.
echo.

pause
