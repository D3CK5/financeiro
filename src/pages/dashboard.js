import { getCurrentUser } from '../services/auth.js';
import { getRevenueStats, addRevenue, getMonthlyRevenue, getRevenues } from '../services/revenue.js';
import { getMonthlyExpenses, getExpenses } from '../services/expenses.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { createMonthlyChart } from '../components/charts.js';
import { createLayout } from '../components/layout.js';

export function renderDashboard() {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const content = `
    <div class="container mx-auto px-4 py-8 relative">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="flex gap-4 items-center mt-4 md:mt-0">
          <div class="flex items-center gap-2">
            <select id="monthFilter" class="input py-1 widt:150px">
              ${Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2024, i, 1);
                return `<option value="${i}" ${i === currentMonth ? 'selected' : ''}>
                  ${date.toLocaleString('pt-BR', { month: 'long' })}
                </option>`;
              }).join('')}
            </select>
            <select id="yearFilter" class="input py-1 widt:150px">
              ${Array.from({ length: 5 }, (_, i) => {
                const year = currentYear - 2 + i;
                return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>
                  ${year}
                </option>`;
              }).join('')}
            </select>
          </div>
          ${isAdmin ? `
            <button class="btn btn-primary" onclick="document.getElementById('addRevenueModal').classList.remove('hidden')">
              Registrar Faturamento
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Gráfico de Faturamento Mensal -->
      <div class="card mb-8">
        <h3 class="text-lg font-semibold mb-4">Faturamento Mensal</h3>
        <div class="relative" style="height: 400px">
          <canvas id="monthlyRevenueChart"></canvas>
        </div>
      </div>

      <!-- Colunas de Faturamento e Despesas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Faturamento Diário -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Faturamento Diário</h3>
            ${isAdmin ? `
              <button class="btn btn-secondary text-sm" onclick="document.getElementById('addDailyRevenueModal').classList.remove('hidden')">
                Registrar Dia
              </button>
            ` : ''}
          </div>
          <div class="space-y-3 max-h-[400px] overflow-y-auto">
            <div id="dailyRevenueList"></div>
          </div>
        </div>

        <!-- Despesas -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Despesas do Mês</h3>
            <a href="/expenses" data-link class="btn btn-secondary text-sm">
              Ver Todas
            </a>
          </div>
          <div class="space-y-3 max-h-[400px] overflow-y-auto">
            <div id="expensesList"></div>
          </div>
        </div>
      </div>

      <!-- Modal Registrar Faturamento -->
      <div id="addRevenueModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                onclick="document.getElementById('addRevenueModal').classList.add('hidden')"
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

      <!-- Modal Registrar Faturamento Diário -->
      <div id="addDailyRevenueModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Registrar Faturamento do Dia</h2>
          <form id="addDailyRevenueForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Data</label>
              <input type="date" name="date" required class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Faturamento Total do Dia</label>
              <input type="number" name="amount" required class="input" step="0.01" />
            </div>
            <div class="flex justify-end gap-4">
              <button 
                type="button" 
                class="btn btn-secondary"
                onclick="document.getElementById('addDailyRevenueModal').classList.add('hidden')"
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

      <!-- Botão de toggle de cards -->
    </div>
  `;

  document.querySelector('#app').innerHTML = createLayout(content);
  setupDashboardEvents();
  updateDashboardData(currentMonth, currentYear);
}

function createToggleCardsButton() {
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = `
    <div class="relative flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
      <span class="tooltip absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300">
        Minimizar Cards
      </span>
    </div>
  `;
  toggleButton.className = 'absolute top-1 left-2 z-50 toggle-all-cards-btn group';
  
  // Adicionar tooltips de hover
  toggleButton.addEventListener('mouseenter', (e) => {
    const tooltip = e.currentTarget.querySelector('.tooltip');
    const annualCardsContainer = document.querySelector('.annual-summary-cards');
    const isMinimized = annualCardsContainer.classList.contains('cards-minimized');
    
    tooltip.textContent = isMinimized ? 'Expandir Cards' : 'Minimizar Cards';
    tooltip.classList.remove('opacity-0');
    tooltip.classList.add('opacity-100');
  });

  toggleButton.addEventListener('mouseleave', (e) => {
    const tooltip = e.currentTarget.querySelector('.tooltip');
    tooltip.classList.remove('opacity-100');
    tooltip.classList.add('opacity-0');
  });
  
  toggleButton.addEventListener('click', () => {
    const annualCardsContainer = document.querySelector('.annual-summary-cards');
    const monthlyCardsContainer = document.querySelector('.summary-cards');
    
    // Verificar se já está minimizado
    const isMinimized = annualCardsContainer.classList.contains('cards-minimized');
    
    if (isMinimized) {
      // Expansão
      annualCardsContainer.classList.remove('cards-minimized');
      monthlyCardsContainer.classList.remove('cards-minimized');
    } else {
      // Minimização
      annualCardsContainer.classList.add('cards-minimized');
      monthlyCardsContainer.classList.add('cards-minimized');
    }
    
    // Atualizar ícone do botão
    const svgPath = toggleButton.querySelector('svg path');
    svgPath.setAttribute('d', isMinimized 
      ? "M5 15l7-7 7 7"  // Seta para cima (minimizado)
      : "M19 9l-7 7-7-7"  // Seta para baixo (expandido)
    );
  });

  return toggleButton;
}

