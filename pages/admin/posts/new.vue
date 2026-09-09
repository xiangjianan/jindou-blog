<template>
  <div class="editor-page">
    <div class="header">
      <h1>New Post</h1>
      <div class="actions">
        <button @click="save(false)" :disabled="saving" class="btn-save">
          {{ saving ? 'Saving...' : 'Save Draft' }}
        </button>
        <button @click="save(true)" :disabled="saving" class="btn-publish">
          {{ saving ? 'Publishing...' : 'Publish' }}
        </button>
      </div>
    </div>
    
    <form class="form">
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" v-model="form.title" type="text" required />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="category">Category</label>
          <input id="category" v-model="form.category" type="text" required />
        </div>
        
        <div class="form-group">
          <label for="tags">Tags (comma separated)</label>
          <input id="tags" v-model="form.tags" type="text" />
        </div>
      </div>
      
      <div class="form-group">
        <label for="excerpt">Excerpt</label>
        <textarea id="excerpt" v-model="form.excerpt" rows="2"></textarea>
      </div>
      
      <div class="form-group">
        <label>Cover Image</label>
        <div class="upload-row">
          <input v-model="form.coverImage" type="text" placeholder="Image URL or upload" />
          <input type="file" ref="fileInput" accept="image/*" @change="uploadImage" hidden />
          <button type="button" @click="($refs.fileInput as HTMLInputElement).click()" class="btn-upload">
            Upload
          </button>
        </div>
      </div>
      
      <MarkdownEditor v-model="form.content" />
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const form = reactive({
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  category: '',
  tags: ''
})

const saving = ref(false)
const router = useRouter()

const save = async (published: boolean) => {
  if (!form.title || !form.content || !form.category) {
    alert('Please fill in title, content, and category')
    return
  }
  
  saving.value = true
  
  try {
    const post = await $fetch('/api/admin/posts', {
      method: 'POST',
      body: {
        ...form,
        published
      }
    })
    
    router.push('/admin')
  } catch (e) {
    alert('Failed to save post')
    console.error(e)
  } finally {
    saving.value = false
  }
}

const uploadImage = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const result = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    
    form.coverImage = result.url
  } catch (e) {
    alert('Failed to upload image')
    console.error(e)
  }
}
</script>

<style scoped>
.editor-page {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3436;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-save,
.btn-publish {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-save {
  background: white;
  border: 1px solid #dfe6e9;
  color: #2d3436;
}

.btn-publish {
  background: #6c5ce7;
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled),
.btn-publish:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-save:disabled,
.btn-publish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3436;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6c5ce7;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.upload-row {
  display: flex;
  gap: 0.5rem;
}

.btn-upload {
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border: 1px solid #dfe6e9;
  border-radius: 0.25rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-upload:hover {
  background: #dfe6e9;
}
</style>
