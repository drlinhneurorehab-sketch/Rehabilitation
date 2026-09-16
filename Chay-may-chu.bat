@echo off
rem ============================================================
rem  PHCN-METRICS - Chay bang may chu cuc bo (localhost:8777)
rem  Dung khi muon truy cap tu may khac trong cung mang LAN,
rem  hoac tu may tinh bang / dien thoai cua khoa phong.
rem  Yeu cau: da cai Python 3.
rem  Dong cua so nay de tat may chu.
rem ============================================================
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo   KHONG TIM THAY PYTHON.
  echo   Hay dung file Mo-ung-dung.bat de mo truc tiep bang trinh duyet.
  echo.
  pause
  exit /b 1
)

echo.
echo   Dang khoi dong may chu tai http://localhost:8777
echo   De dung tren may khac trong mang LAN, thay localhost bang dia chi IP cua may nay.
echo   Nhan Ctrl+C hoac dong cua so de tat.
echo.
start "" "http://localhost:8777/index.html"
python -m http.server 8777
