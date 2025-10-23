@echo off
REM Levanta FastAPI en segundo plano
start "" /b cmd /c "cd .. && cd Backend && venv\Scripts\activate && uvicorn app.main:app --reload >nul 2>&1"

REM Levanta React en segundo plano
start "" /b cmd /c "cd .. && cd Frontend && npm run dev >nul 2>&1"

start https://plataforma.tu-red.com/home
start http://localhost:3001/

exit
