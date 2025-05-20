// src/layouts/components/UserProfile.vue
<script setup>
import authService from '@/services/auth';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const { t } = useI18n();
const router = useRouter();
const ability = useAbility();

// Obter dados do usuário atual
const userData = computed(() => authService.getCurrentUser());
const isAdmin = computed(() => authService.isAdmin());

const logout = async () => {
  // Fazer logout
  authService.logout();

  // Limpar capacidades
  useCookie('userAbilityRules').value = null;
  ability.update([]);

  // Redirecionar para login
  await router.push('/login');
};

// 🔄 Computed para reatividade com mudança de idioma
const userProfileList = computed(() => [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-user-line',
    title: t('Perfil'), // ← Reativo
    to: {
      name: 'apps-user-view-id',
      params: { id: 21 },
    },
  },
  {
    type: 'navItem',
    icon: 'ri-settings-4-line',
    title: t('Configurações'), // ← Reativo
    to: {
      name: 'pages-account-settings-tab',
      params: { tab: 'account' },
    },
  },
  // Adiciona item de gerenciamento de usuários apenas para admins
  ...(isAdmin.value ? [
    {
      type: 'navItem',
      icon: 'ri-user-settings-line',
      title: t('Gerenciar Usuários'),
      to: {
        name: 'admin-users',
      },
    }
  ] : []),
  { type: 'divider' },
]);
</script>

<template>
  <VBadge v-if="userData" dot bordered location="bottom right" offset-x="3" offset-y="3" color="success">
    <VAvatar class="cursor-pointer" size="38" :color="!(userData && userData.avatar) ? 'primary' : undefined"
      :variant="!(userData && userData.avatar) ? 'tonal' : undefined">
      <VImg v-if="userData && userData.avatar" :src="userData.avatar" />
      <VIcon v-else icon="ri-user-line" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="15px">
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                  <VAvatar :color="!(userData && userData.avatar) ? 'primary' : undefined"
                    :variant="!(userData && userData.avatar) ? 'tonal' : undefined">
                    <VImg v-if="userData && userData.avatar" :src="userData.avatar" />
                    <VIcon v-else icon="ri-user-line" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <h6 class="text-h6 font-weight-medium">
              {{ userData.username || userData.email }}
            </h6>
            <VListItemSubtitle class="text-capitalize text-disabled">
              {{ userData.roles?.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuário' }}
            </VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template v-for="item in userProfileList" :key="item.title">
              <VListItem v-if="item.type === 'navItem'" :to="item.to">
                <template #prepend>
                  <VIcon :icon="item.icon" size="22" />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template v-if="item.badgeProps" #append>
                  <VBadge inline v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider v-else class="my-1" />
            </template>

            <VListItem>
              <VBtn block color="error" size="small" append-icon="ri-logout-box-r-line" @click="logout">
                {{ $t('Sair') }}
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
