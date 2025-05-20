// src/services/event.js
import axios from 'axios';
import authService from './auth';

// URL base da API
const API_URL = 'http://localhost:8080/api/events';

/**
 * Serviço para gerenciamento de eventos do calendário
 */
class EventService {
  /**
   * Obtém todos os eventos do calendário do usuário atual
   * @param {string} calendars - Opcional: Filtro de calendários separados por vírgula
   * @returns {Promise} Promise com a lista de eventos
   */
  async getEvents(calendars) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      let url = API_URL;
      
      // Adiciona parâmetros de consulta se fornecidos
      if (calendars) {
        url += `?calendars=${encodeURIComponent(calendars)}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  /**
   * Obtém um evento específico por ID
   * @param {number} id - ID do evento
   * @returns {Promise} Promise com os dados do evento
   */
  async getEventById(id) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo evento no calendário
   * @param {Object} eventData - Dados do evento
   * @returns {Promise} Promise com a resposta da criação
   */
  async createEvent(eventData) {
    try {
      // Garante que o token de autenticação esteja definido
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

  /**
   * Atualiza um evento existente
   * @param {number} id - ID do evento
   * @param {Object} eventData - Dados atualizados do evento
   * @returns {Promise} Promise com a resposta da atualização
   */
  async updateEvent(id, eventData) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui um evento
   * @param {number} id - ID do evento
   * @returns {Promise} Promise com a resposta da exclusão
   */
  async deleteEvent(id) {
    try {
      // Garante que o token de autenticação esteja definido
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
