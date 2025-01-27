// public/js/aniversarios.js
class SistemaAniversarios {
    constructor() {
        this.verificarPermissao();
    }

    async verificarPermissao() {
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    }

    async verificarAniversariantes() {
        try {
            const response = await fetch('/api/aniversariantes-do-dia');
            const aniversariantes = await response.json();
            
            if (aniversariantes.length > 0) {
                this.notificar(aniversariantes);
                this.exibirAlertaGlobal(aniversariantes);
            }
        } catch (error) {
            console.error('Erro ao verificar aniversariantes:', error);
        }
    }

    notificar(aniversariantes) {
        if (Notification.permission === 'granted') {
            const nomes = aniversariantes.map(a => a.nome).join(', ');
            new Notification('🎂 Aniversariantes do Dia!', {
                body: `Hoje é aniversário de: ${nomes}`
            });
        }
    }

    exibirAlertaGlobal(aniversariantes) {
        const alertaExistente = document.getElementById('alerta-global-aniversario');
        if (alertaExistente) {
            alertaExistente.remove();
        }

        const alertaDiv = document.createElement('div');
        alertaDiv.id = 'alerta-global-aniversario';
        alertaDiv.className = 'alerta-global-aniversario';

        let html = `
            <div class="alerta-conteudo">
                <h3>🎂 Aniversariantes do Dia 🎂</h3>
                <ul>
                    ${aniversariantes.map(cliente => `<li>${cliente.nome}</li>`).join('')}
                </ul>
            </div>
            <button class="fechar-alerta" onclick="this.parentElement.remove()">×</button>
        `;
        
        alertaDiv.innerHTML = html;
        document.body.appendChild(alertaDiv);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sistemaAniversarios = new SistemaAniversarios();
    sistemaAniversarios.verificarAniversariantes();
    setInterval(() => sistemaAniversarios.verificarAniversariantes(), 3600000);
});