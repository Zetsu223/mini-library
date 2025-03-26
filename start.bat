@echo off

cd requirements
call install_dependencies.bat

timeout /t 5 /nobreak

cd ..\mongoDB
call start_server.bat

cd ..
start login.html

exit
