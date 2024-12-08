import { getClients, addClient, deleteClient } from '../services/clients.js';
import { formatPhone } from '../utils/format.js';
import { createLayout } from '../components/layout.js';
import { showConfirmModal } from '../components/confirmModal.js';

export function renderClients() {
  const clients = getClients();
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Clientes</h1>
        <button 
          onclick="document.getElementById('addClientModal').classList.remove('hidden')"
          class="btn btn-primary"
        >
          Novo Cliente
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${clients.map(client => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">${client.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${client.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatPhone(client.phone)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${client.city}</td>
                <td class="px-6 py-4 whitespace-nowrap flex gap-3">
                  <button 
                    onclick="window.location.href='https://wa.me/${client.phone.replace(/\D/g, '')}'"
                    class="text-green-600 hover:text-green-900"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm.143 18.536c-1.475 0-2.643-.329-3.143-.789l-3.214 1.036.964-3.179c-.429-.571-.75-1.321-.75-2.214 0-2.357 2.5-4.286 5.571-4.286s5.571 1.929 5.571 4.286c0 2.357-2.5 4.286-5.571 4.286zm3.214-3.214l.929.929-1.286.357.357-1.286zm-4.928-2.857c-.286-.286-.429-.643-.429-1.071s.143-.786.429-1.071c.286-.286.643-.429 1.071-.429s.786.143 1.071.429l.929.929-2.143 2.143-.929-.929zm2.928-2.928c.286-.286.643-.429 1.071-.429s.786.143 1.071.429c.286.286.429.643.429 1.071s-.143.786-.429 1.071l-.929.929-2.143-2.143.929-.929z"/>
                    </svg>
                  </button>
                  <button 
                    onclick="window.deleteClient('${client.id}')"
                    class="text-red-600 hover:text-red-900"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Modal Adicionar Cliente -->
      <div id="addClientModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
          <h2 class="text-xl font-bold mb-4">Novo Cliente</h2>
          <form id="addClientForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nome</label>
                <input type="text" name="name" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Sobrenome</label>
                <input type="text" name="surname" required class="input" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Senha</label>
                <div class="relative">
                  <input type="password" name="password" required class="input" minlength="6" />
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path id="eyeOpenPath" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle id="eyeCircle" cx="12" cy="12" r="3" />
                      <path id="eyeClosedPath" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" style="display: none;" />
                      <line id="eyeSlashLine" x1="1" y1="1" x2="23" y2="23" style="display: none; stroke: currentColor;" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Telefone</label>
                <input type="tel" name="phone" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">CPF</label>
                <input type="text" name="cpf" required class="input" placeholder="000.000.000-00" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Cidade</label>
                <input type="text" name="city" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Estado</label>
                <select name="state" required class="input">
                  <option value="">Selecione o Estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-4">
              <button 
                type="button" 
                class="btn btn-secondary"
                onclick="document.getElementById('addClientModal').classList.add('hidden')"
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
  setupClientEvents();
}

function setupClientEvents() {
  const clientForm = document.getElementById('addClientForm');
  const phoneInput = document.querySelector('input[name="phone"]');
  const cpfInput = document.querySelector('input[name="cpf"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const eyeIcon = document.querySelector('span > svg');

  // Máscara para Telefone
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length <= 2) {
      // (XX)
      formattedValue = value.length > 0 ? `(${value}` : '';
      formattedValue += value.length === 2 ? ')' : '';
    } else if (value.length <= 6) {
      // (XX) XXXX
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}`;
    } else if (value.length <= 10) {
      // (XX) XXXX-XXXX
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6, 10)}`;
    } else {
      // (XX) X XXXX-XXXX
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    e.target.value = formattedValue;
  });

  // Máscara para CPF
  cpfInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length <= 3) {
      // XXX
      formattedValue = value;
    } else if (value.length <= 6) {
      // XXX.XXX
      formattedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}`;
    } else if (value.length <= 9) {
      // XXX.XXX.XXX
      formattedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}`;
    } else {
      // XXX.XXX.XXX-XX
      formattedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
    }

    e.target.value = formattedValue;
  });

  eyeIcon.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.querySelector('#eyeOpenPath').style.display = 'none';
      eyeIcon.querySelector('#eyeCircle').style.display = 'none';
      eyeIcon.querySelector('#eyeClosedPath').style.display = 'block';
      eyeIcon.querySelector('#eyeSlashLine').style.display = 'block';
    } else {
      passwordInput.type = 'password';
      eyeIcon.querySelector('#eyeOpenPath').style.display = 'block';
      eyeIcon.querySelector('#eyeCircle').style.display = 'block';
      eyeIcon.querySelector('#eyeClosedPath').style.display = 'none';
      eyeIcon.querySelector('#eyeSlashLine').style.display = 'none';
    }
  });

  if (clientForm) {
    clientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(clientForm);
      
      // Validar CPF
      const cpf = formData.get('cpf');
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (cleanCPF.length !== 11) {
        alert('CPF deve conter 11 dígitos.');
        return;
      }
      
      if (!validateCPF(cleanCPF)) {
        alert('CPF inválido. Por favor, verifique.');
        return;
      }

      const clientData = {
        name: formData.get('name'),
        surname: formData.get('surname'),
        email: formData.get('email'),
        password: formData.get('password'),
        cpf: formatCPF(cleanCPF),
        phone: formData.get('phone'),
        city: formData.get('city'),
        state: formData.get('state')
      };

      addClient(clientData);
      document.getElementById('addClientModal').classList.add('hidden');
      renderClients();
    });
  }

  // Função para validar CPF
  function validateCPF(cpf) {
    // Remover qualquer caractere não numérico
    cpf = cpf.replace(/\D/g, '');

    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Calcular dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  // Função para formatar CPF
  function formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

window.deleteClient = (id) => {
  showConfirmModal({
    title: 'Excluir Cliente',
    message: 'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
    confirmText: 'Sim, excluir',
    onConfirm: () => {
      deleteClient(id);
      renderClients();
    }
  });
};