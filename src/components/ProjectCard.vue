<script setup lang="ts">
import type { Project } from '@/types/project'

defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="border-2 border-transparent rounded-lg shadow-lg  transition-all duration-300 hover:border-amber-200 dark:hover:bg-black/70 light:hover:bg-white/70">
    <div class="p-4">
      <h3 class="flex text-lg font-bold">
        <p class="flex items-center py-2">
          <i
            :class="project.icon" class="mr-2 text-2xl"
          />
          <span> {{ project.title }}</span>
        </p>
      </h3>
      <p class="text-shadow-gray-400">
        {{ project.description }}
      </p>

      <div class="flex flex-col items-start">
        <div class="mt-2 flex text-sm">
          <div class="i-noto:hourglass-done mr-1 text-gray-300 light:text-gray-600" />
          <span>Created at {{ project.createdAt }} </span>
        </div>
        <div v-if="project.playUrl" class="flex items-center text-sm ">
          <div class="i-streamline-color:play-list-8-flat mr-1" />
          <a :href="project.playUrl" target="_blank" class="text-sky-500 hover:underline">Install / Try it out </a>
        </div>
        <div v-if="project.demoUrl" class="flex items-center text-sm text-gray-300">
          <div class="i-streamline-ultimate-color:youtube-clip-logo mr-1" />
          <a :href="project.demoUrl" target="_blank" class="text-sky-500 hover:underline">Watch Demo / Tutorial </a>
        </div>
        <div v-if="project.discussUrl" class="flex items-center">
          <div class="i-fluent-color:chat-bubbles-question-16 mr-1 inline-block" />
          <a :href="project.discussUrl" target="_blank" class="text-sky-500 hover:underline">Join discussion</a>
        </div>
        <div v-if="project.docUrl" class="flex items-center">
          <div class="i-streamline-ultimate-color:book-search mr-1 inline-block" />
          <a :href="project.docUrl" target="_blank" class="text-sky-500 hover:underline">Read Docs</a>
        </div>
        <div class="flex items-center">
          <div class="i-skill-icons:github-dark mr-1 inline-block" />
          <a :href="project.githubUrl" target="_blank" class="text-sky-500 hover:underline">Source Code</a>
        </div>
      </div>
      <div class="mt-4">
        <span v-for="tag in project.tags" :key="tag" class="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 font-semibold">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
