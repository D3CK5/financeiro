const STORAGE_KEY = 'expenses';
const TIMEZONE = 'America/Sao_Paulo';

function toLocalISOString(date, timeZone) {
  const localDate = new Date(date);
  // Adiciona 1 dia para compensar o problema de subtração
  localDate.setDate(localDate.getDate() + 1);
  return localDate.toISOString();
}

export function getExpenses() {
  const expenses = localStorage.getItem(STORAGE_KEY);
  return expenses ? JSON.parse(expenses) : [];
}

export function addExpense(expense) {
  const expenses = getExpenses();
  const newExpense = {
    ...expense,
    date: toLocalISOString(expense.date, TIMEZONE),
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  return newExpense;
}

export function deleteExpense(id) {
  console.log('Deletando despesa com ID:', id);
  const expenses = getExpenses();
  console.log('Despesas antes da deleção:', expenses);
  const filteredExpenses = expenses.filter((expense) => expense.id !== id);
  console.log('Despesas após a deleção:', filteredExpenses);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExpenses));
}

export function getMonthlyExpenses(month, year) {
  const expenses = getExpenses();
  return expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}
