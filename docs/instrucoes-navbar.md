# Instruções para Implementação da Navbar Padronizada no PDV-Surya

Este documento detalha o processo de implementação da nova navbar padronizada para o sistema PDV-Surya.

## ⚠️ IMPORTANTE: Método recomendado

Devido à complexidade e às diferenças no HTML das páginas, recomendamos **aplicar manualmente** as alterações seguindo o modelo fornecido no arquivo `aplicar-manualmente.html`.

## Arquivos Criados

1. **CSS da Navbar**: `public/css/navbar.css`
   - Estilos padronizados para a navbar
   - Usa `!important` para garantir que sobrescreva outros estilos

2. **JavaScript da Navbar**: `public/js/navbar.js`
   - Detecta automaticamente a página atual para destacá-la

3. **Exemplo Completo**: `aplicar-manualmente.html`
   - Página de exemplo contendo a estrutura HTML correta

## Instruções para Aplicação Manual (RECOMENDADO)

Siga estas etapas para cada página HTML:

1. **Adicione o CSS** no `<head>` da página (DEVE vir ANTES dos outros CSS!):
   ```html
   <link rel="stylesheet" href="css/navbar.css">
   ```

2. **Substitua a navbar existente** pelo seguinte código (logo após a tag `<body>`):
   ```html
   <div class="nav-menu">
       <a href="index.html">Início</a>
       <a href="caixa.html">Caixa</a>
       <a href="produtos.html">Produtos</a>
       <a href="produtoLista.html">Lista de Produtos</a>
       <a href="historico.html">Histórico</a>
       <a href="despesas.html">Despesas</a>
       <a href="contasPagar.html">Contas a Pagar</a>
       <a href="listaDeClientes.html">Clientes</a>
       <a href="listaDeFornecedores.html">Fornecedores</a>
       <a href="orcamentos.html">Orçamentos</a>
       <a href="dashboard.html">Dashboard</a>
       <a href="relatorios.html">Relatórios</a>
       <div class="user-menu">
           <div class="user-icon">U</div>
           <div class="dropdown-content">
               <a href="#" id="botao-sair">Sair</a>
           </div>
       </div>
   </div>
   ```

3. **Adicione margem superior** ao contêiner principal da página:
   ```html
   <div class="seu-container-principal" style="margin-top: 70px;">
   ```

4. **Adicione o script JavaScript** no final do `<body>`:
   ```html
   <script src="js/navbar.js"></script>
   ```

## Verificações Pós-Implementação

Após aplicar a navbar em cada página, verifique:

1. **Layout visual**: A navbar deve estar alinhada corretamente no topo
2. **Destaque correto**: A página atual deve ter fundo azul
3. **Efeito hover**: Os links devem mudar de cor ao passar o mouse
4. **Menu de usuário**: O menu dropdown deve funcionar
5. **Responsividade**: A navbar deve se ajustar em telas menores

## Resolução de Problemas

Se houver sobreposição ou problemas visuais:

1. **Verifique a ordem dos CSS**: o `navbar.css` deve ser carregado ANTES dos outros 
2. **Adicione margem superior**: Certifique-se de que o conteúdo principal tenha `margin-top: 70px;`
3. **Elimine conflitos**: Remova qualquer estilo que afete `.nav-menu` em outros arquivos CSS

## Exemplos

Para ver um exemplo funcional:
1. Abra `aplicar-manualmente.html` para referência
2. Observe a estrutura HTML necessária
