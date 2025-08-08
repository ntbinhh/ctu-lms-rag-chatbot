@echo off
echo 🚀 Starting Rasa RAG Chatbot Setup...

echo.
echo 📦 Installing dependencies...
pip install -r requirements.txt

echo.
echo 🧠 Setting up RAG system...
python scripts\setup_rag.py

echo.
echo 🎯 Testing RAG system...
python scripts\test_rag.py

echo.
echo 🤖 Training Rasa model...
rasa train

echo.
echo ✅ Setup completed!
echo.
echo To start the chatbot:
echo 1. Start action server: rasa run actions
echo 2. Start rasa server: rasa shell
echo.
pause
