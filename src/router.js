import { renderDashboard } from './pages/dashboard.js';
import { renderClients } from './pages/clients.js';
import { renderContracts } from './pages/contracts.js';
import { renderExpenses } from './pages/expenses.js';

const routes = {
  '/': renderDashboard,
  '/clients': renderClients,
  '/contracts': renderContracts,
  '/expenses': renderExpenses,
};

export function setupRouter() {
  function handleRoute() {
    const path = window.location.pathname;
    console.log('Navigating to:', path);
    
    // Verificar se a rota existe, senão voltar para dashboard
    const renderer = routes[path] || routes['/'];
    
    // Limpar conteúdo anterior
    const appContainer = document.querySelector('#app');
    if (!appContainer) {
      console.error('Erro: Elemento #app não encontrado!');
      return;
    }
    appContainer.innerHTML = '';
    
    // Renderizar página
    try {
      renderer();
      console.log('Página renderizada com sucesso:', path);
    } catch (error) {
      console.error('Erro ao renderizar página:', path, error);
    }

    // Rolar para o topo da página
    window.scrollTo(0, 0);
  }

  // Adicionar suporte para navegação inicial e recarregamento de página
  window.addEventListener('popstate', handleRoute);
  
  // Capturar todos os cliques em links com data-link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href');
      console.log('Link clicked:', path);
      
      // Usar pushState para atualizar URL sem recarregar
      history.pushState(null, '', path);
      
      // Renderizar rota
      handleRoute();
    }
  });

  // Renderizar rota inicial ou atual
  handleRoute();
}