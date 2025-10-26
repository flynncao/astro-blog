<script setup lang="ts">
// import type { Photo } from '../types/photos'

const { url, view, text } = defineProps<{
  url: string
  view?: 'cover' | 'contain'
  text?: string
}>()

console.log('Photo component loaded', url)
console.log('text?', text)
console.log('views?', view)
</script>

<template>
  <div class="photos grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-4" mx-auto max-w-500>
    <span>title of</span>
    <image
      :src="url"
      :alt="text"
      loading="lazy"
      w-full
      :class="view === 'contain' ? 'object-contain sm:aspect-square' : 'object-cover aspect-square'"
    />
  </div>
</template>

<style>
  img {
    margin-block: 2.5rem;
    border-radius: 0.75rem;
  }
</style>
