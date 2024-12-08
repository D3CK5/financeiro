export function createLayout(content) {
  return `
    <div class="flex">
      <!-- Menu Lateral -->
      <div class="w-48 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-10 overflow-y-auto">
        <nav class="p-4">
          <ul class="space-y-2">
            <li>
              <a href="/" data-link class="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 p-2 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/expenses" data-link class="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 p-2 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>
                </svg>
                <span>Lançamentos</span>
              </a>
            </li>
            <li>
              <a href="/clients" data-link class="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 p-2 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>Clientes</span>
              </a>
            </li>
            <li>
              <a href="/contracts" data-link class="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 p-2 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Contratos</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Conteúdo Principal -->
      <main class="ml-16 w-full min-h-screen p-4">
        ${content}
      </main>
    </div>
  `;
}
