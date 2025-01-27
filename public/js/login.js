function validarEmail(email) {
   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return regex.test(email);
}

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
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
   })
   .then(response => response.json())
   .then(data => {
       alert(data.message);
       window.location.href = 'login.html';
   })
   .catch(error => alert('Erro ao criar conta'));
}

function fazerLogin(event) {
   event.preventDefault();

   const data = {
       email: document.getElementById('email').value,
       senha: document.getElementById('senha').value,
       usuario: document.getElementById('usuario').value
   };

   fetch('/api/users/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
   })
   .then(response => response.json())
   .then(data => {
       alert(data.message);
       window.location.href = 'caixa.html';
   })
   .catch(error => alert('Erro ao fazer login'));
}

document.addEventListener('DOMContentLoaded', function() {
   const formLogin = document.querySelector('.login-form');
   if (formLogin) {
       formLogin.addEventListener('submit', fazerLogin);
   }

   const formCadastro = document.querySelector('.cadastro-form');
   if (formCadastro) {
       formCadastro.addEventListener('submit', criarConta);
   }
});