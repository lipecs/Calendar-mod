import enLocale from '@fullcalendar/core/locales/en-gb'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCalendarStore } from '@/views/apps/calendar/useCalendarStore'
import { useConfigStore } from '@core/stores/config'

export const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  description: '',
  url: '',
  extendedProps: {
    calendar: undefined,
    guests: [],
    location: '',
    status: 'In Progress', // Valor padrão para status
  },
}

export const useCalendar = (event, isEventHandlerSidebarActive, isLeftSidebarOpen) => {
  const configStore = useConfigStore()
  const store = useCalendarStore()
  const refCalendar = ref()
  const calendarApi = ref(null)

  const { locale } = useI18n()

  const extractEventDataFromEventApi = eventApi => {
    const {
      id, title, start, end, url, description, allDay,
      extendedProps: { calendar, guests, location, status },
    } = eventApi

    return {
      id, title, start, end, url, description, allDay,
      extendedProps: { calendar, guests, location, status },
    }
  }

  const getColorValue = (colorName) => {
    const colorMap = {
      'error': '#F44336',
      'primary': '#1976D2',
      'warning': '#FF9800',
      'success': '#4CAF50',
      'info': '#2196F3',
    }

    if (colorName && colorName.startsWith('#')) {
      return colorName
    }

    return colorMap[colorName] || '#9E9E9E'
  }

  const applyEventColors = (events) => {
    return events.map(event => {
      let colorValue = '#9E9E9E' // Cor padrão
      
      // Verificar o status primeiro
      const status = event.extendedProps?.status
      if (status === 'Done' || status === 'Finalizado') {
        // Status finalizado - cinza transparente
        return {
          ...event,
          backgroundColor: 'rgba(158, 158, 158, 0.6)', // Cinza transparente
          borderColor: 'rgba(158, 158, 158, 0.6)',
          textColor: '#000000',
          classNames: ['event-completed']
        }
      } else if (status === 'Urgent' || status === 'Urgente') {
        // Status urgente - vermelho
        return {
          ...event,
          backgroundColor: '#FF0000', // Vermelho
          borderColor: '#FF0000',
          textColor: '#FFFFFF',
          classNames: ['event-urgent']
        }
      }
      
      // Se não foi definido pelo status, usar o calendar
      const calendarLabel = event.extendedProps?.calendar
      if (calendarLabel) {
        const calendarFilter = store.availableCalendars.find(c => c.label === calendarLabel)
        if (calendarFilter) {
          colorValue = getColorValue(calendarFilter.color)
        }
      }
      
      return {
        ...event,
        backgroundColor: colorValue,
        borderColor: colorValue,
        extendedProps: {
          ...event.extendedProps,
        },
      }
    })
  }

  const fetchEvents = (info, successCallback) => {
    if (!info) return
    store.fetchEvents()
      .then(r => {
        if (r?.message) {
          console.error('Erro ao buscar eventos:', r.message)
          successCallback([])
          return
        }

        const events = r.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }))

        const coloredEvents = applyEventColors(events)
        successCallback(coloredEvents)
      })
      .catch(e => {
        console.error('Erro ao buscar eventos', e)
        successCallback([])
      })
  }

  const updateEventInCalendar = (updatedEventData, propsToUpdate, extendedPropsToUpdate) => {
    const existingEvent = calendarApi.value?.getEventById(String(updatedEventData.id))
    if (!existingEvent) return

    propsToUpdate.forEach(prop => {
      existingEvent.setProp(prop, updatedEventData[prop])
    })

    existingEvent.setDates(updatedEventData.start, updatedEventData.end, {
      allDay: updatedEventData.allDay,
    })

    extendedPropsToUpdate.forEach(prop => {
      existingEvent.setExtendedProp(prop, updatedEventData.extendedProps[prop])
    })

    // Atualizar cor baseada no status
    const status = updatedEventData.extendedProps?.status
    if (status === 'Done' || status === 'Finalizado') {
      existingEvent.setProp('backgroundColor', 'rgba(158, 158, 158, 0.6)')
      existingEvent.setProp('borderColor', 'rgba(158, 158, 158, 0.6)')
      existingEvent.setProp('textColor', '#000000')
      existingEvent.setExtendedProp('classNames', ['event-completed'])
    } else if (status === 'Urgent' || status === 'Urgente') {
      existingEvent.setProp('backgroundColor', '#FF0000')
      existingEvent.setProp('borderColor', '#FF0000')
      existingEvent.setProp('textColor', '#FFFFFF')
      existingEvent.setExtendedProp('classNames', ['event-urgent'])
    } else {
      // Se não foi definido pelo status, usar o calendar
      const calendarLabel = updatedEventData.extendedProps?.calendar
      if (calendarLabel) {
        const calendarFilter = store.availableCalendars.find(c => c.label === calendarLabel)
        if (calendarFilter) {
          const colorValue = getColorValue(calendarFilter.color)
          existingEvent.setProp('backgroundColor', colorValue)
          existingEvent.setProp('borderColor', colorValue)
        }
      }
    }
  }

  const removeEventInCalendar = eventId => {
    const event = calendarApi.value?.getEventById(eventId)
    if (event) event.remove()
  }

  const refetchEvents = () => {
    calendarApi.value?.refetchEvents()
  }

  watch(() => [...store.selectedCalendars], refetchEvents, { deep: true })

  const addEvent = _event => {
    // Garantir que status tem um valor padrão
    if (!_event.extendedProps) {
      _event.extendedProps = {}
    }
    
    if (!_event.extendedProps.status) {
      _event.extendedProps.status = 'In Progress'
    }

    // Aplicar a cor baseada no status
    const status = _event.extendedProps.status
    if (status === 'Done' || status === 'Finalizado') {
      _event.backgroundColor = 'rgba(158, 158, 158, 0.6)'
      _event.borderColor = 'rgba(158, 158, 158, 0.6)'
      _event.textColor = '#000000'
    } else if (status === 'Urgent' || status === 'Urgente') {
      _event.backgroundColor = '#FF0000'
      _event.borderColor = '#FF0000'
      _event.textColor = '#FFFFFF'
    } else {
      // Se não for um status especial, usar a cor do calendário
      const calendarFilter = store.availableCalendars.find(c => c.label === _event.extendedProps.calendar)
      if (calendarFilter) {
        const colorValue = getColorValue(calendarFilter.color)
        _event.backgroundColor = colorValue
        _event.borderColor = colorValue
      }
    }

    if (_event.description === undefined) {
      _event.description = ''
    }

    store.addEvent(_event).then(refetchEvents)
  }

  const updateEvent = _event => {
    // Garantir que status tem um valor
    if (!_event.extendedProps) {
      _event.extendedProps = {}
    }
    
    if (!_event.extendedProps.status) {
      _event.extendedProps.status = 'In Progress'
    }

    // Aplicar a cor baseada no status
    const status = _event.extendedProps.status
    if (status === 'Done' || status === 'Finalizado') {
      _event.backgroundColor = 'rgba(158, 158, 158, 0.6)'
      _event.borderColor = 'rgba(158, 158, 158, 0.6)'
      _event.textColor = '#000000'
    } else if (status === 'Urgent' || status === 'Urgente') {
      _event.backgroundColor = '#FF0000'
      _event.borderColor = '#FF0000'
      _event.textColor = '#FFFFFF'
    } else {
      // Se não for um status especial, usar a cor do calendário
      const calendarFilter = store.availableCalendars.find(c => c.label === _event.extendedProps.calendar)
      if (calendarFilter) {
        const colorValue = getColorValue(calendarFilter.color)
        _event.backgroundColor = colorValue
        _event.borderColor = colorValue
      }
    }

    store.updateEvent(_event).then(r => {
      updateEventInCalendar(r, ['id', 'title', 'url', 'description'], ['calendar', 'guests', 'location', 'status'])
      refetchEvents()
    })
  }

  const removeEvent = eventId => {
    store.removeEvent(eventId).then(() => removeEventInCalendar(eventId))
  }

  const calendarOptions = reactive({
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'drawerToggler,prev,next title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    events: fetchEvents,
    forceEventDuration: true,
    editable: true,
    eventResizableFromStart: true,
    dragScroll: true,
    dayMaxEvents: 2,
    navLinks: true,
    locales: [ptBrLocale, enLocale],
    locale: locale.value === 'pt' ? 'pt-br' : 'en-gb',

    eventClassNames({ event: calendarEvent }) {
      const calendarLabel = calendarEvent._def.extendedProps.calendar
      const status = calendarEvent._def.extendedProps.status
      
      if (!store.selectedCalendars.includes(calendarLabel)) {
        return ['d-none']
      }
      
      // Adicionar classes baseadas no status
      const classes = [`event-${calendarLabel.toLowerCase().replace(/\s+/g, '-')}`]
      
      if (status === 'Done' || status === 'Finalizado') {
        classes.push('event-completed')
      } else if (status === 'Urgent' || status === 'Urgente') {
        classes.push('event-urgent')
      }
      
      return classes
    },

    eventDidMount({ event: calendarEvent, el }) {
      const calendarLabel = calendarEvent._def.extendedProps.calendar
      const status = calendarEvent._def.extendedProps.status
      
      let backgroundColor = calendarEvent.backgroundColor

      // Aplicar estilos baseados no status
      if (status === 'Done' || status === 'Finalizado') {
        backgroundColor = 'rgba(158, 158, 158, 0.6)' // Cinza transparente
        el.style.backgroundColor = backgroundColor
        el.style.borderColor = backgroundColor
        el.style.color = '#000000'
      } else if (status === 'Urgent' || status === 'Urgente') {
        backgroundColor = '#FF0000' // Vermelho
        el.style.backgroundColor = backgroundColor
        el.style.borderColor = backgroundColor
        el.style.color = '#FFFFFF'
      } else if (!backgroundColor) {
        const calendarFilter = store.availableCalendars.find(c => c.label === calendarLabel)
        if (calendarFilter) {
          backgroundColor = getColorValue(calendarFilter.color)
        }
      }

      if (backgroundColor && store.selectedCalendars.includes(calendarLabel)) {
        el.style.backgroundColor = backgroundColor
        el.style.borderColor = backgroundColor

        if (status !== 'Done' && status !== 'Finalizado' && status !== 'Urgent' && status !== 'Urgente') {
          const colorHex = backgroundColor.replace('#', '')
          const r = parseInt(colorHex.substr(0, 2), 16)
          const g = parseInt(colorHex.substr(2, 2), 16)
          const b = parseInt(colorHex.substr(4, 2), 16)
          const brightness = (r * 299 + g * 587 + b * 114) / 1000

          el.style.color = brightness > 128 ? '#000000' : '#FFFFFF'
        }
      } else if (!store.selectedCalendars.includes(calendarLabel)) {
        el.style.display = 'none'
      }
    },

    eventClick({ event: clickedEvent, jsEvent }) {
      jsEvent.preventDefault()
      if (clickedEvent.url) (clickedEvent.url, '_blank')

      // Aqui garantimos que a descrição seja atribuída corretamente
      event.value = {
        ...extractEventDataFromEventApi(clickedEvent),
        description: clickedEvent.extendedProps?.description || clickedEvent.description || ''
      }

      isEventHandlerSidebarActive.value = true
    },

    dateClick(info) {
      event.value = { ...event.value, start: info.date }
      isEventHandlerSidebarActive.value = true
    },

    eventDrop({ event: droppedEvent }) {
      updateEvent(extractEventDataFromEventApi(droppedEvent))
    },

    eventResize({ event: resizedEvent }) {
      if (resizedEvent.start && resizedEvent.end)
        updateEvent(extractEventDataFromEventApi(resizedEvent))
    },

    customButtons: {
      drawerToggler: {
        text: 'calendarDrawerToggler',
        click() {
          isLeftSidebarOpen.value = true
        },
      },
    },
  })

  watch(locale, newLocale => {
    const fcLocale = newLocale === 'pt' ? 'pt-br' : 'en-gb'

    if (calendarApi.value) {
      calendarApi.value.setOption('locale', fcLocale)
    }

    calendarOptions.locale = fcLocale
  })

  watch(() => store.availableCalendars, () => {
    if (calendarApi.value) {
      refetchEvents()
    }
  }, { deep: true })

  onMounted(() => {
    calendarApi.value = refCalendar.value.getApi()
    setTimeout(() => {
      refetchEvents()
    }, 100)
  })

  const jumpToDate = currentDate => {
    calendarApi.value?.gotoDate(new Date(currentDate))
  }

  watch(() => configStore.isAppRTL, val => {
    if (calendarApi.value) {
      calendarApi.value.setOption('direction', val ? 'rtl' : 'ltr')
    }
  })

  return {
    refCalendar,
    calendarOptions,
    addEvent,
    updateEvent,
    removeEvent,
    refetchEvents,
    jumpToDate,
  }
}