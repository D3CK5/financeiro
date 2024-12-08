import Chart from 'chart.js/auto';
import { getMonthlyRevenue } from '../services/revenue.js';
import { getMonthlyExpenses } from '../services/expenses.js';
import { formatCurrency } from '../utils/format.js';

export function createMonthlyChart(month, year) {
  const ctx = document.getElementById('monthlyRevenueChart');
  const revenues = getMonthlyRevenue(month, year);
  const expenses = getMonthlyExpenses(month, year);
  
  // Criar array com todos os dias do mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Inicializar arrays de dados com zeros
  const revenueData = new Array(daysInMonth).fill(0);
  const expensesData = new Array(daysInMonth).fill(0);

  // Preencher dados de receitas
  revenues.forEach(revenue => {
    const day = new Date(revenue.date).getDate() - 1;
    revenueData[day] += revenue.amount;
  });

  // Preencher dados de despesas
  expenses.forEach(expense => {
    const day = new Date(expense.date).getDate() - 1;
    expensesData[day] += expense.amount;
  });

  // Encontrar o valor máximo para calcular o padding
  const maxRevenue = Math.max(...revenueData);
  const maxExpenses = Math.max(...expensesData);
  const maxValue = Math.max(maxRevenue, maxExpenses);

  if (window.monthlyChart) {
    window.monthlyChart.destroy();
  }

  window.monthlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Faturamento',
          data: revenueData,
          borderColor: '#10b981', // Verde para receitas
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Despesas',
          data: expensesData,
          borderColor: '#ef4444', // Vermelho para despesas
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatCurrency(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: maxValue * 1.2, // Adiciona 20% de padding
          ticks: {
            callback: value => formatCurrency(value)
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
}