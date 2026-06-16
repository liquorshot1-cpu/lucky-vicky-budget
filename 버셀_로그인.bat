@echo off
chcp 65001 > nul
echo.
echo ===================================
echo   Vercel 로그인
echo ===================================
echo.
echo 브라우저가 열리면 GitHub 계정으로 로그인 후 승인해주세요!
echo.
vercel login --github
echo.
echo 로그인 완료! 이 창을 닫아주세요.
pause
