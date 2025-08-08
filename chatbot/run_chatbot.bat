@echo off
echo 🚀 Starting Rasa Chatbot with RAG...

echo.
echo Starting action server...
start "Rasa Actions" cmd /k "rasa run actions"

timeout /t 3

echo Starting rasa shell...
rasa shell

pause
