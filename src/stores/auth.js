import { ref, computed } from 'vue'

const token = ref(localStorage.getItem('token') || '')
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export function useAuthStore() {
  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (newToken, userData) => {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getToken = () => token.value
  const getUser = () => user.value

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
    getToken,
    getUser
  }
}

