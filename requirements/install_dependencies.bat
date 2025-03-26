@echo off 
set INSTALLER_PATH="requirements\node-v22.14.0-x64.msi"

echo Installing Node.js...
msiexec /i %INSTALLER_PATH% /quiet

timeout /t 10 /nobreak

echo Installing npm dependencies...
npm -g install express mongoose cors body-parser dotenv bcryptjs jsonwebtoken axios node-cron

timeout /t 3 /nobreak
echo Done..!
exit
