// src/plugins/casl/index.js
import { abilitiesPlugin } from '@casl/vue';
import { ability, updateAbility } from './ability';

export default function (app) {
  // Atualiza a habilidade para garantir que esteja usando as regras mais recentes
  updateAbility();
  
  // Registra o plugin de habilidades
  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  });
}
