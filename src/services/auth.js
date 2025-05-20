// src/services/auth.js
import axios from 'axios';

// URL base da API
const API_URL = 'http://localhost:8080/api/auth/';

/**
 * Serviço de autenticação para login, registro e gerenciamento de usuários
 */
class AuthService {
  /**
   * Fazer login de usuário
   * @param {string} username - Nome de usuário ou email
   * @param {string} password - Senha do usuário
   * @returns {Promise} Promise com os dados do usuário e token JWT
   */
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
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token;
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Fazer logout do usuário
   */
  logout() {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Registrar um novo usuário
   * @param {Object} userData - Dados do usuário (username, email, password)
   * @returns {Promise} Promise com a resposta do registro
   */
  async register(userData) {
    try {
      return await axios.post(API_URL + 'signup', userData);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado e atualiza o cabeçalho de autorização
   * @returns {boolean} Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token;
      return true;
    }
    return false;
  }

  /**
   * Obtém os dados do usuário atual do armazenamento local
   * @returns {Object|null} Dados do usuário ou null se não estiver autenticado
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Verifica se o usuário atual tem permissão de administrador
   * @returns {boolean} Verdadeiro se o usuário for administrador
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }
}

export default new AuthService();
