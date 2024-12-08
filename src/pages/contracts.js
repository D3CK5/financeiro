import { getClients } from '../services/clients.js';
import { addContract, getContracts, deleteContract, saveContracts } from '../services/contracts.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { createLayout } from '../components/layout.js';
import { showConfirmModal } from '../components/confirmModal.js';
import { getClientFullName } from '../services/clients.js';

// Função para mostrar modal de sucesso
function showSuccessModal(message) {
  const modalHtml = `
    <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-green-600">Sucesso</h2>
          <button onclick="document.getElementById('successModal').remove()" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <p class="text-gray-700 mb-4">${message}</p>
        <button 
          onclick="document.getElementById('successModal').remove()" 
          class="w-full btn btn-green"
        >
          Fechar
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Definir data atual fixa para testes
const CURRENT_DATE = new Date('2024-12-07T00:00:00-03:00');

// Função para ordenar contratos
function sortContracts(contracts) {
  return contracts.sort((a, b) => {
    // Priorizar contratos Ativos
    if (a.status === 'active' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'active') return 1;

    // Dentro do mesmo status, ordenar por data de criação (mais novos primeiro)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// Função principal para renderizar os contratos
export function renderContracts(contractsToRender = null) {
  const contracts = sortContracts(contractsToRender || getContracts());
  const clients = getClients();
  
  // Calcular métricas de contratos
  const contractMetrics = calculateContractMetrics(contracts);
  
  // Obter parcelas pendentes
  const pendingInstallments = getPendingInstallments(contracts, clients);

  const content = `
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white shadow rounded-lg p-4 flex items-center">
          <div class="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Contratos Ativos</h3>
            <p class="text-2xl font-bold text-blue-600">${contractMetrics.activeContractsCount}</p>
          </div>
        </div>
        <div class="bg-white shadow rounded-lg p-4 flex items-center">
          <div class="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Parcelas a Vencer</h3>
            <p class="text-2xl font-bold text-green-600">${contractMetrics.upcomingInstallmentsCount}</p>
          </div>
        </div>
        <div class="bg-white shadow rounded-lg p-4 flex items-center">
          <div class="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Parcelas em Atraso</h3>
            <p class="text-2xl font-bold text-red-600">${contractMetrics.overdueInstallmentsCount}</p>
          </div>
        </div>
      </div>

      ${pendingInstallments.length > 0 ? `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex items-center">
            <div class="ml-4 w-full ${pendingInstallments.length > 2 ? 'max-h-64 overflow-y-auto custom-scrollbar' : ''}">
              <h3 class="text-lg font-semibold text-yellow-800 mb-4">Parcelas Pendentes</h3>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-yellow-100 text-left">
                      <th class="px-4 py-2">Cliente</th>
                      <th class="px-4 py-2">Serviço</th>
                      <th class="px-4 py-2">Parcela</th>
                      <th class="px-4 py-2">Valor</th>
                      <th class="px-4 py-2">Data</th>
                      <th class="px-4 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pendingInstallments.map(item => `
                      <tr class="border-b border-yellow-200">
                        <td class="px-4 py-2">${getClientFullName(item.client)}</td>
                        <td class="px-4 py-2">${item.serviceName}</td>
                        <td class="px-4 py-2">${item.installmentNumber}º Parcela</td>
                        <td class="px-4 py-2">${formatCurrency(item.installmentAmount)}</td>
                        <td class="px-4 py-2 ${item.isOverdue ? 'text-red-600 font-bold' : 'text-green-600'}">
                          ${formatContractDate(item.dueDate)}
                        </td>
                        <td class="px-4 py-2 relative group">
                          <button 
                            onclick="window.markInstallmentAsPaid(${item.contractId}, ${item.installmentNumber})" 
                            class="text-green-600 hover:text-green-800 relative group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Contratos</h2>
        <button 
          type="button" 
          class="btn btn-primary"
          onclick="document.getElementById('addContractModal').classList.remove('hidden')"
        >
          Novo Contrato
        </button>
      </div>

      <div id="contractsSection">
        <div class="mb-4 flex items-center space-x-2">
        </div>

        <div id="contractsList" class="overflow-y-auto max-h-[600px] custom-scrollbar">
          <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcelas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${sortContracts(contracts).length > 0 ? sortContracts(contracts).map(contract => {
                const client = clients.find(c => c.id === contract.clientId);
                const statusTranslations = {
                  'active': 'Ativo',
                  'completed': 'Finalizado'
                };
                return `
                  <tr>
                    <td class="px-6 py-4">${getClientFullName(client) || 'Cliente não encontrado'}</td>
                    <td class="px-6 py-4">${contract.serviceName}</td>
                    <td class="px-6 py-4">${formatCurrency(contract.totalAmount)}</td>
                    <td class="px-6 py-4">${contract.installments.length}x</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'active' ? 'bg-green-50 text-green-800' : 
                        contract.status === 'completed' ? 'bg-red-50 text-red-800' : ''
                      }">
                        ${statusTranslations[contract.status] || contract.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 flex items-center space-x-2">
                      <div class="relative group">
                        <button 
                          onclick="window.deleteContract(${contract.id})" 
                          class="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div class="relative group">
                        <button 
                          type="button" 
                          class="text-blue-600 hover:text-blue-800"
                          onclick="window.viewContractDetails(${contract.id})"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <div id="addContractModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Novo Contrato</h2>
          <form id="addContractForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Cliente</label>
              <select name="clientId" required class="input">
                <option value="">Selecione um cliente</option>
                ${clients.map(client => `<option value="${client.id}">${getClientFullName(client)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Serviço</label>
              <input type="text" name="serviceName" required class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Valor Total</label>
              <input type="number" name="totalAmount" required class="input" step="0.01" min="0" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Parcelas</label>
              <div id="installmentsContainer" class="flex flex-col gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                <button type="button" onclick="window.addInstallment()" class="btn btn-secondary w-full">
                  + Adicionar Parcela
                </button>
              </div>
            </div>
            <div class="flex justify-end gap-4">
              <button 
                type="button" 
                class="btn btn-secondary"
                onclick="window.resetContractModal()"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const appContainer = document.querySelector('#app');
  appContainer.innerHTML = createLayout(content);
  setupContractEvents();
  setupContractSearch();
}

// Remover qualquer método global de edição de contrato
if (window.editContract) {
  delete window.editContract;
}

// Função para resetar o modal de contrato
window.resetContractModal = function() {
  const modal = document.getElementById('addContractModal');
  const form = document.getElementById('addContractForm');
  
  // Limpar todos os campos do formulário
  form.reset();
  
  // Remover todas as parcelas adicionadas
  const installmentsContainer = document.getElementById('installmentsContainer');
  const installmentRows = installmentsContainer.querySelectorAll('.installment-row');
  installmentRows.forEach(row => row.remove());
  
  // Esconder o modal
  modal.classList.add('hidden');
}

// Configurar eventos para o formulário de contratos
function setupContractEvents() {
  const contractForm = document.getElementById('addContractForm');

  if (contractForm) {
    contractForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contractForm);

      const installmentsContainer = document.getElementById('installmentsContainer');
      const installments = Array.from(installmentsContainer.querySelectorAll('.installment-row')).map(row => ({
        number: parseInt(row.querySelector('input[name="installmentNumber"]').value),
        amount: parseFloat(row.querySelector('input[name="installmentAmount"]').value),
        dueDate: new Date(row.querySelector('input[name="installmentDate"]').value),
        paid: false,
      }));

      const contractData = {
        clientId: formData.get('clientId'),
        serviceName: formData.get('serviceName'),
        totalAmount: parseFloat(formData.get('totalAmount')),
        installments: installments,
        status: 'active',
      };

      addContract(contractData);
      document.getElementById('addContractModal').classList.add('hidden');
      renderContracts();
    });
  }

  window.addInstallment = () => {
    const installmentsContainer = document.getElementById('installmentsContainer');
    const installmentCount = installmentsContainer.querySelectorAll('.installment-row').length;
    const newInstallmentHTML = `
      <div class="installment-row flex items-center space-x-2">
        <span class="text-sm font-medium">${installmentCount + 1}º</span>
        <input type="number" name="installmentNumber" value="${installmentCount + 1}" class="hidden" required />
        <input type="number" name="installmentAmount" placeholder="Valor" class="input" required min="0" />
        <input type="date" name="installmentDate" class="input" required />
        <button type="button" onclick="removeInstallment(this)" class="text-red-500 hover:text-red-700">
          X
        </button>
      </div>
    `;
    installmentsContainer.insertAdjacentHTML('beforeend', newInstallmentHTML);
  };

  window.removeInstallment = (button) => {
    const installmentRow = button.closest('.installment-row');
    installmentRow.remove();

    const rows = Array.from(document.querySelectorAll('.installment-row'));
    rows.forEach((row, index) => {
      row.querySelector('span').textContent = `${index + 1}º`;
      row.querySelector('input[name="installmentNumber"]').value = index + 1;
    });
  };

  window.deleteContract = (id) => {
    showConfirmModal({
      title: 'Excluir Contrato',
      message: 'Tem certeza que deseja excluir este contrato?',
      confirmText: 'Sim, excluir',
      onConfirm: () => {
        deleteContract(id);
        renderContracts();
      },
    });
  };
}

// Adicionar campo de busca ao renderizar página de contratos
function setupContractSearch() {
  const contractsSection = document.getElementById('contractsSection');
  
  if (contractsSection) {
    // Criar container para busca
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container mb-4 flex items-center space-x-2';
    
    // Criar input de busca
    const searchInput = document.createElement('input');
    searchInput.id = 'contractSearchInput';
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar contratos...';
    searchInput.className = 'input flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    // Adicionar evento de busca ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = e.target.value;
        searchContracts(searchTerm);
      }
    });

    // Criar botão de busca
    const searchButton = document.createElement('button');
    searchButton.id = 'searchContractButton';
    searchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    `;
    searchButton.className = 'p-2 hover:bg-gray-100 rounded-full';
    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value;
      searchContracts(searchTerm);
    });

    // Criar botão de limpar busca
    const clearSearchButton = document.createElement('button');
    clearSearchButton.id = 'clearContractSearchButton';
    clearSearchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    clearSearchButton.className = 'p-2 hover:bg-gray-100 rounded-full';
    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      renderContracts(); // Restaurar lista completa
    });

    // Montar container de busca
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(clearSearchButton);

    // Inserir antes da lista de contratos
    const contractsTable = document.querySelector('#contractsList');
    contractsTable.parentNode.insertBefore(searchContainer, contractsTable);
  }
}

// Função para buscar contratos
function searchContracts(searchTerm) {
  const contracts = getContracts();
  const clients = getClients();

  // Converter termo de busca para minúsculas para comparação case-insensitive
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  // Filtrar contratos baseado em múltiplos critérios
  const filteredContracts = contracts.filter(contract => {
    // Encontrar cliente do contrato
    const client = clients.find(c => c.id === contract.clientId);

    // Verificar correspondência em:
    // 1. Nome do cliente
    // 2. Nome do serviço
    // 3. ID do contrato
    // 4. Status do contrato
    const matchesClient = client && getClientFullName(client).toLowerCase().includes(normalizedSearchTerm);
    const matchesService = contract.serviceName.toLowerCase().includes(normalizedSearchTerm);
    const matchesContractId = contract.id.toString().includes(normalizedSearchTerm);
    const matchesStatus = contract.status.toLowerCase().includes(normalizedSearchTerm);

    return matchesClient || matchesService || matchesContractId || matchesStatus;
  });

  // Renderizar contratos filtrados
  renderContracts(filteredContracts);
}

// Função para verificar se uma data é anterior à outra
function isDateBefore(date1, date2) {
  return (
    date1.getFullYear() < date2.getFullYear() || 
    (date1.getFullYear() === date2.getFullYear() && 
      (date1.getMonth() < date2.getMonth() || 
       (date1.getMonth() === date2.getMonth() && 
        date1.getDate() < date2.getDate())))
  );
}

// Função para formatar data com ano de 4 dígitos
function formatContractDate(date) {
  const formattedDate = new Date(date);
  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = formattedDate.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Função para converter data local considerando timezone
function toLocalISOString(date, timeZone) {
  const localDate = new Date(date);
  // Adiciona 1 dia para compensar o problema de subtração
  localDate.setDate(localDate.getDate() + 1);
  return localDate.toISOString();
}

// Função para verificar se uma parcela está vencida
function isInstallmentOverdue(dueDate) {
  const now = new Date(CURRENT_DATE); // Data atual fixa
  const due = new Date(toLocalISOString(dueDate)); // Data de vencimento da parcela

  // Comparar considerando ano, mês e dia
  const isOverdue = 
    now.getFullYear() > due.getFullYear() || 
    (now.getFullYear() === due.getFullYear() && 
      (now.getMonth() > due.getMonth() || 
       (now.getMonth() === due.getMonth() && 
        now.getDate() > due.getDate())));

  return isOverdue;
}

// Função para verificar se uma parcela está a vencer
function isInstallmentUpcoming(dueDate) {
  const now = new Date(CURRENT_DATE);
  const due = new Date(toLocalISOString(dueDate));
  const sevenDaysFromNow = new Date(CURRENT_DATE);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Está a vencer se estiver entre a data atual e 7 dias à frente
  const isUpcoming = 
    due > now && due <= sevenDaysFromNow && !isInstallmentOverdue(dueDate);

  return isUpcoming;
}

// Função para obter parcelas pendentes
function getPendingInstallments(contracts, clients) {
  const sevenDaysFromNow = new Date(CURRENT_DATE);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const pendingInstallments = contracts.flatMap(contract => {
    // Apenas contratos ativos
    if (contract.status !== 'active') return [];

    // Encontrar cliente do contrato
    const client = clients.find(c => c.id === contract.clientId);

    return contract.installments
      .filter(installment => !installment.paid)
      .map(installment => {
        const installmentDate = new Date(toLocalISOString(installment.dueDate));
        const isOverdue = isInstallmentOverdue(installment.dueDate);
        const isUpcoming = isInstallmentUpcoming(installment.dueDate);

        return {
          contractId: contract.id,
          client: client,
          serviceName: contract.serviceName,
          installmentNumber: installment.number,
          installmentAmount: installment.amount,
          dueDate: installmentDate,
          isOverdue: isOverdue,
          isUpcoming: isUpcoming
        };
      })
      .filter(installment => installment.isOverdue || installment.isUpcoming);
  });

  // Ordenar por data de vencimento
  return pendingInstallments.sort((a, b) => a.dueDate - b.dueDate);
}

// Função para calcular métricas de contratos
function calculateContractMetrics(contracts) {
  const metrics = {
    activeContractsCount: 0,
    upcomingInstallmentsCount: 0,
    overdueInstallmentsCount: 0
  };

  contracts.forEach(contract => {
    // Contratos ativos
    if (contract.status === 'active') {
      metrics.activeContractsCount++;

      // Parcelas a vencer e em atraso
      contract.installments.forEach(installment => {
        // Parcelas não pagas
        if (!installment.paid) {
          if (isInstallmentOverdue(installment.dueDate)) {
            metrics.overdueInstallmentsCount++;
          } else if (isInstallmentUpcoming(installment.dueDate)) {
            metrics.upcomingInstallmentsCount++;
          }
        }
      });
    }
  });

  return metrics;
}

// Função para marcar parcela como paga
function markInstallmentAsPaid(contractId, installmentNumber) {
  console.log('Marcando parcela como paga:', { contractId, installmentNumber });
  
  // Converter contractId para string, se necessário
  contractId = contractId.toString();
  
  // Obter contratos atuais
  const contracts = getContracts();
  console.log('Contratos carregados:', contracts);
  
  // Encontrar o contrato específico
  const contractIndex = contracts.findIndex(contract => contract.id === contractId);
  console.log('Índice do contrato:', contractIndex);
  
  if (contractIndex !== -1) {
    // Encontrar a parcela específica
    const installmentIndex = contracts[contractIndex].installments.findIndex(
      installment => installment.number === installmentNumber
    );
    console.log('Índice da parcela:', installmentIndex);
    
    if (installmentIndex !== -1) {
      // Obter valor da parcela
      const installmentAmount = contracts[contractIndex].installments[installmentIndex].amount;
      console.log('Valor da parcela:', installmentAmount);
      
      // Marcar parcela como paga
      contracts[contractIndex].installments[installmentIndex].paid = true;
      contracts[contractIndex].installments[installmentIndex].paymentDate = new Date().toISOString();
      
      // Atualizar valor recebido do contrato
      if (!contracts[contractIndex].receivedValue) {
        contracts[contractIndex].receivedValue = 0;
      }
      contracts[contractIndex].receivedValue += installmentAmount;
      
      // Verificar se todas as parcelas foram pagas
      const allInstallmentsPaid = contracts[contractIndex].installments.every(
        installment => installment.paid
      );
      
      // Se todas as parcelas foram pagas, marcar contrato como concluído
      if (allInstallmentsPaid) {
        contracts[contractIndex].status = 'completed';
      }
      
      // Salvar contratos atualizados
      saveContracts(contracts);
      
      // Recarregar página de contratos
      renderContracts();
      
      // Mostrar mensagem de sucesso
      showSuccessModal(`Parcela Nº ${installmentNumber} paga. Valor recebido:${formatCurrency(installmentAmount)}`);
    } else {
      console.error('Parcela não encontrada', { contractId, installmentNumber, installments: contracts[contractIndex].installments });
    }
  } else {
    console.error('Contrato não encontrado', { contractId, contracts });
  }
}

// Adicionar método global para marcar parcela como paga
window.markInstallmentAsPaid = markInstallmentAsPaid;

// Função para visualizar detalhes do contrato
function viewContractDetails(contractId) {
  // Converter contractId para string
  contractId = contractId.toString();
  
  // Obter contratos e clientes
  const contracts = getContracts();
  const clients = getClients();
  
  // Encontrar o contrato específico
  const contract = contracts.find(contract => contract.id === contractId);
  
  if (!contract) {
    showSuccessModal('Contrato não encontrado.');
    return;
  }
  
  // Encontrar o cliente do contrato
  const client = clients.find(client => client.id === contract.clientId);
  
  // Criar modal de visualização de contrato
  const modalHtml = `
    <div id="viewContractModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Detalhes do Contrato</h2>
          <button 
            onclick="document.getElementById('viewContractModal').remove()" 
            class="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <p class="input bg-gray-100">${getClientFullName(client)}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
              <p class="input bg-gray-100">${contract.serviceName}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Valor Total</label>
              <p class="input bg-gray-100">${formatCurrency(contract.totalAmount)}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Valor Recebido</label>
              <p class="input bg-gray-100">${formatCurrency(contract.receivedValue || 0)}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-4">Parcelas</h3>
            <div class="space-y-2">
              ${contract.installments.map(installment => {
                let bgColor = 'bg-gray-100';
                let statusText = 'Aguardando';
                
                if (installment.paid) {
                  bgColor = 'bg-green-100';
                  statusText = 'Pago';
                } else {
                  const isOverdue = isInstallmentOverdue(installment.dueDate);
                  const isUpcoming = isInstallmentUpcoming(installment.dueDate);
                  
                  if (isOverdue) {
                    bgColor = 'bg-red-100';
                    statusText = 'Atrasado';
                  } else if (isUpcoming) {
                    bgColor = 'bg-yellow-100';
                    statusText = 'A Vencer';
                  }
                }
                
                return `
                  <div class="flex items-center space-x-4 ${bgColor} p-3 rounded-lg">
                    <div class="flex-grow">
                      <p class="font-semibold">${installment.number}º Parcela</p>
                      <p class="text-sm text-gray-600">${formatContractDate(installment.dueDate)}</p>
                    </div>
                    <div>
                      <p class="font-semibold">${formatCurrency(installment.amount)}</p>
                      <p class="text-sm ${
                        statusText === 'Pago' ? 'text-green-600' : 
                        statusText === 'Atrasado' ? 'text-red-600' : 
                        'text-yellow-600'
                      }">
                        ${statusText}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t flex justify-end">
          <button 
            onclick="document.getElementById('viewContractModal').remove()" 
            class="btn btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Inserir modal no corpo do documento
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Adicionar método global para visualizar contrato
window.viewContractDetails = viewContractDetails;

// Adicionar estilo de scrollbar personalizado e fino
const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar {
    scrollbar-width: thin; /* Para Firefox */
    scrollbar-color: rgba(0,0,0,0.2) transparent; /* Para Firefox */
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px; /* Largura muito fina da barra de rolagem */
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent; /* Fundo transparente */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2); /* Cor cinza claro semi-transparente */
    border-radius: 2px; /* Bordas arredondadas */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0,0,0,0.3); /* Cor um pouco mais escura no hover */
  }
`;
document.head.appendChild(style);

// Chamar setup de busca após renderização inicial
document.addEventListener('DOMContentLoaded', () => {
  setupContractSearch();
});
