export interface Project {
  id: string
  title: string
  description: string
  thumbnail?: string
  tags: string[]
  techStack: string[]
  demoUrl: string | false
  downloadUrl?: string | false
  githubUrl?: string
  docUrl?: string | false
  playUrl?: string | false
  discussUrl?: string | false
  createdAt: Date | string
  timeline?: string
  challenges?: string
  solutions?: string
  icon: string
}
