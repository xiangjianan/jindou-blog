<template>
  <div class="markdown-editor">
    <div class="tabs">
      <button :class="{ active: mode === 'write' }" @click="mode = 'write'">Write</button>
      <button :class="{ active: mode === 'preview' }" @click="mode = 'preview'">Preview</button>
    </div>
    
    <div class="editor-container">
      <textarea
        v-show="mode === 'write'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Write your content in Markdown..."
      />
      
      <div v-show="mode === 'preview'" class="preview" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const mode = ref<'write' | 'preview'>('write')

const renderedContent = computed(() => {
  if (!props.modelValue) return '<p class="empty-preview">Nothing to preview</p>'
  return marked(props.modelValue)
})
</script>

<style scoped>
.markdown-editor {
  border: 1px solid #dfe6e9;
  border-radius: 0.25rem;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #dfe6e9;
  background: #f5f5f5;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #636e72;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #dfe6e9;
}

.tabs button.active {
  background: white;
  color: #6c5ce7;
  border-bottom: 2px solid #6c5ce7;
}

.editor-container {
  min-height: 400px;
}

textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: none;
  resize: vertical;
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

textarea:focus {
  outline: none;
}

.preview {
  padding: 1rem;
  min-height: 400px;
  line-height: 1.8;
  color: #2d3436;
}

.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.preview :deep(p) {
  margin-bottom: 1rem;
}

.preview :deep(code) {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.preview :deep(pre) {
  background: #2d3436;
  color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.preview :deep(pre code) {
  background: none;
  padding: 0;
}

.preview :deep(a) {
  color: #6c5ce7;
  text-decoration: underline;
}

.preview :deep(ul),
.preview :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.preview :deep(li) {
  margin-bottom: 0.5rem;
}

.preview :deep(blockquote) {
  border-left: 4px solid #6c5ce7;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #636e72;
}

.empty-preview {
  color: #b2bec3;
  font-style: italic;
}
</style>
