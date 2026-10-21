@echo off
title DormFinder Server
echo.
echo  ==========================================
echo   DormFinder - Starting Server...
echo  ==========================================
echo.
cd /d "%~dp0"
python server.py
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Could not start server.
    echo  Make sure Python is installed.
    pause
)
