<!-- src/pages/apps/calendar.vue (modificado) -->
<script setup>
import authService from '@/services/auth';
import eventService from '@/services/event';
import CalendarEventHandler from '@/views/apps/calendar/CalendarEventHandler.vue';
import {
  blankEvent,
  useCalendar,
} from '@/views/apps/calendar/useCalendar';
import { useCalendarStore } from '@/views/apps/calendar/useCalendarStore';
import FullCalendar from '@fullcalendar/vue3';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Hooks
const router = useRouter();

// Verifica se o usuário está autenticado
if (!authService.isAuthenticated()) {
  router.push('/login');
}

// Store e estado
const store = useCalendarStore();
const event = ref(structuredClone(blankEvent));
const isEventHandlerSidebarActive = ref(false);
const isLoading = ref(false);
const alert = ref({
  show: false,
  type: 'success',
  message: ''
});

// Dados do usuário atual
const currentUser = computed(() => authService.getCurrentUser());
const isAdmin = computed(() => authService.isAdmin());

// Observar mudanças no drawer de eventos
watch(isEventHandlerSidebarActive, val => {
  if (!val) event.value = structuredClone(blankEvent);
});

const { isLeftSidebarOpen } = useResponsiveLeftSidebar();
const {
  refCalendar,
  calendarOptions,
  addEvent: addCalendarEvent,
  updateEvent: updateCalendarEvent,
  removeEvent: removeCalendarEvent,
  jumpToDate,
} = useCalendar(event, isEventHandlerSidebarActive, isLeftSidebarOpen);

// Configurações adicionais do calendário
calendarOptions.value = {
  ...calendarOptions.value,
  timeZone: 'America/Sao_Paulo',
};

