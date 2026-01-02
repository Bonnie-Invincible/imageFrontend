import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import MyImages from '../views/MyImages.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-images',
    name: 'MyImages',
    component: MyImages,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  // Directly check if token exists and is not empty
  const token = authStore.getToken()
  const isAuthenticated = !!(token && token.trim() !== '')

  // Define public routes (no authentication required)
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  // If user is not authenticated
  if (!isAuthenticated) {
    // Can only access login and register pages
    if (isPublicRoute) {
      next()
    } else {
      // Unauthenticated access to other pages, redirect to login
      next('/login')
    }
  } 
  // If user is authenticated
  else {
    // Authenticated user accessing login/register pages, redirect to home
    if (isPublicRoute) {
      next('/')
    } else {
      // Authenticated user accessing other pages, allow access
      next()
    }
  }
})

export default router

