@echo off
echo Building Root Coder Foundation Application...
echo.

:: Build Backend
echo Building Backend...
cd backend
call npm install
call npm run build
cd ..

:: Build Frontend
echo Building Frontend...
cd frontend
call npm install
call npm run build
cd ..

:: Wait for a moment to ensure builds are complete
timeout /t 3 /nobreak

:: Show success message
echo.
echo Build completed successfully!
echo.
echo BIG DADDY ALWAYS WIN
echo.

:: Create and show a proper Windows popup
echo Set oShell = CreateObject("WScript.Shell") > "%temp%\popup.vbs"
echo oShell.Popup "Build completed successfully!`nBIG DADDY ALWAYS WIN", 0, "Build Success!", 64 >> "%temp%\popup.vbs"
start /wait wscript.exe "%temp%\popup.vbs"

:: Keep the window open
pause 