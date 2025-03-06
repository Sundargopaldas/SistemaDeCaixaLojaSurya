# Instruções para Remoção do Campo de Data de Nascimento

Esta documentação explica como remover o campo `dataNascimento` da tabela `clientes` no banco de dados do sistema PDV-Surya.

## Alterações Realizadas

1. **Remoção do Campo na Interface**:
   - Removido o campo de data de aniversário da página de cadastro de clientes
   - Removido o campo de data de aniversário da tabela de listagem de clientes
   - Removido o campo de data de aniversário do modal de edição de clientes
   - Removido o filtro de busca de clientes que não está mais sendo utilizado

2. **Remoção no Backend**:
   - Removidas referências ao campo `dataNascimento` no controlador de clientes
   - Removida a função `aniversariantesDoDia` que não é mais necessária
   - Rotas de API relacionadas a aniversários já estavam desativadas (comentadas)

3. **Banco de Dados**:
   - Criado script SQL para remover o campo `dataNascimento` da tabela `clientes`

## Como Aplicar a Alteração no Banco de Dados

### Opção 1: Usando o MySQL Workbench ou outro cliente SQL

1. Abra seu cliente MySQL (MySQL Workbench, HeidiSQL, etc.)
2. Conecte-se ao banco de dados `pdv_surya` com as credenciais:
   - Host: localhost
   - Usuário: root
   - Senha: sundar
3. Execute o seguinte comando SQL:
   ```sql
   ALTER TABLE clientes DROP COLUMN dataNascimento;
   ```

### Opção 2: Usando a linha de comando

1. Abra um terminal/prompt de comando
2. Navegue até a pasta do projeto:
   ```
   cd c:\Users\HP\Desktop\PDV-surya
   ```
3. Execute o script SQL usando o cliente mysql:
   ```
   mysql -u root -psundar pdv_surya < scripts/remover_campo_data_nascimento.sql
   ```

### Verificação

Após executar o comando, você pode verificar se a alteração foi aplicada corretamente com:

```sql
DESCRIBE clientes;
```

O campo `dataNascimento` não deve mais aparecer na listagem de colunas da tabela.
