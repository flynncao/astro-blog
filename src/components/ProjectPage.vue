// TODO: Apply projects page to all langs in i18n/ui.ts
<script setup lang="ts">
import type { Project } from '../types/project'
import { useMediaQuery, useStorage } from '@vueuse/core'
import { computed, ref, watch,onMounted } from 'vue'
import ProjectCard from './ProjectCard.vue'
// Data and state for projects card
const projects = ref<Project[]>([
  {
    id: '1',
    title: 'afanime',
    description: '▶️转发和管理动画仓库的消息到你的Telegram群组，Powered by Bangumi&RealSearch',
    tags: ['Telegram', 'Telegram Bot', 'anime', '群组管理'],
    techStack: ['TypeScript', 'GrammY', 'tsup', 'MongoDB'],
    demoUrl: 'https://www.youtube.com/watch?v=kWP6d9Kpjos',
    githubUrl: 'https://github.com/flynncao/afanime',
    docUrl: 'https://afanime.flynncao.uk',
    playUrl: 'https://t.me/gochumonwa',
    createdAt: '2023-12',
    timeline: '2 weeks',
    challenges: 'State management was tricky.',
    solutions: 'Used Pinia to solve state management issues.',
    icon: 'i-simple-icons:telegram',
  },
  {
    id: '2',
    title: 'Bangumi Comment Enhance',
    description: '💬优化Bangumi的小组和番剧评论区体验',
    tags: ['Bangumi', 'UserScript'],
    techStack: ['TypeScript', 'Jquery', 'Rollup'],
    demoUrl: false,
    githubUrl: 'https://github.com/flynncao/bangumi-episode-enhance-userscript',
    discussUrl: 'https://bgm.tv/group/topic/399446',
    createdAt: '2024',
    timeline: '1 month',
    challenges: 'Component lifecycle was hard to manage.',
    solutions: 'Used React Hooks to simplify component logic.',
    icon: 'i-iconamoon:comment-dots',
  },
  {
    id: '3',
    title: 'Bangumi Plugin Boilerplate',
    description: 'Bangumi超合金组件插件模板',
    tags: ['Bangumi', 'UserScript', 'Template'],
    techStack: ['TypeScript', 'Jquery', 'Rollup'],
    demoUrl: false,
    githubUrl: 'https://github.com/flynncao/bangumi-plugin-boilerplate/tree/main/',
    createdAt: '2024',
    timeline: '1 month',
    challenges: 'Component lifecycle was hard to manage.',
    solutions: 'Used React Hooks to simplify component logic.',
    icon: 'i-lucide-lab:toast',
  },
  {
    id: '4',
    title: 'Bangumi Copy Title',
    description: '一键复制条目的中日标题到剪贴板',
    tags: ['Bangumi', 'UserScript'],
    techStack: ['TypeScript', 'Jquery', 'Rollup'],
    demoUrl: false,
    githubUrl: 'https://github.com/flynncao/bangumi-plugin-boilerplate/tree/copy-title/',
    discussUrl: 'https://bgm.tv/group/topic/427538',
    createdAt: '2024',
    timeline: '1 month',
    challenges: 'Component lifecycle was hard to manage.',
    solutions: 'Used React Hooks to simplify component logic.',
    icon: 'i-lucide-lab:copy-text',
  },
  {
    id: '10',
    title: 'Bangumi Sakana Widget',
    description: '🐟适用于Bangumi的Sakana-Widget移植微校',
    tags: ['Bangumi', 'UserScript', 'Sakana-Widget', 'Widget'],
    techStack: ['TypeScript', 'Jquery', 'Rollup'],
    demoUrl: false,
    githubUrl: 'https://github.com/flynncao/bangumi-sakana-widget',
    discussUrl: 'https://bgm.tv/group/topic/404343',
    createdAt: '2024',
    timeline: '1 month',
    challenges: 'Component lifecycle was hard to manage.',
    solutions: 'Used React Hooks to simplify component logic.',
    icon: 'i-ph:fish-simple-bold',
  },
])

// TODO: Implement search functionality using backend service instead 
// const searchTerm = ref('')

// const filteredProjects = computed(() => {
//   if (!searchTerm.value) {
//     return projects.value
//   }
//   return projects.value.filter(p =>
//     p.title.toLowerCase().includes(searchTerm.value.toLowerCase())
//     || p.description.toLowerCase().includes(searchTerm.value.toLowerCase())
//     || p.tags.some(tag => tag.toLowerCase().includes(searchTerm.value.toLowerCase())),
//   )
// })

// const isXL = useMediaQuery('(min-width: 1536px)')
// const isLG = useMediaQuery('(min-width: 1024px)')
// const isMD = useMediaQuery('(min-width: 768px)')
const isMobile = useMediaQuery('(max-width: 500px)')

const gridColNum = computed(() => {
  if (isMobile.value) {
    return 1
  }
  else {
    return 2
  }
})

const state = computed(() => {
  const rowNum = Math.ceil(projects.value.length / gridColNum.value)
  const newGrid: any[][] = Array.from({ length: gridColNum.value }, () =>
    Array.from({ length: rowNum }).map(x => x) as any[])

  for (let i = 0; i < gridColNum.value; i++) {
    for (let j = 0; j < rowNum; j++) {
      const index = j * gridColNum.value + i
      newGrid[i]![j] = projects.value[index]
    }
  }
  return newGrid
})
</script>

<template>
  <!-- <img src="/sad-girl-lofi-anime-girl-3840x2160-14872.jpeg" class="fixed left-0 top-0 mb-4 h-full w-full rounded-lg object-none opacity-80 blur-sm -z-10"> -->
  <div class="container relative top-0 z-10 mx-auto p-4">
    <h1 class="mb-4 text-3xl font-bold ">
      Projects
    </h1>
    <!-- <input v-model="searchTerm" type="text" placeholder="Search projects..." class="focus:inset-shadow-amber-200 mb-4 w-full border-gray-500 rounded bg-transparent p-2 transition-all duration-300"> -->

    <div class="container">
      <ul class="ssm:grid-cols-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <li v-for="(col, i) in state" :key="i" class="col-span-1 mb-4">
          <ul class="flex flex-col gap-2">
            <li v-for="project in col" :key="project?.id">
              <ProjectCard v-if="project" :project="project" />
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
