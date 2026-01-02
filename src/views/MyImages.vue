<template>
  <div class="my-images-container">
    <div class="container">
      <div class="page-header">
        <h1>My Images</h1>
        <button @click="showUploadModal = true" class="btn">Upload Image</button>
      </div>

      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="images.length === 0" class="empty-state">
        <p>You haven't uploaded any images yet. Upload your first image!</p>
      </div>
      <div v-else class="images-grid">
        <div v-for="image in images" :key="image.id" class="image-card">
          <div class="image-wrapper">
            <img
              :src="getImageUrl(image)"
              :alt="image.name"
              class="image"
            />
          </div>
          <div class="image-info">
            <div v-if="editingId === image.id" class="edit-form">
              <input
                v-model="editName"
                type="text"
                class="input"
                @keyup.enter="saveEdit(image.id)"
                @keyup.esc="cancelEdit"
              />
              <div class="edit-actions">
                <button @click="saveEdit(image.id)" class="btn btn-secondary">Save</button>
                <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
              </div>
            </div>
            <div v-else>
              <h3 class="image-name">{{ image.name }}</h3>
              <p class="image-date">{{ formatDate(image.uploadDate) }}</p>
              <div class="image-actions">
                <button @click="startEdit(image)" class="btn btn-secondary">Edit Name</button>
                <button @click="downloadImage(image.id, image.name)" class="btn btn-secondary">
                  Download
                </button>
                <button @click="confirmDelete(image)" class="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="modal-content" @click.stop>
        <h2>Upload Image</h2>
        <form @submit.prevent="handleUpload" class="upload-form">
          <div class="form-group">
            <label for="file">Select Image</label>
            <input
              id="file"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="input"
              required
            />
          </div>
          <div class="form-group">
            <label for="imageName">Image Name (Optional)</label>
            <input
              id="imageName"
              v-model="uploadForm.name"
              type="text"
              class="input"
              placeholder="Leave empty to use original filename"
            />
          </div>
          <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
          <div v-if="uploadSuccess" class="success-message">{{ uploadSuccess }}</div>
          <div class="modal-actions">
            <button type="button" @click="showUploadModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete image "{{ deletingImage?.name }}"? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="handleDelete" class="btn btn-danger" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Confirm Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { imageApi } from '../api/image'
import { API_BASE_URL } from '../config'

export default {
  name: 'MyImages',
  setup() {
    const images = ref([])
    const loading = ref(false)
    const error = ref('')
    const showUploadModal = ref(false)
    const uploadForm = ref({
      file: null,
      name: ''
    })
    const uploading = ref(false)
    const uploadError = ref('')
    const uploadSuccess = ref('')
    const editingId = ref(null)
    const editName = ref('')
    const showDeleteModal = ref(false)
    const deletingImage = ref(null)
    const deleting = ref(false)

    const fetchImages = async () => {
      loading.value = true
      error.value = ''
      try {
        images.value = await imageApi.getMyImages()
      } catch (err) {
        error.value = 'Failed to load images, please refresh and try again'
      } finally {
        loading.value = false
      }
    }

    const getImageUrl = (image) => {
      return image.blobUrl || `${API_BASE_URL}/api/images/${image.id}/download`
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('en-US')
    }

    const handleFileChange = (event) => {
      uploadForm.value.file = event.target.files[0]
    }

    const handleUpload = async () => {
      if (!uploadForm.value.file) return

      uploading.value = true
      uploadError.value = ''
      uploadSuccess.value = ''

      try {
        await imageApi.uploadImage(uploadForm.value.file, uploadForm.value.name)
        uploadSuccess.value = 'Upload successful!'
        uploadForm.value = { file: null, name: '' }
        setTimeout(() => {
          showUploadModal.value = false
          fetchImages()
        }, 1000)
      } catch (err) {
        uploadError.value = err.response?.data?.message || 'Upload failed, please try again'
      } finally {
        uploading.value = false
      }
    }

    const startEdit = (image) => {
      editingId.value = image.id
      editName.value = image.name
    }

    const cancelEdit = () => {
      editingId.value = null
      editName.value = ''
    }

    const saveEdit = async (id) => {
      if (!editName.value.trim()) {
        alert('Image name cannot be empty')
        return
      }

      try {
        await imageApi.updateImageName(id, editName.value.trim())
        editingId.value = null
        editName.value = ''
        fetchImages()
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update, please try again')
      }
    }

    const confirmDelete = (image) => {
      deletingImage.value = image
      showDeleteModal.value = true
    }

    const handleDelete = async () => {
      if (!deletingImage.value) return

      deleting.value = true
      try {
        await imageApi.deleteImage(deletingImage.value.id)
        showDeleteModal.value = false
        deletingImage.value = null
        fetchImages()
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed, please try again')
      } finally {
        deleting.value = false
      }
    }

    const downloadImage = async (id, name) => {
      try {
        const blob = await imageApi.downloadImage(id)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = name || 'image'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        alert('Download failed, please try again')
      }
    }

    onMounted(() => {
      fetchImages()
    })

    return {
      images,
      loading,
      error,
      showUploadModal,
      uploadForm,
      uploading,
      uploadError,
      uploadSuccess,
      editingId,
      editName,
      showDeleteModal,
      deletingImage,
      deleting,
      handleFileChange,
      handleUpload,
      startEdit,
      cancelEdit,
      saveEdit,
      confirmDelete,
      handleDelete,
      downloadImage,
      getImageUrl,
      formatDate
    }
  }
}
</script>

<style scoped>
.my-images-container {
  flex: 1;
  padding: 40px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.image-card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: transform 0.3s, box-shadow 0.3s;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 16px;
}

.image-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--text-primary);
  word-break: break-word;
}

.image-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.image-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.image-actions .btn {
  flex: 1;
  min-width: 80px;
  font-size: 13px;
  padding: 8px 12px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.edit-actions .btn {
  flex: 1;
  font-size: 13px;
  padding: 8px 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  border: 1px solid var(--border);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.modal-content p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-actions .btn {
  flex: 1;
}
</style>