function updateDashboardData(month, year) {
  const revenues = getMonthlyRevenue(month, year);
  const expenses = getMonthlyExpenses(month, year);
  
  // Calcular totais do mês atual
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netRevenue = totalRevenue - totalExpenses;

  // Calcular totais anuais
  const allRevenues = getRevenues().filter(r => new Date(r.date).getFullYear() === year);
  const allExpenses = getExpenses().filter(e => new Date(e.date).getFullYear() === year);

  const annualRevenue = allRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const annualExpenses = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const annualNetRevenue = annualRevenue - annualExpenses;

  // Atualizar ou criar cards anuais
  let annualCardsContainer = document.querySelector('.annual-summary-cards');
  if (!annualCardsContainer) {
    annualCardsContainer = document.createElement('div');
    annualCardsContainer.className = 'annual-summary-cards relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-8';
    const monthlyChartCard = document.querySelector('.card.mb-8');
    monthlyChartCard.parentNode.insertBefore(annualCardsContainer, monthlyChartCard);
  }

  // Criar container para o botão de toggle
  let toggleButtonContainer = document.querySelector('.toggle-all-cards-container');
  if (!toggleButtonContainer) {
    toggleButtonContainer = document.createElement('div');
    toggleButtonContainer.className = 'toggle-all-cards-container relative';
    annualCardsContainer.parentNode.insertBefore(toggleButtonContainer, annualCardsContainer);
  }

  // Adicionar botão de toggle
  const existingToggleButton = toggleButtonContainer.querySelector('.toggle-all-cards-btn');
  if (!existingToggleButton) {
    const toggleButton = createToggleCardsButton();
    toggleButtonContainer.appendChild(toggleButton);
  }

  const annualCardsContent = `
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-600">Faturamento Líquido Anual</h3>
      <p class="text-2xl font-bold ${annualNetRevenue >= 0 ? 'text-blue-600' : 'text-red-600'}">
        ${formatCurrency(annualNetRevenue)}
      </p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-600">Despesas Anuais</h3>
      <p class="text-2xl font-bold text-red-600">${formatCurrency(annualExpenses)}</p>
    </div>
  `;
  
  // Limpar conteúdo e adicionar novamente
  annualCardsContainer.innerHTML = '';
  annualCardsContainer.insertAdjacentHTML('beforeend', annualCardsContent);

  // Atualizar ou criar cards mensais
  let summaryCardsContainer = document.querySelector('.summary-cards');
  if (!summaryCardsContainer) {
    summaryCardsContainer = document.createElement('div');
    summaryCardsContainer.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-6 mb-8';
    const monthlyChartCard = document.querySelector('.card.mb-8');
    monthlyChartCard.parentNode.insertBefore(summaryCardsContainer, monthlyChartCard);
  }

  summaryCardsContainer.innerHTML = `
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-600">Faturamento Líquido</h3>
      <p class="text-2xl font-bold ${netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${formatCurrency(netRevenue)}
      </p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-600">Total de Despesas</h3>
      <p class="text-2xl font-bold text-red-600">${formatCurrency(totalExpenses)}</p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-600">Faturamento Total</h3>
      <p class="text-2xl font-bold text-yellow-500">${formatCurrency(totalRevenue)}</p>
    </div>
  `;

  // Atualizar listas de receitas e despesas
  const dailyRevenueList = document.getElementById('dailyRevenueList');
  if (dailyRevenueList) {
    const dailyRevenues = revenues
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(revenue => `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span class="text-sm text-gray-600">${formatDate(revenue.date)}</span>
            ${revenue.description ? `<p class="text-sm text-gray-500">${revenue.description}</p>` : ''}
          </div>
          <span class="font-medium text-green-600">+${formatCurrency(revenue.amount)}</span>
        </div>
      `).join('');
    
    dailyRevenueList.innerHTML = dailyRevenues || '<p class="text-gray-500 text-center">Nenhum faturamento registrado</p>';
  }

  const expensesList = document.getElementById('expensesList');
  if (expensesList) {
    const expensesHtml = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(expense => `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span class="text-sm text-gray-600">${formatDate(expense.date)}</span>
            <p class="text-sm text-gray-500">${expense.description}</p>
          </div>
          <span class="font-medium text-red-600">-${formatCurrency(expense.amount)}</span>
        </div>
      `).join('');
    
    expensesList.innerHTML = expensesHtml || '<p class="text-gray-500 text-center">Nenhuma despesa registrada</p>';
  }

  createMonthlyChart(month, year);
}

