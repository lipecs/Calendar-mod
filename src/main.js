// src/main.js (verificar se está correto)
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Registrar a instância do Axios antes de outros plugins
import axios from 'axios'
app.config.globalProperties.$axios = axios

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
