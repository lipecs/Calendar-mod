// src/plugins/1.router/guards.js (modificado)
import { canNavigate } from '@layouts/plugins/casl';
import authService from '@/services/auth';

export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    /*
     * Se for uma rota pública, continua a navegação. Esse tipo de página pode ser acessada por usuários logados e não logados.
     * Exemplos de rotas públicas: 404, manutenção, etc.
     */
    if (to.meta.public)
      return;

    /**
     * Verifica se o usuário está logado checando se existe token e dados do usuário no localStorage
     */
    const isLoggedIn = authService.isAuthenticated();

    /*
     * Se o usuário estiver logado e tentando acessar uma página de autenticação, redireciona para home
     * senão permite visitar a página
     */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/';
      else
        return undefined;
    }

    // Verifica se o usuário possui permissão para acessar a rota baseado nas regras CASL
    if (!canNavigate(to)) {
      return isLoggedIn
        ? { name: 'not-authorized' }
        : {
            name: 'login',
            query: {
              ...to.query,
              to: to.fullPath !== '/' ? to.path : undefined,
            },
          };
    }

    // Verificar se a rota requer permissão de administrador
    if (to.meta.adminRequired) {
      if (!authService.isAdmin()) {
        return { name: 'not-authorized' };
      }
    }

    // Se o usuário não estiver logado e a rota não for pública/unauthenticatedOnly
    if (!isLoggedIn) {
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      };
    }
  });
};
