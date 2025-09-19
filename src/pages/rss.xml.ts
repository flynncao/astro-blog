import type { APIContext } from 'astro'
import { generateRSSRaw } from '@/utils/feed'

export async function GET(context: APIContext) {
  return generateRSSRaw(context)
}
