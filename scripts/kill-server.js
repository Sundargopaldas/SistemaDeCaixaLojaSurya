/**
 * Script para encerrar todos os processos que estão usando as portas do servidor
 * Útil para quando temos problemas de EADDRINUSE (endereço já em uso)
 */

const { exec } = require('child_process');
const readline = require('readline');

// Portas que nosso servidor pode usar
const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

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
          // Formato do netstat: protocolo endereço-local endereço-remoto estado PID
          const parts = line.trim().split(/\s+/);
          // O PID é o último elemento
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
          // O PID é o segundo elemento no lsof
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

      console.log(`Processo ${pid} encerrado: ${stdout.trim()}`);
      resolve();
    });
  });
}

// Função principal para matar todos os processos nas portas
async function killAllServerProcesses() {
  console.log('Procurando por processos do servidor...');
  
  for (const port of PORTS) {
    try {
      const processes = await findProcessByPort(port);
      
      if (processes.length > 0) {
        console.log(`Encontrados ${processes.length} processos usando a porta ${port}: ${processes.join(', ')}`);
        
        // Perguntar se deseja matar todos os processos
        if (processes.length > 0) {
          rl.question(`Deseja encerrar ${processes.length} processos na porta ${port}? (s/n) `, async (answer) => {
            if (answer.toLowerCase() === 's') {
              for (const pid of processes) {
                try {
                  await killProcess(pid);
                } catch (error) {
                  console.error(`Falha ao encerrar processo ${pid}:`, error);
                }
              }
              console.log(`Todos os processos na porta ${port} foram encerrados.`);
            } else {
              console.log(`Mantendo processos na porta ${port}.`);
            }
            
            // Verificar se é a última porta para fechar o readline
            if (port === PORTS[PORTS.length - 1]) {
              rl.close();
            }
          });
        }
      } else {
        console.log(`Nenhum processo encontrado usando a porta ${port}`);
        
        // Verificar se é a última porta para fechar o readline
        if (port === PORTS[PORTS.length - 1]) {
          rl.close();
        }
      }
    } catch (error) {
      console.error(`Erro ao procurar processos na porta ${port}:`, error);
      
      // Verificar se é a última porta para fechar o readline
      if (port === PORTS[PORTS.length - 1]) {
        rl.close();
      }
    }
  }
}

// Executar a função principal
killAllServerProcesses();
