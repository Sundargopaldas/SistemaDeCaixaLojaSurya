/**
 * Script para iniciar o servidor de forma confiável
 * - Verifica se há processos usando as portas
 * - Encerra-os se necessário
 * - Inicia o servidor em uma porta disponível
 */

const { exec, spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

// Configurações
const DEFAULT_PORT = 3002;  // Alterado para 3002 para evitar conflito
const MAX_PORT_TRIES = 5;
const SERVER_PATH = path.join(__dirname, 'server.js');

// Criar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para encontrar processos usando uma porta específica
function findProcessByPort(port) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}` 
      : `lsof -i :${port} | grep LISTEN`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Não encontrou nenhum processo na porta, isso é ok
        resolve([]);
        return;
      }

      if (stderr) {
        console.error(`Erro ao executar comando: ${stderr}`);
        reject(stderr);
        return;
      }

      // Para Windows
      if (process.platform === 'win32') {
        const lines = stdout.trim().split('\n');
        const processes = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (!isNaN(parseInt(pid)) && !processes.includes(pid)) {
              processes.push(pid);
            }
          }
        });
        
        resolve(processes);
      } 
      // Para Linux/Mac
      else {
        const lines = stdout.trim().split('\n');
        const processes = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const pid = parts[1];
            if (!isNaN(parseInt(pid)) && !processes.includes(pid)) {
              processes.push(pid);
            }
          }
        });
        
        resolve(processes);
      }
    });
  });
}

// Função para matar um processo por PID
function killProcess(pid) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' 
      ? `taskkill /F /PID ${pid}` 
      : `kill -9 ${pid}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao matar processo ${pid}: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`Erro ao matar processo ${pid}: ${stderr}`);
        reject(stderr);
        return;
      }

      console.log(`✅ Processo ${pid} encerrado com sucesso`);
      resolve();
    });
  });
}

// Função para iniciar o servidor
function startServer(port = DEFAULT_PORT) {
  console.log(`\n🚀 Iniciando servidor na porta ${port}...`);
  
  // Definir variável de ambiente para a porta
  process.env.PORT = port;
  
  // Iniciar servidor como novo processo
  const serverProcess = spawn('node', [SERVER_PATH], {
    stdio: 'inherit',
    env: process.env
  });
  
  serverProcess.on('error', (error) => {
    console.error(`❌ Erro ao iniciar o servidor: ${error.message}`);
    process.exit(1);
  });
  
  console.log(`✅ Servidor PDV-Surya iniciado! Acesse: http://localhost:${port}`);
  console.log('👋 Pressione Ctrl+C para encerrar o servidor\n');
  
  return serverProcess;
}

// Função principal
async function main() {
  console.log('\n🔍 Verificando se a porta está disponível...');
  
  try {
    const processes = await findProcessByPort(DEFAULT_PORT);
    
    if (processes.length > 0) {
      console.log(`⚠️ A porta ${DEFAULT_PORT} já está em uso pelos processos: ${processes.join(', ')}`);
      
      rl.question('Deseja encerrar esses processos? (s/n) ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          console.log('🗑️ Encerrando processos...');
          
          for (const pid of processes) {
            try {
              await killProcess(pid);
            } catch (error) {
              console.error(`❌ Falha ao encerrar processo ${pid}:`, error);
            }
          }
          
          console.log('✅ Todos os processos foram encerrados');
          startServer();
        } else {
          console.log('⚠️ Mantendo os processos existentes. Tentando uma porta alternativa...');
          
          // Tentar porta alternativa
          let portAttempt = DEFAULT_PORT + 1;
          let serverStarted = false;
          
          while (portAttempt < DEFAULT_PORT + MAX_PORT_TRIES && !serverStarted) {
            const portProcesses = await findProcessByPort(portAttempt);
            
            if (portProcesses.length === 0) {
              startServer(portAttempt);
              serverStarted = true;
            } else {
              console.log(`⚠️ A porta ${portAttempt} também está em uso. Tentando próxima...`);
              portAttempt++;
            }
          }
          
          if (!serverStarted) {
            console.error(`❌ Não foi possível encontrar uma porta disponível após ${MAX_PORT_TRIES} tentativas.`);
            console.log('🔄 Execute o script scripts/kill-server.js para liberar as portas e tente novamente.');
            process.exit(1);
          }
        }
        
        rl.close();
      });
    } else {
      console.log(`✅ Porta ${DEFAULT_PORT} está disponível!`);
      startServer();
      rl.close();
    }
  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade da porta:', error);
    rl.close();
    process.exit(1);
  }
}

// Executar a função principal
main();
