<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import { Portuguese } from "flatpickr/dist/l10n/pt.js"
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { useCalendarStore } from './useCalendarStore'

// 👉 store
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  event: {
    type: null,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'addEvent',
  'updateEvent',
  'removeEvent',
])

const store = useCalendarStore()
const refForm = ref()

// 👉 Event
const event = ref(JSON.parse(JSON.stringify(props.event)))

const resetEvent = () => {
  event.value = JSON.parse(JSON.stringify(props.event))
  nextTick(() => {
    refForm.value?.resetValidation()
  })
}

watch(() => props.isDrawerOpen, resetEvent)

watch(() => event.value.extendedProps?.status, (newStatus) => {
  if (newStatus === 'Done' || newStatus === 'Finalizado') {
    // Apenas atualiza o evento, não remove mais
    event.value.extendedProps.calendar = event.value.extendedProps.calendar || 'Meeting'
    emit('updateEvent', event.value)
  }

  if (newStatus === 'Urgent' || newStatus === 'Urgente') {
    event.value.extendedProps.calendar = event.value.extendedProps.calendar || 'Meeting'
    emit('updateEvent', event.value)
  }
})

const removeEvent = () => {
  emit('removeEvent', String(event.value.id))

  // Close drawer
  emit('update:isDrawerOpen', false)
}

const handleSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {

      // If id exist on id => Update event
      if ('id' in event.value)
        emit('updateEvent', event.value)

      // Else => add new event
      else
        emit('addEvent', event.value)

      // Close drawer
      emit('update:isDrawerOpen', false)
    }
  })
}

const guestsOptions = [
  {
    avatar: avatar1,
    name: 'Jane Foster',
  },
  {
    avatar: avatar3,
    name: 'Donna Frank',
  },
  {
    avatar: avatar5,
    name: 'Gabrielle Robertson',
  },
  {
    avatar: avatar7,
    name: 'Lori Spears',
  },
  {
    avatar: avatar6,
    name: 'Sandy Vega',
  },
  {
    avatar: avatar2,
    name: 'Cheryl May',
  },
]

// 👉 Form
const onCancel = () => {

  // Close drawer
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    resetEvent()
    refForm.value?.resetValidation()
  })
}

const startDateTimePickerConfig = computed(() => {
  const config = {
    enableTime: !event.value.allDay,
    dateFormat: `Y-m-d${event.value.allDay ? '' : ' H:i'}`,
    locale: Portuguese, // Adiciona a localização portuguesa
  }

  if (event.value.end)
    config.maxDate = event.value.end

  return config
})

// Nas configurações do seu DateTimePicker
const endDateTimePickerConfig = computed(() => {
  const config = {
    enableTime: !event.value.allDay,
    dateFormat: `Y-m-d${event.value.allDay ? '' : ' H:i'}`,
    locale: Portuguese, // Adicione esta linha

  }

  if (event.value.start)
    config.minDate = event.value.start

  return config
})

const dialogModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

// Status options com tradução
const statusOptions = computed(() => [
  { value: 'In Progress', title: 'Em andamento' },
  { value: 'Urgent', title: 'Urgente' },
  { value: 'Done', title: 'Finalizado' }
])

</script>

<template>
  <VNavigationDrawer temporary location="end" :model-value="props.isDrawerOpen" width="420" class="scrollable-content"
    @update:model-value="dialogModelValueUpdate">
    <!-- 👉 Header -->
    <AppDrawerHeaderSection :title="event.id ? $t('Update Event') : $t('Add Event')"
      @cancel="$emit('update:isDrawerOpen', false)">
      <template #beforeClose>
        <IconBtn v-show="event.id" @click="removeEvent">
          <VIcon size="18" icon="ri-delete-bin-7-line" />
        </IconBtn>
      </template>
    </AppDrawerHeaderSection>

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm ref="refForm" @submit.prevent="handleSubmit">
            <VRow>
              <!-- 👉 Title -->
              <VCol cols="12">
                <VTextField v-model="event.title" :label="$t('Title')" :placeholder="$t('Meeting with Jane')"
                  :rules="[requiredValidator]" />
              </VCol>

              <!-- 👉 Calendar -->
              <VCol cols="12">
                <VSelect v-model="event.extendedProps.calendar" :label="$t('Label')"
                  :placeholder="$t('Select Event Label')" :rules="[requiredValidator]" :items="store.availableCalendars"
                  :item-title="item => item.label" :item-value="item => item.label">
                  <template #selection="{ item }">
                    <div v-show="event.extendedProps.calendar" class="align-center d-flex">
                      <VIcon size="8" icon="ri-circle-fill" :color="item.raw.color" class="me-2" />
                      <span>{{ $t(item.raw.label) }}</span>
                    </div>
                  </template>

                  <template #item="{ item, props: itemProps }">
                    <VListItem v-bind="itemProps">
                      <template #prepend>
                        <VIcon size="8" icon="ri-circle-fill" :color="item.raw.color" />
                      </template>
                      <VListItemTitle>{{ $t(item.raw.label) }}</VListItemTitle>
                    </VListItem>
                  </template>
                </VSelect>
              </VCol>

              <!-- 👉 Start date -->
              <VCol cols="12">
                <AppDateTimePicker :key="JSON.stringify(startDateTimePickerConfig)" v-model="event.start"
                  :label="$t('Start date')" :placeholder="$t('Select Date')" :rules="[requiredValidator]"
                  :config="startDateTimePickerConfig" />
              </VCol>

              <!-- 👉 End date -->
              <VCol cols="12">
                <AppDateTimePicker :key="JSON.stringify(endDateTimePickerConfig)" v-model="event.end"
                  :label="$t('End date')" :placeholder="$t('Select End Date')" :rules="[requiredValidator]"
                  :config="endDateTimePickerConfig" />
              </VCol>

              <!-- 👉 All day -->
              <VCol cols="12">
                <VSwitch v-model="event.allDay" :label="$t('All day')" />
              </VCol>

              <!-- 👉 Event URL -->
              <VCol cols="12">
                <VTextField v-model="event.url" :label="$t('Event URL')" :placeholder="$t('https://event.com/meeting')"
                  :rules="[urlValidator]" type="url" />
              </VCol>

              <!-- 👉 Guests -->
              <VCol cols="12">
                <VSelect v-model="event.extendedProps.guests" :label="$t('Guests')" :placeholder="$t('Select guests')"
                  :items="guestsOptions" :item-title="item => item.name" :item-value="item => item.name" chips multiple
                  eager />
              </VCol>

              <!-- 👉 Location -->
              <VCol cols="12">
                <VTextField v-model="event.extendedProps.location" :label="$t('Location')"
                  :placeholder="$t('Meeting room')" />
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12">
                <VTextarea
                  v-model="event.description"
                  :label="$t('Description')"
                  rows="3"
                  :placeholder="$t('Add a description for the event')"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <VSelect
                  v-model="event.extendedProps.status"
                  :label="$t('Status')"
                  :placeholder="$t('Select status')"
                  :items="statusOptions"
                  :item-title="'title'"
                  :item-value="'value'"
                />
              </VCol>

              <!-- 👉 Form buttons -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3">
                  {{ $t('Submit') }}
                </VBtn>
                <VBtn variant="outlined" color="secondary" @click="onCancel">
                  {{ $t('Cancel') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>