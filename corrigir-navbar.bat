@echo off
echo Instalando dependencias...
npm install cheerio
echo.
echo Corrigindo a navbar em todas as paginas...
node scripts/corrigir-navbar.js
echo.
echo Processo finalizado! Pressione qualquer tecla para sair.
pause > nul
