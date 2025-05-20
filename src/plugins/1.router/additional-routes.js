// src/plugins/1.router/additional-routes.js (modificado)
const emailRouteComponent = () => import('@/pages/apps/email/index.vue');

// 👉 Redirects
export const redirects = [
  // ℹ️ Redirecionamos para páginas diferentes com base na função.
  // NOTA: A função é apenas para fins de UI. O ACL é baseado em capacidades.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // Usando o serviço de autenticação diretamente não funciona aqui, precisamos usar o cookie
      const userData = useCookie('userData');
      const userRole = userData.value?.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user';
      
      if (userRole === 'admin')
        return { name: 'apps-calendar' };
      
      return { name: 'apps-calendar' };
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
];

export const routes = [
  // Rota de e-mail (filter)
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  // Rota de e-mail (label)
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },
  
  // Rota de gerenciamento de usuários (apenas para admin)
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/pages/admin/users.vue'),
    meta: {
      adminRequired: true, // Requer permissão de administrador
      action: 'manage',
      subject: 'users',
      pageTitle: 'Gerenciamento de Usuários',
    },
  },
  
  // Página de acesso negado
  {
    path: '/not-authorized',
    name: 'not-authorized',
    component: () => import('@/pages/not-authorized.vue'),
    meta: {
      layout: 'blank',
      public: true,
      pageTitle: 'Acesso Negado',
    },
  },
  
  // Rotas logísticas (exemplo)
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
];
