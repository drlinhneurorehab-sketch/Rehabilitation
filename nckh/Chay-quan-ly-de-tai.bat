@echo off
chcp 65001 >nul
title He thong quan ly de tai khoa hoc
cd /d "%~dp0"

echo.
echo   ================================================================
echo    HE THONG QUAN LY DE TAI NGHIEN CUU KHOA HOC
echo   ================================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo   [LOI] Khong tim thay Python.
  echo   Tai Python 3 tai https://www.python.org/downloads/ va nho tich
  echo   "Add python.exe to PATH" khi cai dat.
  echo.
  pause
  exit /b 1
)

python -c "import flask" >nul 2>nul
if errorlevel 1 (
  echo   Dang cai thu vien Flask, vui long doi...
  python -m pip install --quiet flask
  if errorlevel 1 (
    echo   [LOI] Khong cai duoc Flask. Kiem tra ket noi mang.
    pause
    exit /b 1
  )
)

start "" http://localhost:8080/admin
python app.py

echo.
echo   May chu da dung.
pause
