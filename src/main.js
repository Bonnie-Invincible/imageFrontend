import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)

app.use(router)

// Check authentication status on app startup, redirect to login if not authenticated and not on login/register page
router.isReady().then(() => {
  const authStore = useAuthStore()
  const currentPath = router.currentRoute.value.path
  const publicRoutes = ['/login', '/register']
  
  if (!authStore.isAuthenticated && !publicRoutes.includes(currentPath)) {
    router.push('/login')
  }
})

app.mount('#app')

