@echo off
chcp 65001 > nul
echo.
echo ===================================
echo   GitHub CLI 로그인
echo ===================================
echo.
echo 아래 선택지가 나오면:
echo  1. GitHub.com 선택 후 Enter
echo  2. HTTPS 선택 후 Enter
echo  3. Y 입력 후 Enter
echo  4. Login with a web browser 선택 후 Enter
echo  5. 브라우저에서 코드 입력 후 인증 완료!
echo.
"C:\Program Files\GitHub CLI\gh.exe" auth login
echo.
echo 로그인이 완료되었습니다! 이 창을 닫아주세요.
pause
