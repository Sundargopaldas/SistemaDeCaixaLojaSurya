@echo off
echo Configurando banco de dados e criando usuario demo...

REM Base path do MySQL
set "MYSQL_BASE=C:\Program Files\MySQL\MySQL Server"

REM Procura pela versão mais recente do MySQL
for /f "delims=" %%i in ('dir /b /ad "%MYSQL_BASE%\*" 2^>nul') do set "MYSQL_VERSION=%%i"

if not defined MYSQL_VERSION (
    echo Nao foi possivel encontrar uma versao do MySQL em %MYSQL_BASE%
    pause
    exit /b 1
)

set "MYSQL=%MYSQL_BASE%\%MYSQL_VERSION%\bin\mysql.exe"

if exist "%MYSQL%" (
    echo MySQL encontrado em: %MYSQL%
    "%MYSQL%" -u root -psundar pdv_surya < scripts\setup_database.sql
    if errorlevel 1 (
        echo Erro ao executar o script SQL.
        pause
        exit /b 1
    )
) else (
    echo MySQL nao encontrado em %MYSQL%
    echo Por favor, verifique se o MySQL esta instalado corretamente.
    pause
    exit /b 1
)

echo Configuracao concluida com sucesso!
pause