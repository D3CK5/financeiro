const STORAGE_KEY = 'clients';

export function getClients() {
  const clients = localStorage.getItem(STORAGE_KEY);
  return clients ? JSON.parse(clients) : [];
}

export function addClient(client) {
  const clients = getClients();
  const newClient = {
    ...client,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ativo'
  };
  clients.push(newClient);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  return newClient;
}

export function updateClient(id, updatedData) {
  const clients = getClients();
  const index = clients.findIndex(client => client.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    return clients[index];
  }
  return null;
}

export function deleteClient(id) {
  const clients = getClients();
  const filteredClients = clients.filter(client => client.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredClients));
}

export function getClientById(id) {
  const clients = getClients();
  return clients.find(client => client.id === id);
}

export function findClientByFullName(name, surname) {
  const clients = getClients();
  return clients.find(client => 
    client.name.toLowerCase() === name.toLowerCase() && 
    client.surname.toLowerCase() === surname.toLowerCase()
  );
}

export function getClientFullName(client) {
  return `${client.name} ${client.surname}`;
}

export function exportClientsToFile() {
  const clients = getClients();
  const dataStr = JSON.stringify(clients, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `clientes_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importClientsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedClients = JSON.parse(event.target.result);
        
        // Validar estrutura dos clientes importados
        const isValidImport = importedClients.every(client => 
          client.name && client.surname && client.id
        );
        
        if (!isValidImport) {
          throw new Error('Formato de importação inválido');
        }
        
        // Substituir clientes existentes
        localStorage.setItem('clients', JSON.stringify(importedClients));
        resolve(importedClients);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Função para criar backup automático
export function setupAutomaticBackup() {
  // Criar backup a cada 24 horas
  setInterval(() => {
    const clients = getClients();
    const backupKey = `clients_backup_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(backupKey, JSON.stringify(clients));
    
    // Limitar número de backups
    const allBackupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('clients_backup_'));
    
    if (allBackupKeys.length > 7) {
      // Manter apenas os 7 backups mais recentes
      const oldestBackupKey = allBackupKeys
        .sort()
        .shift();
      localStorage.removeItem(oldestBackupKey);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

// Chamar setup de backup quando o módulo for carregado
setupAutomaticBackup();