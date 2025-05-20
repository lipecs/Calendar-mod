// src/plugins/casl/ability.js
import { createMongoAbility } from '@casl/ability';

// Use uma função para obter o serviço de autenticação para evitar ciclos de dependência
const getAuthService = () => {
  return import('@/services/auth').then(m => m.default);
};

// Inicializa as regras de habilidade com base no usuário
export const initializeAbility = async () => {
  try {
    const authService = await getAuthService();
    const userData = authService.getCurrentUser();
    
    // Se não houver dados do usuário, retornar habilidade vazia
    if (!userData) {
      return createMongoAbility([]);
    }
    
    // Se o usuário tiver regras de habilidade definidas
    if (userData.userAbilityRules) {
      return createMongoAbility(userData.userAbilityRules);
    }
    
    // Caso contrário, criar regras com base na função do usuário
    const isAdmin = userData.roles?.includes('ROLE_ADMIN');
    
    if (isAdmin) {
      // Admin pode gerenciar tudo
      return createMongoAbility([
        { action: 'manage', subject: 'all' }
      ]);
    } else {
      // Usuário comum pode ver e gerenciar apenas seu próprio calendário
      return createMongoAbility([
        { action: 'read', subject: 'Calendar' },
        { action: 'manage', subject: 'Calendar', conditions: { userId: userData.id } }
      ]);
    }
  } catch (error) {
    console.error('Erro ao inicializar habilidades:', error);
    return createMongoAbility([]);
  }
};

// Cria a habilidade inicial
export const ability = createMongoAbility([]);

// Atualiza a habilidade com base no usuário atual
export const updateAbility = async () => {
  try {
    const newAbility = await initializeAbility();
    
    // Limpa e adiciona as novas regras
    ability.update(newAbility.rules);
    
    return ability;
  } catch (error) {
    console.error('Erro ao atualizar habilidades:', error);
    return ability;
  }
};

// Exporta a habilidade
export default ability;
