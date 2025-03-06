
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// Verifica se o usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
   // Se estiver na página de login, verificar se já está autenticado
   if (window.location.pathname === '/login') {
      // Se já estiver autenticado e com token salvo, redireciona para caixa
      if (localStorage.getItem('authToken')) {
         verificarAutenticacao();
      }
   }
   
   const formLogin = document.querySelector('.login-form');
   if (formLogin) {
       formLogin.addEventListener('submit', fazerLogin);
   }

   const formCadastro = document.querySelector('.cadastro-form');
   if (formCadastro) {
       formCadastro.addEventListener('submit', criarConta);
   }
});

// Função para verificar se o email é válido
function validarEmail(email) {
   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return regex.test(email);
}

// Função para criar uma nova conta
function criarConta(event) {
   event.preventDefault();

   const data = {
       email: document.getElementById('email').value,
       senha: document.getElementById('senha').value,
       usuario: document.getElementById('usuario').value
   };
   const confirmarSenha = document.getElementById('confirmarSenha').value;

   if (!data.email || !data.senha || !data.usuario || !confirmarSenha) {
       alert('Por favor, preencha todos os campos!');
       return;
   }

   if (!validarEmail(data.email)) {
       alert('Por favor, insira um email válido!');
       return;
   }

   if (data.senha !== confirmarSenha) {
       alert('As senhas não coincidem!');
       return;
   }

   fetch('/api/users/register', {
       method: 'POST',
       headers: getAuthHeaders(),
       body: JSON.stringify(data)
   })
   .then(response => response.json())
   .then(data => {
       alert(data.message);
       window.location.href = 'login.html';
   })
   .catch(error => alert('Erro ao criar conta'));
}

// Função para fazer login
function fazerLogin(event) {
   event.preventDefault();

   const data = {
       email: document.getElementById('email').value,
       senha: document.getElementById('senha').value,
       usuario: document.getElementById('usuario').value
   };

   fetch('/api/users/login', {
       method: 'POST',
       headers: getAuthHeaders(),
       body: JSON.stringify(data)
   })
   .then(response => {
      if (!response.ok) {
         throw new Error('Credenciais inválidas');
      }
      return response.json();
   })
   .then(data => {
       if (data.token) {
          // Armazenar o token no localStorage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('usuario', data.usuario);
       }
       
       // Redirecionar para a página do caixa
       window.location.href = 'caixa.html';
   })
   .catch(error => alert('Erro ao fazer login: ' + error.message));
}

// Função para fazer logout
function fazerLogout() {
   // Enviar requisição para a API de logout
   fetch('/api/users/logout', {
      method: 'POST',
      headers: getAuthHeaders()
   })
   .then(() => {
      // Limpar dados do usuário
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');
      
      // Redirecionar para a página de login
      window.location.href = '/login';
   })
   .catch(error => console.error('Erro ao fazer logout:', error));
}

// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
   const token = localStorage.getItem('authToken');
   
   // Se não tiver token, redireciona para login
   if (!token) {
      window.location.href = '/login';
      return false;
   }
   
   // Verificar validade do token no servidor
   fetch('/api/users/verificar', {
      headers: getAuthHeaders()
   })
   .then(response => {
      if (!response.ok) {
         // Se token for inválido, limpa localStorage e redireciona
         localStorage.removeItem('authToken');
         localStorage.removeItem('usuario');
         window.location.href = '/login';
         return false;
      }
      
      return response.json();
   })
   .then(data => {
      if (data && data.autenticado) {
         // Se estiver na página de login e estiver autenticado, redireciona para caixa
         if (window.location.pathname === '/login') {
            window.location.href = '/caixa';
         }
         return true;
      } else {
         // Se não estiver autenticado, limpa localStorage e redireciona
         localStorage.removeItem('authToken');
         localStorage.removeItem('usuario');
         window.location.href = '/login';
         return false;
      }
   })
   .catch(error => {
      console.error('Erro ao verificar autenticação:', error);
      return false;
   });
}