@echo off
echo 🔄 Restarting RAG Server with Gemini 1.5 Flash
echo.

echo 🛑 Stopping any running server...
taskkill /f /im python.exe 2>nul

echo.
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo ✅ Starting RAG Server with Gemini 1.5 Flash...
echo 📝 Model: gemini-1.5-flash (faster, higher quota)
echo.

python rag_server.py
