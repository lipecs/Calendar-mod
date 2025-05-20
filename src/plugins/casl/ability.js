// src/plugins/casl/ability.js (modificado)
import authService from '@/services/auth';
import { createMongoAbility } from '@casl/ability';

// Inicializa as regras de habilidade com base no usuário
export const initializeAbility = () => {
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
};

// Cria a habilidade inicial
export const ability = initializeAbility();

// Atualiza a habilidade com base no usuário atual
export const updateAbility = () => {
  const newAbility = initializeAbility();
  
  // Limpa e adiciona as novas regras
  ability.update(newAbility.rules);
  
  return ability;
};

// Exporta a habilidade
export default ability;
