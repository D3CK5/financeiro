import { getClientById, findClientByFullName, getClientFullName } from './clients.js';

const STORAGE_KEY = 'contracts';

// Função para gerar ID único
function generateUniqueId(contracts) {
  return Date.now().toString();
}

export function getContracts() {
  const contracts = localStorage.getItem(STORAGE_KEY);
  return contracts ? JSON.parse(contracts) : [];
}

export function addContract(contract) {
  const contracts = getContracts();
  
  // Buscar cliente pelo nome completo
  const client = findClientByFullName(contract.clientName, contract.clientSurname);
  
  if (!client) {
    throw new Error(`Cliente não encontrado: ${contract.clientName} ${contract.clientSurname}`);
  }
  
  // Adicionar status inicial como active
  const newContract = {
    ...contract,
    clientId: client.id, // Usar o ID do cliente encontrado
    id: generateUniqueId(contracts),
    status: 'active', // Status em inglês para manter consistência
    createdAt: new Date().toISOString(), // Adicionar data de criação para ordenação
    installments: contract.installments.map(installment => ({
      ...installment,
      paid: false
    }))
  };

  contracts.push(newContract);
  saveContracts(contracts);
  return newContract;
}

export function getContractsByClient(clientId) {
  const contracts = getContracts();
  return contracts.filter(contract => contract.clientId === clientId);
}

export function getPendingPayments() {
  const contracts = getContracts();
  const today = new Date();
  const pendingPayments = [];

  contracts.forEach(contract => {
    contract.installments.forEach(installment => {
      if (!installment.paid) {
        const dueDate = new Date(installment.dueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7) {
          const client = getClientById(contract.clientId);
          pendingPayments.push({
            ...installment,
            contractId: contract.id,
            clientName: client.name,
            clientPhone: client.phone,
            daysUntilDue,
            isLate: daysUntilDue < 0
          });
        }
      }
    });
  });

  return pendingPayments.sort((a, b) => {
    if (a.isLate && !b.isLate) return -1;
    if (!a.isLate && b.isLate) return 1;
    return Math.abs(a.daysUntilDue) - Math.abs(b.daysUntilDue);
  });
}

export function saveContracts(contracts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

export function deleteContract(id) {
  const contracts = getContracts();
  console.log('Deleting contract:', { 
    id, 
    contractIds: contracts.map(c => c.id),
    type: typeof id 
  });
  
  // Converter id para string e comparar
  const updatedContracts = contracts.filter(contract => contract.id.toString() !== id.toString());
  
  console.log('Contracts after deletion:', {
    originalCount: contracts.length,
    updatedCount: updatedContracts.length
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContracts));
  return updatedContracts;
}

export function markInstallmentAsPaid(contractId, installmentNumber) {
  const contracts = getContracts();
  const contractIndex = contracts.findIndex(c => c.id === contractId);

  if (contractIndex !== -1) {
    const contract = contracts[contractIndex];
    const installmentIndex = contract.installments.findIndex(i => i.installmentNumber === installmentNumber);

    if (installmentIndex !== -1) {
      // Marcar parcela como paga
      contract.installments[installmentIndex].paid = true;
      contract.installments[installmentIndex].paidAt = new Date().toISOString();

      // Verificar se todas as parcelas foram pagas
      const allInstallmentsPaid = contract.installments.every(installment => installment.paid);
      
      // Se todas as parcelas foram pagas, alterar status para completed
      if (allInstallmentsPaid) {
        contract.status = 'completed';
        contract.finishedAt = new Date().toISOString();
      }

      saveContracts(contracts);
      return true;
    }
  }

  return false;
}

// Função para ordenar contratos
export function sortContracts(contracts) {
  return contracts.sort((a, b) => {
    // Priorizar contratos ativos
    if (a.status === 'active' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'active') return 1;

    // Dentro do mesmo status, ordenar por data de criação (mais novos primeiro)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export function exportContractsToFile() {
  const contracts = getContracts();
  const dataStr = JSON.stringify(contracts, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `contratos_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importContractsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedContracts = JSON.parse(event.target.result);
        
        // Validar estrutura dos contratos importados
        const isValidImport = importedContracts.every(contract => 
          contract.clientId && contract.serviceName && contract.installments
        );
        
        if (!isValidImport) {
          throw new Error('Formato de importação inválido');
        }
        
        // Substituir contratos existentes
        localStorage.setItem('contracts', JSON.stringify(importedContracts));
        resolve(importedContracts);
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
    const contracts = getContracts();
    const backupKey = `contracts_backup_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(backupKey, JSON.stringify(contracts));
    
    // Limitar número de backups
    const allBackupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('contracts_backup_'));
    
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