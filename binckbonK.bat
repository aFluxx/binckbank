@ECHO ON
PATH=%PATH%;%mypath%\php

start cmd /k php -S localhost:80 -t public/

start "" http://localhost:80