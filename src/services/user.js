// src/services/user.js
import axios from 'axios';
import authService from './auth';

// URL base da API
const API_URL = 'http://localhost:8080/api/admin/';

/**
 * Serviço para gerenciamento de usuários (somente para administradores)
 */
class UserService {
  /**
   * Obtém a lista de todos os usuários
   * @returns {Promise} Promise com a lista de usuários
   */
  async getAllUsers() {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      const response = await axios.get(API_URL + 'users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário (username, email, password, role)
   * @returns {Promise} Promise com a resposta da criação
   */
  async createUser(userData) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      return await axios.post(API_URL + 'users', userData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados atualizados do usuário
   * @returns {Promise} Promise com a resposta da atualização
   */
  async updateUser(id, userData) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      return await axios.put(API_URL + `users/${id}`, userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Exclui um usuário
   * @param {number} id - ID do usuário
   * @returns {Promise} Promise com a resposta da exclusão
   */
  async deleteUser(id) {
    try {
      // Garante que o token de autenticação esteja definido
      authService.isAuthenticated();
      
      return await axios.delete(API_URL + `users/${id}`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }
}

export default new UserService();
