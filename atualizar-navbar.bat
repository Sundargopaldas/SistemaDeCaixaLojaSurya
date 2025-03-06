@echo off
echo ================================================
echo    Atualizando Navbar em todas as paginas
echo ================================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js para continuar.
    pause
    exit /b 1
)

REM Verificar se o Cheerio está instalado
if not exist node_modules\cheerio (
    echo Instalando dependencias...
    npm install cheerio --save-dev
)

REM Executar o script de atualizacao
echo Atualizando a navbar em todas as paginas HTML...
node scripts/atualizar-navbar.js

echo.
echo Pressione qualquer tecla para sair...
pause > nul
