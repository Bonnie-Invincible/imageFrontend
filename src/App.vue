<template>
  <div id="app">
    <NavBar v-if="isAuthenticated" />
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  },
  setup() {
    const authStore = useAuthStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    return {
      isAuthenticated
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
}
</style>



