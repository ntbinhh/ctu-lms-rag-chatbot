@echo off
echo ================================================
echo          RASA NLU Performance Testing
echo ================================================
echo.

REM Check if virtual environment exists
if exist "venv\" (
    echo 🔧 Activating virtual environment...
    call venv\Scripts\activate
) else (
    echo ⚠️ No virtual environment found, using global Python
)

REM Install test requirements
echo 📦 Installing test requirements...
pip install -r tests\requirements_test.txt

echo.
echo 🧪 Running RASA NLU Tests...
echo.

REM Run simple test first
echo 🚀 Running Simple Test Suite...
python tests\test_rasa_simple.py

echo.
echo 🔍 Running Comprehensive Test Suite...
python tests\test_nlu_performance.py

echo.
echo ✅ Testing completed!
echo 📊 Check nlu_test_results.json for detailed results
echo 📊 Check chatbot_test_results.json for comprehensive results

pause
