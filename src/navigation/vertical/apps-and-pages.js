// src/navigation/vertical/apps-and-pages.js (modificado)
import authService from '@/services/auth';

// Verifica se o usuário atual é administrador
const isAdmin = () => {
  try {
    return authService.isAdmin();
  } catch (error) {
    return false;
  }
};

export default [
  { heading: 'Home' },
  {
    title: 'Calendário',
    icon: { icon: 'ri-calendar-line' },
    to: 'apps-calendar',
  },
 
  // Seção de administração (visível apenas para admins)
  ...(isAdmin() ? [
    { heading: 'Administração' },
    {
      title: 'Usuários',
      icon: { icon: 'ri-user-settings-line' },
      to: 'admin-users',
    }
  ] : []),
  
  // Seção de usuário
  {
    title: 'Perfil',
    icon: { icon: 'ri-user-line' },
    children: [
      { title: 'Visualizar', to: { name: 'apps-user-view-id', params: { id: 21 } } },
      { title: 'Lista', to: 'apps-user-list' },
    ],
  },

  // Seção de autenticação
  {
    title: 'Autenticação',
    icon: { icon: 'ri-shield-keyhole-line' },
    children: [
      {
        title: 'Login',
        children: [
          { title: 'Login v1', to: 'pages-authentication-login-v1', target: '_blank' },
          { title: 'Login v2', to: 'pages-authentication-login-v2', target: '_blank' },
        ],
      },
      {
        title: 'Cadastro',
        children: [
          { title: 'Cadastro v1', to: 'pages-authentication-register-v1', target: '_blank' },
          { title: 'Cadastro v2', to: 'pages-authentication-register-v2', target: '_blank' },
          { title: 'Cadastro Multi-Etapas', to: 'pages-authentication-register-multi-steps', target: '_blank' },
        ],
      },
      {
        title: 'Verificar Email',
        children: [
          { title: 'Verificar Email v1', to: 'pages-authentication-verify-email-v1', target: '_blank' },
          { title: 'Verificar Email v2', to: 'pages-authentication-verify-email-v2', target: '_blank' },
        ],
      },
      {
        title: 'Esqueci a Senha',
        children: [
          { title: 'Esqueci a Senha v1', to: 'pages-authentication-forgot-password-v1', target: '_blank' },
          { title: 'Esqueci a Senha v2', to: 'pages-authentication-forgot-password-v2', target: '_blank' },
        ],
      },
      {
        title: 'Redefinir Senha',
        children: [
          { title: 'Redefinir Senha v1', to: 'pages-authentication-reset-password-v1', target: '_blank' },
          { title: 'Redefinir Senha v2', to: 'pages-authentication-reset-password-v2', target: '_blank' },
        ],
      },
    ],
  },
]
