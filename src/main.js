import './style.css';
import { setupRouter } from './router.js';
import { setupAuth } from './services/auth.js';
import { renderNavigation, setupMobileMenu } from './components/navigation.js';

function initApp() {
  setupAuth();
  
  // Render navigation
  const navElement = renderNavigation();
  document.querySelector('#app').insertAdjacentHTML('beforebegin', navElement);
  
  setupMobileMenu();
  setupRouter();
}

document.addEventListener('DOMContentLoaded', initApp);