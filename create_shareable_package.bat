@echo off
echo 🎁 Đang tạo file ZIP để chia sẻ Gift Box 3D...
echo.

:: Tạo tên file với thời gian hiện tại
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "zipname=MagicalGiftBox_ChiHaiChoEmTien_%datestamp%.zip"

:: Tạo file ZIP bằng PowerShell
powershell -command "Compress-Archive -Path '*.html','*.css','*.js','*.md','*.py','*.bat' -DestinationPath '%zipname%'"

echo ✅ Đã tạo file: %zipname%
echo 📤 Bạn có thể gửi file này cho bạn bè qua:
echo    - Email
echo    - Telegram/WhatsApp
echo    - Google Drive/OneDrive
echo    - USB
echo.
echo 📝 Hướng dẫn cho người nhận:
echo    1. Giải nén file ZIP
echo    2. Click đúp vào index.html
echo    3. Click vào màn hình để mở hộp quà!
echo.
pause
