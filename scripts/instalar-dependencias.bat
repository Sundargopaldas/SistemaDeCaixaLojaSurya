@echo off
echo Instalando dependencias para atualizacao da navbar...
cd %~dp0..
npm install cheerio --save-dev

echo.
echo Dependencias instaladas com sucesso!
echo Para atualizar todas as paginas HTML, execute: node scripts/atualizar-navbar.js
echo.
pause
