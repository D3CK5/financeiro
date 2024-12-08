import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STORAGE_KEY = 'revenues';
const TIMEZONE = 'America/Sao_Paulo';

function toLocalISOString(date, timeZone) {
  const localDate = new Date(date);
  // Adiciona 1 dia para compensar o problema de subtração
  localDate.setDate(localDate.getDate() + 1);
  return localDate.toISOString();
}

export function getRevenues() {
  const revenues = localStorage.getItem(STORAGE_KEY);
  return revenues ? JSON.parse(revenues) : [];
}

export function addRevenue(revenue) {
  const revenues = getRevenues();
  const newRevenue = {
    ...revenue,
    date: toLocalISOString(revenue.date, TIMEZONE),
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  revenues.push(newRevenue);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(revenues));

  window.dispatchEvent(new CustomEvent('revenueUpdated'));

  return newRevenue;
}

export function deleteRevenue(id) {
  console.log('Deletando receita com ID:', id);
  const revenues = getRevenues();
  console.log('Receitas antes da deleção:', revenues);
  const filteredRevenues = revenues.filter((revenue) => revenue.id !== id);
  console.log('Receitas após a deleção:', filteredRevenues);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRevenues));
}

export function getMonthlyRevenue(month, year) {
  const revenues = getRevenues();
  return revenues.filter((revenue) => {
    const date = new Date(revenue.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

export function getRevenueStats(month, year) {
  const revenues = getMonthlyRevenue(month, year);
  const total = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const byDay = revenues.reduce((acc, revenue) => {
    const day = format(new Date(revenue.date), 'dd/MM', { locale: ptBR });
    acc[day] = (acc[day] || 0) + revenue.amount;
    return acc;
  }, {});

  return {
    total,
    byDay,
  };
}
