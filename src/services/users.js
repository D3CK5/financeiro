const STORAGE_KEY = 'users';

export function getUsers() {
  const users = localStorage.getItem(STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

export function addUser(userData, clientId) {
  const users = getUsers();
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    clientId,
    role: 'client',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return newUser;
}

export function getUserByClientId(clientId) {
  const users = getUsers();
  return users.find(user => user.clientId === clientId);
}