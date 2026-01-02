import axios from 'axios'

const API_BASE_URL = '/api/auth'

export const authApi = {
  async register(username, password, email) {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      password,
      email
    })
    return response.data
  },

  async login(username, password) {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password
    })
    return response.data
  }
}

