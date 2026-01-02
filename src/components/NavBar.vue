<template>
  <nav class="navbar">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">Image Share Platform</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/my-images" class="nav-link">My Images</router-link>
          <div class="user-info">
            <span class="username">{{ user?.username }}</span>
            <button @click="handleLogout" class="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'NavBar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const user = computed(() => authStore.getUser())

    const handleLogout = () => {
      authStore.clearAuth()
      router.push('/login')
    }

    return {
      user,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  font-size: 20px;
  font-weight: bold;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.3s;
}

.brand-link:hover {
  color: var(--accent-hover);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: var(--bg-tertiary);
}

.nav-link.router-link-active {
  color: var(--accent);
  background-color: var(--bg-tertiary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  color: var(--text-secondary);
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

