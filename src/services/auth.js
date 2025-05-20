// src/services/auth.js
import axios from 'axios';

// URL base da API
const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
  async login(username, password) {
    try {
      const response = await axios.post(API_URL + 'signin', {
        username,
        password
      });
      
      if (response.data.token) {
        // Armazena os dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Define o token para todas as requisições subsequentes
        this.setAuthHeader(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      this.setAuthHeader(user.token);
      return true;
    }
    return false;
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }
}

// Instância singleton
const authService = new AuthService();

// Inicializa o token de autenticação se o usuário estiver logado
const user = authService.getCurrentUser();
if (user && user.token) {
  authService.setAuthHeader(user.token);
}

export default authService;
