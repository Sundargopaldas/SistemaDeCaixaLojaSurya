/**
 * Gerenciador de temas para PDV-Surya
 * Permite alternar entre tema claro e escuro
 */

class ThemeManager {
  constructor() {
    this.themeKey = 'pdv-surya-theme';
    this.initTheme();
    this.setupListeners();
  }

  /**
   * Inicializa o tema baseado na preferência salva ou do sistema
   */
  initTheme() {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem(this.themeKey);
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Usar preferência do sistema
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDarkMode ? 'dark' : 'light');
    }
  }

  /**
   * Configura os event listeners
   */
  setupListeners() {
    // Botão de alternar tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Observar mudanças na preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.themeKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Define o tema
   * @param {string} theme - 'light' ou 'dark'
   */
  setTheme(theme) {
    // Usar data-theme em vez de classes CSS
    document.documentElement.setAttribute('data-theme', theme);
    
    // Atualizar ícone baseado no tema atual
    this.updateThemeIcon(theme === 'dark' ? 'moon' : 'sun');
    
    // Atualizar cores do Chart.js para combinar com o tema
    this.updateChartColors(theme);
    
    // Salvar preferência
    localStorage.setItem(this.themeKey, theme);
    
    // Disparar evento de mudança de tema
    document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    
    console.log(`Tema alterado para: ${theme}`);
  }

  /**
   * Alterna entre os temas
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  /**
   * Atualiza o ícone do botão de tema
   * @param {string} icon - 'sun' ou 'moon'
   */
  updateThemeIcon(icon) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    if (icon === 'moon') {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      themeToggle.setAttribute('title', 'Mudar para tema claro');
    } else {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      themeToggle.setAttribute('title', 'Mudar para tema escuro');
    }
  }
  
  /**
   * Atualiza as cores dos gráficos para combinar com o tema atual
   * @param {string} theme - 'light' ou 'dark'
   */
  updateChartColors(theme) {
    // Definir cores globais para o Chart.js
    if (window.Chart) {
      const textColor = theme === 'dark' ? '#f8f9fa' : '#212529';
      const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      Chart.defaults.color = textColor;
      Chart.defaults.borderColor = gridColor;
      
      // Atualizar gráficos existentes
      // Em versões recentes do Chart.js, Chart.instances é um objeto, não um array
      // Precisamos acessá-lo de forma diferente
      if (Chart.instances) {
        // Para Chart.js v3+
        if (Object.values) {
          Object.values(Chart.instances).forEach(chart => {
            this.updateChartInstance(chart, textColor, gridColor);
          });
        } else {
          // Fallback para navegadores que não suportam Object.values
          Object.keys(Chart.instances).forEach(key => {
            const chart = Chart.instances[key];
            this.updateChartInstance(chart, textColor, gridColor);
          });
        }
      } else if (Chart.getChart) {
        // Abordagem alternativa para Chart.js v3+
        // Procurar todos os canvas que podem ter charts
        document.querySelectorAll('canvas').forEach(canvas => {
          const chart = Chart.getChart(canvas);
          if (chart) {
            this.updateChartInstance(chart, textColor, gridColor);
          }
        });
      }
    }
  }
  
  /**
   * Atualiza um gráfico específico com as novas cores de tema
   * @param {Object} chart - Instância do chart
   * @param {string} textColor - Cor do texto
   * @param {string} gridColor - Cor da grade
   */
  updateChartInstance(chart, textColor, gridColor) {
    // Atualizar opções de escala
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = gridColor;
        if (scale.ticks) scale.ticks.color = textColor;
      });
    }
    
    // Atualizar opções de legenda
    if (chart.options.plugins && chart.options.plugins.legend) {
      chart.options.plugins.legend.labels = { 
        color: textColor 
      };
    }
    
    chart.update();
  }
}

// Exportar função de inicialização
export function initTheme() {
  const themeManager = new ThemeManager();
  return themeManager;
}
