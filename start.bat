@echo off
call install_dependencies.bat

start login.html

cd mongoDB
call start_server.bat

exit
