// src/services/user.js tardio
import axios from 'axios';
import authService from './auth';

// URL base da API
const API_URL = 'http://localhost:8080/api/admin/';

class UserService {
  async getAllUsers() {
    try {
      authService.isAuthenticated();
      
      const response = await axios.get(API_URL + 'users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      authService.isAuthenticated();
      return await axios.post(API_URL + 'users', userData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      authService.isAuthenticated();
      return await axios.put(API_URL + `users/${id}`, userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      authService.isAuthenticated();
      return await axios.delete(API_URL + `users/${id}`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }
}

export default new UserService();
