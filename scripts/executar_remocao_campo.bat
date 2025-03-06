@echo off
echo Removendo o campo dataNascimento da tabela clientes...
mysql -u root -psundar pdv_surya < scripts/remover_campo_data_nascimento.sql
echo Operacao concluida!
pause
