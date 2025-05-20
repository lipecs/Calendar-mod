// src/plugins/1.router/guards.js (simplificado)
export const setupGuards = router => {
  router.beforeEach(to => {
    try {
      // Verificar se é uma rota pública
      if (to.meta.public || to.meta.unauthenticatedOnly) {
        return;
      }

      // Verificar se o usuário está autenticado
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return { name: 'login' };
      }

      // Continuar para a rota solicitada
      return;
    } catch (error) {
      console.error('Erro no guard de rota:', error);
      return { name: 'login' };
    }
  });
};