function setupDashboardEvents() {
  // Eventos de filtro
  const monthFilter = document.getElementById('monthFilter');
  const yearFilter = document.getElementById('yearFilter');

  if (monthFilter && yearFilter) {
    const handleFilterChange = () => {
      const month = parseInt(monthFilter.value);
      const year = parseInt(yearFilter.value);
      updateDashboardData(month, year);
    };

    monthFilter.addEventListener('change', handleFilterChange);
    yearFilter.addEventListener('change', handleFilterChange);
  }

  // Evento de registro de faturamento
  const revenueForm = document.getElementById('addRevenueForm');
  if (revenueForm) {
    revenueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(revenueForm);
      const revenueData = {
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
      };
      
      addRevenue(revenueData);
      document.getElementById('addRevenueModal').classList.add('hidden');
      const month = parseInt(monthFilter.value);
      const year = parseInt(yearFilter.value);
      updateDashboardData(month, year);
    });
  }

  // Evento de registro de faturamento diário
  const dailyRevenueForm = document.getElementById('addDailyRevenueForm');
  if (dailyRevenueForm) {
    dailyRevenueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(dailyRevenueForm);
      const revenueData = {
        description: 'Faturamento diário',
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
      };
      
      addRevenue(revenueData);
      document.getElementById('addDailyRevenueModal').classList.add('hidden');
      const month = parseInt(monthFilter.value);
      const year = parseInt(yearFilter.value);
      updateDashboardData(month, year);
    });
  }

  // Evento de toggle de cards
  const toggleAllCardsButton = document.querySelector('.toggle-all-cards-btn');
  if (toggleAllCardsButton) {
    toggleAllCardsButton.addEventListener('click', () => {
      const annualCardsContainer = document.querySelector('.annual-summary-cards');
      const monthlyCardsContainer = document.querySelector('.summary-cards');
      
      // Verificar se já está minimizado
      const isMinimized = annualCardsContainer.classList.contains('cards-minimized');
      
      // Alternar classes de minimização
      annualCardsContainer.classList.toggle('cards-minimized', !isMinimized);
      monthlyCardsContainer.classList.toggle('cards-minimized', !isMinimized);
      
      // Atualizar ícone do botão
      toggleAllCardsButton.innerHTML = isMinimized 
        ? `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        `
        : `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        `;
    });
  }
}

function createToggleButton(container) {
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = `
    <div class="relative flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </div>
  `;
  toggleButton.className = 'absolute top-2 left-2 toggle-cards-btn';
  
  toggleButton.addEventListener('click', () => {
    container.classList.toggle('cards-minimized');
    
    // Trocar ícone do botão
    const isMinimized = container.classList.contains('cards-minimized');
    toggleButton.innerHTML = isMinimized 
      ? `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      `
      : `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      `;
  });

  return toggleButton;
}

function renderPendingInstallments(pendingInstallments) {
  const pendingInstallmentsContainer = document.querySelector('.ml-4.w-full');
  
  if (!pendingInstallmentsContainer) return;

  // Adicionar scroll se houver mais de 3 linhas
  if (pendingInstallments.length > 2) {
    pendingInstallmentsContainer.classList.add('max-h-64', 'overflow-y-auto', 'custom-scrollbar');
  } else {
    pendingInstallmentsContainer.classList.remove('max-h-64', 'overflow-y-auto', 'custom-scrollbar');
  }

  // Adicionar estilo de scrollbar personalizado
  if (!document.getElementById('custom-scrollbar-style')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-scrollbar-style';
    styleElement.innerHTML = `
      .custom-scrollbar {
        max-height: 16rem;
        overflow-y: auto;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(styleElement);
  }
}