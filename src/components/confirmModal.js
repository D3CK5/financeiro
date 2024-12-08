export function createConfirmModal(options = {}) {
  console.log('Criando modal de confirmação', options);

  const {
    title = 'Tem certeza?',
    message = 'Deseja realmente realizar esta ação?',
    confirmText = 'Sim, tenho certeza',
    cancelText = 'Cancelar',
    onConfirm = () => {},
    onCancel = () => {}
  } = options;

  // Verificar se o modal já existe
  let existingModal = document.getElementById('globalConfirmModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div 
      id="globalConfirmModal" 
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div class="text-center">
          <svg 
            class="mx-auto mb-4 w-12 h-12 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500">${message}</h3>
          <div class="flex justify-center gap-4">
            <button 
              id="globalConfirmBtn" 
              class="btn btn-primary bg-red-600 hover:bg-red-700 text-white"
            >
              ${confirmText}
            </button>
            <button 
              id="globalCancelBtn" 
              class="btn btn-secondary"
            >
              ${cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inserir modal no body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('Modal inserido no body');

  const modal = document.getElementById('globalConfirmModal');
  const confirmBtn = document.getElementById('globalConfirmBtn');
  const cancelBtn = document.getElementById('globalCancelBtn');

  if (!modal || !confirmBtn || !cancelBtn) {
    console.error('Erro: Elementos do modal não encontrados', {
      modal: !!modal,
      confirmBtn: !!confirmBtn,
      cancelBtn: !!cancelBtn
    });
    return null;
  }

  function closeModal() {
    modal.remove();
  }

  confirmBtn.addEventListener('click', () => {
    console.log('Botão de confirmação clicado');
    onConfirm();
    closeModal();
  });

  cancelBtn.addEventListener('click', () => {
    console.log('Botão de cancelamento clicado');
    onCancel();
    closeModal();
  });

  return modal;
}

export function showConfirmModal(options) {
  console.log('showConfirmModal chamado', options);
  return createConfirmModal(options);
}
