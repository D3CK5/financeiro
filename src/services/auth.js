export function setupAuth() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user') !== null;
  
  if (!isLoggedIn && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export function login(email, password) {
  // Implement login logic here
  localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
}

export function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}