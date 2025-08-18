@echo off
echo 🚀 Setting up Enhanced RAG Server with LangChain and Gemini
echo.

echo 📦 Installing Python dependencies...
pip install -r requirements_rag.txt

echo.
echo 📋 Checking configuration...
if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo.
    echo 🔑 Please edit .env file and add your GOOGLE_API_KEY
    echo 💡 You can get the API key from: https://makersuite.google.com/app/apikey
    echo.
    pause
)

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Starting RAG Server...
python rag_server.py
