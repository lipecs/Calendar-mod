// src/pages/admin/users.vue
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth';
import UserManagement from '@/views/apps/user/admin/UserManagement.vue';

definePage({
  meta: {
    pageTitle: 'Gerenciamento de Usuários',
    breadcrumb: [
      {
        title: 'Home',
        to: '/'
      },
      {
        title: 'Admin',
        to: '/admin'
      },
      {
        title: 'Usuários',
        active: true
      }
    ],
    adminRequired: true // Requer permissão de administrador
  }
});

const router = useRouter();
const isLoading = ref(true);

// Verificar se o usuário está autenticado e é admin
onMounted(async () => {
  isLoading.value = true;
  
  if (!authService.isAuthenticated()) {
    router.push('/login');
    return;
  }
  
  // Verificar se o usuário é admin
  if (!authService.isAdmin()) {
    // Redirecionar para acesso negado
    router.push('/not-authorized');
    return;
  }
  
  isLoading.value = false;
});
</script>

<template>
  <VContainer fluid>
    <VRow v-if="isLoading">
      <VCol cols="12" class="d-flex justify-center align-center" style="height: 400px;">
        <VProgressCircular indeterminate size="64" />
      </VCol>
    </VRow>
    
    <template v-else>
      <VRow>
        <VCol cols="12">
          <h2 class="text-h2 mb-6">{{ $t('Gerenciamento de Usuários') }}</h2>
          <p class="text-body-1 mb-4">
            {{ $t('Gerencie os usuários do sistema, atribuindo funções e permissões adequadas.') }}
          </p>
        </VCol>
      </VRow>
      
      <VRow>
        <VCol cols="12">
          <UserManagement />
        </VCol>
      </VRow>
    </template>
  </VContainer>
</template>
