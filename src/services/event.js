// src/services/event.js
import axios from 'axios';
import authService from './auth';

// URL base da API
const API_URL = 'http://localhost:8080/api/events';

class EventService {
  async getEvents(calendars, userId) {
    try {
      authService.isAuthenticated();
      
      let url = API_URL;
      let params = {};
      
      if (calendars) {
        params.calendars = calendars;
      }
      
      if (userId) {
        params.userId = userId;
      }
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  async getEventById(id) {
    try {
      authService.isAuthenticated();
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${id}:`, error);
      throw error;
    }
  }

  async createEvent(eventData) {
    try {
      authService.isAuthenticated();
      
      // Adiciona o ID do usuário atual ao evento
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        eventData.userId = currentUser.id;
      }
      
      const response = await axios.post(API_URL, eventData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvent(id, eventData) {
    try {
      authService.isAuthenticated();
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  }

  async deleteEvent(id) {
    try {
      authService.isAuthenticated();
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir evento ${id}:`, error);
      throw error;
    }
  }
}

export default new EventService();
