// Array para armazenar usuários
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// Função para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função de Login
function fazerLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const usuario = document.getElementById('usuario').value;

    // Verificar se os campos estão preenchidos
    if (!email || !senha || !usuario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Procurar usuário
    const usuarioExiste = usuarios.find(u => u.email === email && u.senha === senha && u.usuario === usuario);

    if (usuarioExiste) {
        // Login bem sucedido
        alert('Login realizado com sucesso!');
        window.location.href = 'caixa.html';
    } else {
        alert('Email ou senha incorretos!');
    }
}

// Função para criar conta
function criarConta(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const usuario = document.getElementById('usuario').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // Validações básicas
    if (!email || !senha || !usuario || !confirmarSenha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (!validarEmail(email)) {
        alert('Por favor, insira um email válido!');
        return;
    }

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    // Verificar se o usuário já existe
    if (usuarios.some(u => u.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }

    // Criar novo usuário
    const novoUsuario = {
        usuario,
        email,
        senha
    };

    // Adicionar ao array de usuários
    usuarios.push(novoUsuario);
    
    // Salvar no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('Conta criada com sucesso!');
    window.location.href = 'login.html';
}

// Adicionar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Para página de login
    const formLogin = document.querySelector('.login-form');
    if (formLogin) {
        formLogin.addEventListener('submit', fazerLogin);
    }

    // Para página de cadastro
    const formCadastro = document.querySelector('.cadastro-form');
    if (formCadastro) {
        formCadastro.addEventListener('submit', criarConta);
    }
});