@echo off
echo 🚀 Starting Student Dashboard with Chatbot
echo =========================================

echo.
echo 🔧 Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Python is installed  
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

echo.
echo 📁 Navigating to frontend directory...
cd /d "%~dp0frontend"

if not exist "package.json" (
    echo ❌ package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

echo.
echo 📦 Installing/updating dependencies...
call npm install

echo.
echo 🌐 Starting React development server...
echo.
echo 💡 The dashboard will open at: http://localhost:3000
echo 👤 Login as student to access chatbot features
echo 🤖 Chatbot widget will appear in bottom-right corner
echo.
echo ⚠️  Make sure to also run these in separate terminals:
echo    1. Backend: cd backend && python main.py
echo    2. Rasa server: cd chatbot && rasa run --enable-api --cors "*"  
echo    3. Rasa actions: cd chatbot && rasa run actions
echo.

call npm start

pause
