import '../styles/main.css'
import '../styles/dashboard.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
