// src/navigation/vertical/apps-and-pages.js
export default [
  { heading: 'Home' },
  {
    title: 'Calendário',
    icon: { icon: 'ri-calendar-line' },
    to: 'apps-calendar',
  },
 
  // Removendo a verificação dinâmica de admin no menu para evitar problemas de ciclo
  // Em vez disso, mostraremos esse menu para todos e a permissão será verificada pelo guard de rota
  { heading: 'Administração' },
  {
    title: 'Usuários',
    icon: { icon: 'ri-user-settings-line' },
    to: 'admin-users',
  },
  
  // Seção de usuário
  {
    title: 'Perfil',
    icon: { icon: 'ri-user-line' },
    children: [
      { title: 'Visualizar', to: { name: 'apps-user-view-id', params: { id: 21 } } },
      { title: 'Lista', to: 'apps-user-list' },
    ],
  }
]
