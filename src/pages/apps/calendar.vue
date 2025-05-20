// src/pages/apps/calendar.vue (simplificado para resolver o problema)
<script setup>
import { ref, onMounted, watch } from 'vue';
import authService from '@/services/auth';
import { useRouter } from 'vue-router';
import CalendarEventHandler from '@/views/apps/calendar/CalendarEventHandler.vue';
import { blankEvent, useCalendar } from '@/views/apps/calendar/useCalendar';
import { useCalendarStore } from '@/views/apps/calendar/useCalendarStore';
import axios from 'axios';

// Hooks
const router = useRouter();
const store = useCalendarStore();
const event = ref(JSON.parse(JSON.stringify(blankEvent)));
const isEventHandlerSidebarActive = ref(false);
const isLeftSidebarOpen = ref(false);

// Carregar eventos do backend
const loadEvents = async () => {
  try {
    // Verificar autenticação
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Carregar eventos do backend
    const response = await axios.get('http://localhost:8080/api/events');
    
    // Atualizar eventos no store
    store.events = response.data;
    
    // Recarregar calendário
    if (refCalendar.value) {
      refCalendar.value.getApi().refetchEvents();
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
};

// Configurar calendário
const {
  refCalendar,
  calendarOptions,
  addEvent,
  updateEvent,
  removeEvent,
  jumpToDate,
} = useCalendar(event, isEventHandlerSidebarActive, isLeftSidebarOpen);

// Carregar dados ao montar o componente
onMounted(() => {
  loadEvents();
});

// Helper para verificar todos os calendários
const checkAll = ref(false);
watch(checkAll, val => {
  store.selectedCalendars = val ? store.availableCalendars.map(i => i.label) : [];
});
</script>

<template>
  <VCard>
    <VCardTitle>Calendário</VCardTitle>
    <VCardText>
      <FullCalendar ref="refCalendar" :options="calendarOptions" />
    </VCardText>
  </VCard>

  <CalendarEventHandler
    v-model:isDrawerOpen="isEventHandlerSidebarActive"
    :event="event"
    @add-event="addEvent"
    @update-event="updateEvent"
    @remove-event="removeEvent"
  />
</template>
