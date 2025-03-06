/**
 * Sistema de notificações em tempo real para PDV-Surya
 * Gerencia notificações de estoque baixo, novas vendas, etc.
 */

class NotificationManager {
  constructor() {
    this.notificationsKey = 'pdv-surya-notifications';
    this.notifications = this.loadNotifications();
    this.setupEventListeners();
    this.checkPermission();
    this.pollInterval = null; // Para polling de notificações do servidor
  }
  
  /**
   * Carrega notificações salvas
   */
  loadNotifications() {
    const savedNotifications = localStorage.getItem(this.notificationsKey);
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  }
  
  /**
   * Salva notificações no localStorage
   */
  saveNotifications() {
    // Manter apenas as 50 notificações mais recentes
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    localStorage.setItem(this.notificationsKey, JSON.stringify(this.notifications));
    this.updateUI();
  }
  
  /**
   * Verifica permissão para notificações do navegador
   */
  checkPermission() {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return;
    }
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // Aguardar interação do usuário antes de solicitar permissão
      document.addEventListener('click', () => {
        this.requestPermission();
      }, { once: true });
    }
  }
  
  /**
   * Solicita permissão para notificações
   */
  requestPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        this.showNotification('PDV-Surya', 'Notificações ativadas com sucesso!', 'info');
      }
    });
  }
  
  /**
   * Inicia polling para verificar novas notificações no servidor
   */
  startPolling() {
    if (this.pollInterval) return; // Evitar múltiplas instâncias
    
    // Verificar a cada 60 segundos (ajuste conforme necessário)
    this.pollInterval = setInterval(() => {
      this.checkServerNotifications();
    }, 60000);
  }
  
  /**
   * Para o polling de notificações
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  /**
   * Verifica notificações no servidor
   */
  checkServerNotifications() {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) return;
    
    fetch('/api/notifications', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    .then(response => {
      if (response.ok) return response.json();
      throw new Error('Falha ao recuperar notificações');
    })
    .then(data => {
      if (data.notifications && data.notifications.length > 0) {
        // Processar novas notificações
        data.notifications.forEach(notification => {
          this.addNotification(
            notification.title,
            notification.message,
            notification.type,
            notification.data
          );
        });
      }
    })
    .catch(error => {
      console.error('Erro ao verificar notificações:', error);
    });
  }
  
  /**
   * Adiciona uma nova notificação
   * @param {string} title - Título da notificação
   * @param {string} message - Mensagem da notificação
   * @param {string} type - Tipo: 'info', 'success', 'warning', 'danger'
   * @param {object} data - Dados adicionais relacionados à notificação
   */
  addNotification(title, message, type = 'info', data = {}) {
    const notification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title,
      message,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Adicionar ao início do array
    this.notifications.unshift(notification);
    this.saveNotifications();
    
    // Mostrar no navegador se estiver visível e permitido
    this.showNotification(title, message, type, data);
    
    // Disparar evento customizado
    document.dispatchEvent(new CustomEvent('pdv-notification', { 
      detail: notification 
    }));
    
    return notification;
  }
  
  /**
   * Mostra notificação no navegador
   */
  showNotification(title, message, type, data = {}) {
    // Mostrar toast na interface
    this.showToast(title, message, type);
    
    // Mostrar notificação do navegador se estiver em segundo plano e permitido
    if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      const notification = new Notification(title, {
        body: message,
        icon: '/img/logo.png' // Ajuste o caminho conforme necessário
      });
      
      notification.onclick = () => {
        window.focus();
        if (data.url) {
          window.location.href = data.url;
        }
        notification.close();
      };
    }
  }
  
  /**
   * Mostra notificação na interface (Toast)
   */
  showToast(title, message, type) {
    // Criar container de toasts se não existir
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Criar o toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <strong>${title}</strong>
        <button type="button" class="toast-close">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    // Adicionar na interface
    toastContainer.appendChild(toast);
    
    // Configurar botão de fechar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }
  
  /**
   * Marca uma notificação como lida
   * @param {number} id - ID da notificação
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }
  
  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
  }
  
  /**
   * Remove uma notificação
   * @param {number} id - ID da notificação
   */
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }
  
  /**
   * Limpa todas as notificações
   */
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }
  
  /**
   * Atualiza interface de notificações
   */
  updateUI() {
    // Selecionar contador de notificações e dropdown
    const counters = document.querySelectorAll('.notification-count');
    const containers = document.querySelectorAll('.notification-list');
    
    // Contar não lidas
    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    // Atualizar contadores
    counters.forEach(counter => {
      counter.textContent = unreadCount;
      counter.style.display = unreadCount > 0 ? 'block' : 'none';
    });
    
    // Atualizar listas de notificações
    containers.forEach(container => {
      // Limpar container
      container.innerHTML = '';
      
      if (this.notifications.length === 0) {
        container.innerHTML = '<div class="notification-empty">Não há notificações</div>';
        return;
      }
      
      // Adicionar notificações
      this.notifications.slice(0, 5).forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'} notification-${notification.type}`;
        item.setAttribute('data-id', notification.id);
        
        const date = new Date(notification.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        item.innerHTML = `
          <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <small>${formattedDate}</small>
          </div>
          <button class="notification-close" title="Remover">&times;</button>
        `;
        
        // Evento de click para marcar como lida
        item.addEventListener('click', () => {
          this.markAsRead(notification.id);
          // Redirecionar se tiver URL
          if (notification.data && notification.data.url) {
            window.location.href = notification.data.url;
          }
        });
        
        // Evento para botão de fechar
        const closeBtn = item.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeNotification(notification.id);
        });
        
        container.appendChild(item);
      });
      
      // Adicionar botões de ação se houver notificações
      if (this.notifications.length > 0) {
        const actions = document.createElement('div');
        actions.className = 'notification-actions';
        actions.innerHTML = `
          <button class="btn-mark-all-read">Marcar todas como lidas</button>
          <button class="btn-clear-all">Limpar todas</button>
        `;
        
        // Adicionar eventos
        const markAllBtn = actions.querySelector('.btn-mark-all-read');
        markAllBtn.addEventListener('click', () => {
          this.markAllAsRead();
        });
        
        const clearAllBtn = actions.querySelector('.btn-clear-all');
        clearAllBtn.addEventListener('click', () => {
          this.clearAll();
        });
        
        container.appendChild(actions);
      }
    });
  }
  
  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Mostrar/esconder dropdown de notificações
    document.addEventListener('DOMContentLoaded', () => {
      // Atualizar UI inicialmente
      this.updateUI();
      
      // Iniciar polling
      this.startPolling();
      
      // Configurar botões de notificação
      const toggles = document.querySelectorAll('.notification-toggle');
      toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          const dropdown = toggle.nextElementSibling;
          if (dropdown && dropdown.classList.contains('notification-dropdown')) {
            dropdown.classList.toggle('show');
            // Marcar todas como lidas quando abrir o dropdown
            if (dropdown.classList.contains('show')) {
              this.markAllAsRead();
            }
          }
        });
      });
      
      // Fechar dropdowns ao clicar fora
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-toggle') && !e.target.closest('.notification-dropdown')) {
          document.querySelectorAll('.notification-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
          });
        }
      });
    });
  }
  
  /**
   * Adiciona notificações relacionadas a estoque
   * @param {object} produto - Produto com estoque baixo
   */
  addEstoqueBaixoNotification(produto) {
    this.addNotification(
      'Estoque Baixo',
      `O produto "${produto.nome}" está com estoque baixo (${produto.estoque} unidades).`,
      'warning',
      { url: `/produtos.html?id=${produto.id}` }
    );
  }
  
  /**
   * Adiciona notificações relacionadas a vendas
   * @param {object} venda - Dados da venda
   */
  addVendaNotification(venda) {
    this.addNotification(
      'Nova Venda',
      `Venda #${venda.id} no valor de R$ ${venda.total.toFixed(2)} registrada.`,
      'success',
      { url: `/historico.html?venda=${venda.id}` }
    );
  }
}

// Exportar função de inicialização
export function initNotifications() {
  const notificationManager = new NotificationManager();
  return notificationManager;
}
