document.getElementById('clienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
    nome: document.getElementById('nome').value,
    endereco: document.getElementById('endereco').value,
    telefone: document.getElementById('telefone').value,
    dataNascimento: document.getElementById('dataNascimento').value
};
  console.log('Dados antes do envio:', JSON.stringify(formData, null, 2));
    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Cliente cadastrado com sucesso!');
            window.location.href = '/listaDeClientes';
        } else {
            alert('Erro ao cadastrar cliente: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert('Erro ao cadastrar cliente!');
    }
});

// Formatação do telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = value;
    }
});