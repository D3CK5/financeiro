import { addExpense, getExpenses, deleteExpense } from '../services/expenses.js';
import { addRevenue, getRevenues, deleteRevenue } from '../services/revenue.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { createLayout } from '../components/layout.js';
import { showConfirmModal } from '../components/confirmModal.js';

export function renderExpenses() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const expenses = getExpenses();
  const revenues = getRevenues();
  
  const content = `
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">Lançamentos</h1>
        <div class="flex items-center gap-2">
          <select id="monthFilter" class="input py-1 w-[150px]">
            ${Array.from({ length: 12 }, (_, i) => {
              const date = new Date(2024, i, 1);
              return `<option value="${i}" ${i === currentMonth ? 'selected' : ''}>
                ${date.toLocaleString('pt-BR', { month: 'long' })}
              </option>`;
            }).join('')}
          </select>
          <select id="yearFilter" class="input py-1 w-[150px]">
            ${Array.from({ length: 5 }, (_, i) => {
              const year = currentYear - 2 + i;
              return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>
                ${year}
              </option>`;
            }).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Coluna de Faturamento -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Faturamento Diário</h2>
            <button 
              onclick="openRevenueModal()"
              class="btn btn-primary"
            >
              Novo Faturamento
            </button>
          </div>

          <div class="overflow-y-auto max-h-[600px]">
            <div class="space-y-4" id="revenueList">
              ${revenues
                .filter(revenue => {
                  const revenueDate = new Date(revenue.date);
                  return revenueDate.getMonth() === currentMonth && 
                         revenueDate.getFullYear() === currentYear;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(revenue => `
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <p class="font-medium">${formatDate(revenue.date)}</p>
                        ${revenue.description ? `<p class="text-sm text-gray-600">${revenue.description}</p>` : ''}
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-green-600 font-medium">+${formatCurrency(revenue.amount)}</span>
                        <button 
                          onclick="deleteRevenue('${revenue.id}')"
                          class="text-red-600 hover:text-red-900"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('') || '<p class="text-gray-500 text-center">Nenhum faturamento registrado</p>'
              }
            </div>
          </div>
        </div>

        <!-- Coluna de Despesas -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Despesas</h2>
            <button 
              onclick="openExpenseModal()"
              class="btn btn-primary"
            >
              Nova Despesa
            </button>
          </div>

          <div class="overflow-y-auto max-h-[600px]">
            <div class="space-y-4" id="expenseList">
              ${expenses
                .filter(expense => {
                  const expenseDate = new Date(expense.date);
                  return expenseDate.getMonth() === currentMonth && 
                         expenseDate.getFullYear() === currentYear;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(expense => `
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <p class="font-medium">${formatDate(expense.date)}</p>
                        <p class="text-sm text-gray-600">${expense.description}</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-red-600 font-medium">-${formatCurrency(expense.amount)}</span>
                        <button 
                          onclick="deleteExpense('${expense.id}')"
                          class="text-red-600 hover:text-red-900"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('') || '<p class="text-gray-500 text-center">Nenhuma despesa registrada</p>'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#app').innerHTML = createLayout(content);
  setupExpenseEvents();
}

function setupExpenseEvents() {
  // Adicionar eventos de deleção globais
  window.deleteExpense = (id) => {
    showConfirmModal({
      title: 'Excluir Despesa',
      message: 'Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, excluir',
      onConfirm: () => {
        deleteExpense(id);
        renderExpenses();
      }
    });
  };

  window.deleteRevenue = (id) => {
    showConfirmModal({
      title: 'Excluir Faturamento',
      message: 'Tem certeza que deseja excluir este faturamento? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, excluir',
      onConfirm: () => {
        deleteRevenue(id);
        renderExpenses();
      }
    });
  };

  // Adicionar event listeners para filtros de mês e ano
  const monthFilter = document.getElementById('monthFilter');
  const yearFilter = document.getElementById('yearFilter');

  monthFilter.addEventListener('change', updateExpensesView);
  yearFilter.addEventListener('change', updateExpensesView);

  function updateExpensesView() {
    const selectedMonth = parseInt(monthFilter.value);
    const selectedYear = parseInt(yearFilter.value);

    const revenues = getRevenues();
    const expenses = getExpenses();

    const revenueList = document.getElementById('revenueList');
    const expenseList = document.getElementById('expenseList');

    const filteredRevenues = revenues
      .filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate.getMonth() === selectedMonth && 
               revenueDate.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedMonth && 
               expenseDate.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    revenueList.innerHTML = filteredRevenues.map(revenue => `
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-medium">${formatDate(revenue.date)}</p>
            ${revenue.description ? `<p class="text-sm text-gray-600">${revenue.description}</p>` : ''}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-green-600 font-medium">+${formatCurrency(revenue.amount)}</span>
            <button 
              onclick="deleteRevenue('${revenue.id}')"
              class="text-red-600 hover:text-red-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500 text-center">Nenhum faturamento registrado</p>';

    expenseList.innerHTML = filteredExpenses.map(expense => `
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-medium">${formatDate(expense.date)}</p>
            <p class="text-sm text-gray-600">${expense.description}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-red-600 font-medium">-${formatCurrency(expense.amount)}</span>
            <button 
              onclick="deleteExpense('${expense.id}')"
              class="text-red-600 hover:text-red-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500 text-center">Nenhuma despesa registrada</p>';
  }

  // Funções para abrir modais
  window.openRevenueModal = () => {
    const modal = document.createElement('div');
    modal.id = 'addRevenueModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Registrar Faturamento</h2>
        <form id="addRevenueForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <input type="text" name="description" required class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Valor</label>
            <input type="number" name="amount" required class="input" step="0.01" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Data</label>
            <input type="date" name="date" required class="input" />
          </div>
          <div class="flex justify-end gap-4">
            <button 
              type="button" 
              class="btn btn-secondary"
              onclick="this.closest('.fixed').remove()"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const revenueForm = document.getElementById('addRevenueForm');
    revenueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(revenueForm);

      const revenueData = {
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
      };

      addRevenue(revenueData);
      modal.remove();
      renderExpenses();
    });
  };

  window.openExpenseModal = () => {
    const modal = document.createElement('div');
    modal.id = 'addExpenseModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Registrar Despesa</h2>
        <form id="addExpenseForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <input type="text" name="description" required class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Valor</label>
            <input type="number" name="amount" required class="input" step="0.01" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Data</label>
            <input type="date" name="date" required class="input" />
          </div>
          <div class="flex justify-end gap-4">
            <button 
              type="button" 
              class="btn btn-secondary"
              onclick="this.closest('.fixed').remove()"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const expenseForm = document.getElementById('addExpenseForm');
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(expenseForm);

      const expenseData = {
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
      };

      addExpense(expenseData);
      modal.remove();
      renderExpenses();
    });
  };
}
