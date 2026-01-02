import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_BASE_URL = '/api/images'

const getAuthHeaders = () => {
  const authStore = useAuthStore()
  const token = authStore.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const imageApi = {
  async uploadImage(file, name) {
    const formData = new FormData()
    formData.append('file', file)
    if (name) {
      formData.append('name', name)
    }
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getAllImages() {
    const response = await axios.get(API_BASE_URL)
    return response.data
  },

  async getMyImages() {
    const response = await axios.get(`${API_BASE_URL}/my`, {
      headers: getAuthHeaders()
    })
    return response.data
  },

  async downloadImage(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}/download`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    })
    return response.data
  },

  async updateImageName(id, name) {
    const response = await axios.put(
      `${API_BASE_URL}/${id}`,
      { name },
      { headers: getAuthHeaders() }
    )
    return response.data
  },

  async deleteImage(id) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    })
    return response.data
  }
}

