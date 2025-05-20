import { defineStore } from 'pinia'
import axios from 'axios'

// URL base da API
const API_URL = 'http://localhost:8080/api'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    availableCalendars: [
      { color: '#18e125', label: 'Meeting' },        // error
      { color: '#d5d51b', label: 'Task' },           // primary
      { color: '#673ab7', label: 'Deadline' },       // warning
      { color: '#fb0000', label: 'High Priority' },  // success
      { color: '#2196f3', label: 'Presentation' },   // info
    ],
    selectedCalendars: ['Meeting', 'Task', 'Deadline', 'High Priority', 'Presentation'],
  }),

  actions: {
    // Buscar eventos com base nos filtros selecionados
    async fetchEvents() {
      try {
        const response = await axios.get(`${API_URL}/events`, {
          params: {
            calendars: this.selectedCalendars.join(','),
          },
        })
        if (response.status === 200) {
          return response.data
        } else {
          console.error('Erro ao buscar eventos:', response.statusText)
          return { message: response.statusText }
        }
      } catch (error) {
        console.error('Erro na requisição:', error)
        return { message: error.message }
      }
    },

    async addEvent(event) {
      try {
        // Converte as datas para ISO se forem tipo Date
        const formattedEvent = {
          ...event,
          start: new Date(event.start).toISOString(),
          end: new Date(event.end).toISOString(),
        }

        const response = await axios.post(`${API_URL}/events`, formattedEvent)
        return response.data
      } catch (error) {
        console.error('Erro ao adicionar evento:', error)
        throw error
      }
    },

    async updateEvent(event) {
      try {
        const formattedEvent = {
          ...event,
          start: new Date(event.start).toISOString(),
          end: new Date(event.end).toISOString(),
        }

        const response = await axios.put(`${API_URL}/events/${event.id}`, formattedEvent)
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar evento:', error)
        throw error
      }
    },

    async removeEvent(eventId) {
      try {
        const response = await axios.delete(`${API_URL}/events/${eventId}`)
        return response.data
      } catch (error) {
        console.error('Erro ao remover evento:', error)
        throw error
      }
    },

    // NOVOS MÉTODOS PARA GERENCIAMENTO DE FILTROS
    
    // Buscar todos os filtros do backend
    async fetchFilters() {
      try {
        const response = await axios.get(`${API_URL}/filters`)
        if (response.status === 200) {
          this.availableCalendars = response.data
          // Inicializa os filtros selecionados com todos os disponíveis por padrão
          this.selectedCalendars = this.availableCalendars.map(calendar => calendar.label)
          return response.data
        } else {
          console.error('Erro ao buscar filtros:', response.statusText)
          return { message: response.statusText }
        }
      } catch (error) {
        console.error('Erro ao buscar filtros:', error)
        return { message: error.message }
      }
    },

    // Adicionar um novo filtro
    async addFilter(filter) {
      try {
        const response = await axios.post(`${API_URL}/filters`, filter)
        if (response.status === 201 || response.status === 200) {
          // Adiciona o novo filtro à lista de disponíveis
          this.availableCalendars.push(response.data)
          // Adiciona automaticamente à lista de selecionados
          this.selectedCalendars.push(response.data.label)
          return response.data
        } else {
          throw new Error(`Erro ao adicionar filtro: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Erro ao adicionar filtro:', error)
        throw error
      }
    },

    // Atualizar um filtro existente
    async updateFilter(originalLabel, updatedFilter) {
      try {
        const response = await axios.put(`${API_URL}/filters/${encodeURIComponent(originalLabel)}`, updatedFilter)
        if (response.status === 200) {
          // Atualiza o filtro na lista de disponíveis
          const index = this.availableCalendars.findIndex(c => c.label === originalLabel)
          if (index !== -1) {
            this.availableCalendars[index] = response.data
          }
          
          // Atualiza na lista de selecionados se necessário
          if (this.selectedCalendars.includes(originalLabel)) {
            const selectedIndex = this.selectedCalendars.indexOf(originalLabel)
            this.selectedCalendars[selectedIndex] = response.data.label
          }
          
          return response.data
        } else {
          throw new Error(`Erro ao atualizar filtro: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Erro ao atualizar filtro:', error)
        throw error
      }
    },

    // Remover um filtro
    async removeFilter(label) {
      try {
        const response = await axios.delete(`${API_URL}/filters/${encodeURIComponent(label)}`)
        if (response.status === 200 || response.status === 204) {
          // Remove o filtro da lista de disponíveis
          const index = this.availableCalendars.findIndex(c => c.label === label)
          if (index !== -1) {
            this.availableCalendars.splice(index, 1)
          }
          
          // Remove da lista de selecionados se estiver lá
          this.selectedCalendars = this.selectedCalendars.filter(l => l !== label)
          
          return { success: true }
        } else {
          throw new Error(`Erro ao remover filtro: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Erro ao remover filtro:', error)
        throw error
      }
    },

    // Salvar as configurações de filtros selecionados para o usuário
    async saveSelectedFilters() {
      try {
        const response = await axios.post(`${API_URL}/filters/selected`, {
          selectedFilters: this.selectedCalendars
        })
        return response.data
      } catch (error) {
        console.error('Erro ao salvar filtros selecionados:', error)
        throw error
      }
    }
  },
})