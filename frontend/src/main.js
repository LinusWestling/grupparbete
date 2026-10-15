import '../styles/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { startConnectionTracking } from './services/connectionStatus.js'

const stopConnectionTracking = startConnectionTracking()
if (import.meta.hot) import.meta.hot.dispose(stopConnectionTracking)

createApp(App).use(router).mount('#app')