// Sincronizar com o backend
const addEvent = async (eventData) => {
  try {
    isLoading.value = true;

    // Garante que o evento está associado ao usuário atual
    if (!eventData.userId && currentUser.value) {
      eventData.userId = currentUser.value.id;
    }

    // Salva no backend
    const savedEvent = await eventService.createEvent(eventData);

    // Adiciona ao calendário local
    addCalendarEvent(savedEvent);

    showAlert('success', 'Evento criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    showAlert('error', 'Erro ao criar evento: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

const updateEvent = async (eventData) => {
  try {
    isLoading.value = true;

    // Atualiza no backend
    const updatedEvent = await eventService.updateEvent(eventData.id, eventData);

    // Atualiza no calendário local
    updateCalendarEvent(updatedEvent);

    showAlert('success', 'Evento atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    showAlert('error', 'Erro ao atualizar evento: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

const removeEvent = async (eventId) => {
  try {
    isLoading.value = true;

    // Remove do backend
    await eventService.deleteEvent(eventId);

    // Remove do calendário local
    removeCalendarEvent(eventId);

    showAlert('success', 'Evento removido com sucesso!');
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    showAlert('error', 'Erro ao remover evento: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

// Verificar todos os calendários
const checkAll = computed({
  get: () => store.selectedCalendars.length === store.availableCalendars.length,
  set: val => {
    store.selectedCalendars = val ? store.availableCalendars.map(i => i.label) : [];
  }
});

// Criação de filtro/calendário
const newFilterName = ref('');
const newFilterColor = ref('#1976D2');
const isCreatingFilter = ref(false);

function createNewFilter() {
  const name = newFilterName.value.trim();
  if (!name) return;

  const exists = store.availableCalendars.some(c => c.label.toLowerCase() === name.toLowerCase());

  if (!exists) {
    store.availableCalendars.push({ label: name, color: newFilterColor.value });
    store.selectedCalendars.push(name);
  }

  newFilterName.value = '';
  newFilterColor.value = '#1976D2';
  isCreatingFilter.value = false;
}

// Edição de filtro
const editedFilter = ref({ label: '', color: '', originalLabel: '' });
const isEditingFilter = ref(false);

function startEditFilter(calendar) {
  editedFilter.value = {
    label: calendar.label,
    color: calendar.color,
    originalLabel: calendar.label,
  };
  isEditingFilter.value = true;
}

function cancelEditFilter() {
  editedFilter.value = { label: '', color: '', originalLabel: '' };
  isEditingFilter.value = false;
}

function saveEditedFilter() {
  const idx = store.availableCalendars.findIndex(c => c.label === editedFilter.value.originalLabel);
  if (idx !== -1) {
    store.availableCalendars[idx] = {
      label: editedFilter.value.label,
      color: editedFilter.value.color,
    };
    store.selectedCalendars = store.selectedCalendars.map(l =>
      l === editedFilter.value.originalLabel ? editedFilter.value.label : l
    );
  }
  cancelEditFilter();
}

function removeCalendarFilter(label) {
  const idx = store.availableCalendars.findIndex(c => c.label === label);
  if (idx !== -1) {
    store.availableCalendars.splice(idx, 1);
    store.selectedCalendars = store.selectedCalendars.filter(l => l !== label);
  }
}

// Mostrar alerta
const showAlert = (type, message) => {
  alert.value = {
    show: true,
    type,
    message
  };

  // Auto-esconder alerta após 5 segundos
  setTimeout(() => {
    alert.value.show = false;
  }, 5000);
};

// Carregar eventos do backend ao iniciar
const loadEventsFromBackend = async () => {
  try {
    isLoading.value = true;
    const selectedCalendarsString = store.selectedCalendars.join(',');
    const events = await eventService.getEvents(selectedCalendarsString);

    // Atualizar eventos no store
    store.events = events;

    // Recarregar o calendário
    if (refCalendar.value) {
      refCalendar.value.getApi().refetchEvents();
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    showAlert('error', 'Erro ao carregar eventos: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

// Observar mudanças nos calendários selecionados
watch(() => store.selectedCalendars, async () => {
  await loadEventsFromBackend();
}, { deep: true });

// Carregar eventos ao montar o componente
onMounted(async () => {
  await loadEventsFromBackend();
});

const calendarApi = ref(null);
</script>

<template>
  <div>
    <VCard>
      <!-- Alerta de mensagem -->
      <VAlert v-if="alert.show" :type="alert.type" closable class="mx-4 mt-4" @click:close="alert.show = false">
        {{ alert.message }}
      </VAlert>

      <VLayout style="z-index: 0;">
        <VNavigationDrawer v-model="isLeftSidebarOpen" width="292" absolute touchless location="start"
          class="calendar-add-event-drawer" :temporary="$vuetify.display.mdAndDown">
          <div class="pa-5">
            <VBtn block prepend-icon="ri-add-line" @click="isEventHandlerSidebarActive = true">
              {{ $t('Adicionar evento') }}
            </VBtn>
          </div>

          <VDivider />

          <div class="d-flex align-center justify-center pa-2">
            <AppDateTimePicker v-model="calendarApi" :config="{ inline: true }" class="calendar-date-picker"
              @update:model-value="jumpToDate($event)" />
          </div>

          <VDivider />

          <div class="pa-5">
            <h5 class="text-h5 mb-4">{{ $t('Filtros de Evento') }}</h5>
            <VCheckbox v-model="checkAll" :label="$t('Ver todos')" />

            <div v-for="calendar in store.availableCalendars" :key="calendar.label" class="mb-2">
              <div class="d-flex align-center justify-space-between">
                <VCheckbox v-model="store.selectedCalendars" :value="calendar.label" :label="$t('' + calendar.label)"
                  :color="calendar.color" />
                <div class="d-flex">
                  <VBtn icon size="x-small" @click="startEditFilter(calendar)">
                    <VIcon icon="ri-edit-line" />
                  </VBtn>
                  <VBtn icon size="x-small" @click="removeCalendarFilter(calendar.label)">
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </div>
              </div>
            </div>

            <VBtn class="mt-4" prepend-icon="ri-add-circle-line" variant="outlined" color="primary"
              @click="isCreatingFilter = true">
              {{ $t('Criar novo filtro') }}
            </VBtn>
          </div>
        </VNavigationDrawer>

        <VMain>
          <VCard flat>
            <FullCalendar ref="refCalendar" :options="calendarOptions" />
          </VCard>
        </VMain>
      </VLayout>
    </VCard>

    <CalendarEventHandler v-model:isDrawerOpen="isEventHandlerSidebarActive" :event="event" @add-event="addEvent"
      @update-event="updateEvent" @remove-event="removeEvent" />

    <!-- Dialog para criar novo filtro -->
    <VDialog v-model="isCreatingFilter" persistent max-width="400">
      <VCard>
        <VCardTitle>{{ $t('Novo Filtro de Evento') }}</VCardTitle>
        <VCardText>
          <VTextField v-model="newFilterName" :label="$t('Nome do Filtro')" autofocus />
          <VColorPicker v-model="newFilterColor" hide-inputs show-swatches flat class="mt-4"
            swatches-max-height="120" />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn text @click="isCreatingFilter = false">
            {{ $t('Cancelar') }}
          </VBtn>
          <VBtn color="primary" @click="createNewFilter">
            {{ $t('Adicionar') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog para editar filtro -->
    <VDialog v-model="isEditingFilter" persistent max-width="400">
      <VCard>
        <VCardTitle>{{ $t('Editar Filtro de Evento') }}</VCardTitle>
        <VCardText>
          <VTextField v-model="editedFilter.label" :label="$t('Nome do Filtro')" autofocus />
          <VColorPicker v-model="editedFilter.color" hide-inputs show-swatches flat class="mt-4"
            swatches-max-height="120" />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn text @click="cancelEditFilter">
            {{ $t('Cancelar') }}
          </VBtn>
          <VBtn color="primary" @click="saveEditedFilter">
            {{ $t('Salvar') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

.calendars-checkbox .v-label {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  opacity: var(--v-high-emphasis-opacity);
}

.calendar-add-event-drawer {
  &.v-navigation-drawer:not(.v-navigation-drawer--temporary) {
    border-end-start-radius: 0.375rem;
    border-start-start-radius: 0.375rem;
  }
}

.calendar-date-picker {
  display: none;

  +.flatpickr-input+.flatpickr-calendar.inline {
    border: none;
    box-shadow: none;

    .flatpickr-months {
      border-block-end: none;
    }
  }

  &~.flatpickr-calendar .flatpickr-weekdays {
    margin-block: 0 4px;
  }
}
</style>

<style lang="scss" scoped>
.v-layout {
  overflow: visible !important;

  .v-card {
    overflow: visible;
  }
}

/* Estilo para eventos concluídos */
.event-completed {
  opacity: 0.6 !important;
  background-color: rgba(158, 158, 158, 0.6) !important;
  border-color: rgba(158, 158, 158, 0.6) !important;
  color: #000000 !important;
}

/* Estilo para eventos urgentes */
.event-urgent {
  background-color: #FF0000 !important;
  border-color: #FF0000 !important;
  color: #FFFFFF !important;
  font-weight: bold !important;
}

/* Assegurar que eventos concluídos tenham menor prioridade visual */
.fc-event.event-completed {
  z-index: 1 !important;
}

/* Assegurar que eventos urgentes tenham maior prioridade visual */
.fc-event.event-urgent {
  z-index: 3 !important;
}
</style>
