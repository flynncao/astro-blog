<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface RainStreak {
  x: number
  y: number
  length: number
  width: number
  speed: number
  opacity: number
}

interface ThemeProfile {
  minOpacity: number
  maxOpacity: number
}

const MOBILE_BREAKPOINT = 768
const MIN_STREAKS = 18
const MAX_STREAKS = 42
const AREA_PER_STREAK = 50_000
const MIN_STREAK_LENGTH = 22
const MAX_STREAK_LENGTH = 42
const MIN_STREAK_WIDTH = 0.8
const MAX_STREAK_WIDTH = 1.2
const MIN_STREAK_SPEED = 650
const MAX_STREAK_SPEED = 900
const RAIN_ANGLE_DEGREES = 20
const MAX_DEVICE_PIXEL_RATIO = 2
const MAX_FRAME_DELTA_SECONDS = 0.033
const RECYCLE_MARGIN = 80

const RAIN_ANGLE_RADIANS = (RAIN_ANGLE_DEGREES * Math.PI) / 180
const RAIN_DIRECTION_X = -Math.sin(RAIN_ANGLE_RADIANS)
const RAIN_DIRECTION_Y = Math.cos(RAIN_ANGLE_RADIANS)

const LIGHT_THEME_PROFILE: ThemeProfile = {
  minOpacity: 0.16,
  maxOpacity: 0.28,
}

const DARK_THEME_PROFILE: ThemeProfile = {
  minOpacity: 0.18,
  maxOpacity: 0.34,
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let context: CanvasRenderingContext2D | null = null
let animationFrameId: number | null = null
let motionQuery: MediaQueryList | null = null
let lastFrameTime: number | null = null
let viewportWidth = 0
let viewportHeight = 0
let streaks: RainStreak[] = []
let themeProfile = LIGHT_THEME_PROFILE
let streakColor = ''

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function getStreakCount(): number {
  const areaCount = Math.round((viewportWidth * viewportHeight) / AREA_PER_STREAK)
  return Math.min(MAX_STREAKS, Math.max(MIN_STREAKS, areaCount))
}

function randomizeStreak(streak: RainStreak): void {
  streak.length = randomBetween(MIN_STREAK_LENGTH, MAX_STREAK_LENGTH)
  streak.width = randomBetween(MIN_STREAK_WIDTH, MAX_STREAK_WIDTH)
  streak.speed = randomBetween(MIN_STREAK_SPEED, MAX_STREAK_SPEED)
  streak.opacity = Math.random()
}

function createStreak(index: number, count: number): RainStreak {
  const streak: RainStreak = {
    x: 0,
    y: 0,
    length: 0,
    width: 0,
    speed: 0,
    opacity: 0,
  }

  randomizeStreak(streak)

  const progress = (index + Math.random()) / count
  streak.x = randomBetween(0, viewportWidth + RECYCLE_MARGIN)
  streak.y = -RECYCLE_MARGIN + progress * (viewportHeight + RECYCLE_MARGIN * 2)

  return streak
}

function createStreakField(): void {
  const count = getStreakCount()
  streaks = Array.from({ length: count }, (_, index) => createStreak(index, count))
}

function recycleStreak(streak: RainStreak): void {
  randomizeStreak(streak)

  const entersFromTop = Math.random() < 0.65
  if (entersFromTop) {
    streak.x = randomBetween(0, viewportWidth + RECYCLE_MARGIN)
    streak.y = randomBetween(-RECYCLE_MARGIN - streak.length, -streak.length)
    return
  }

  streak.x = randomBetween(
    viewportWidth + streak.length,
    viewportWidth + RECYCLE_MARGIN + streak.length,
  )
  streak.y = randomBetween(-RECYCLE_MARGIN, viewportHeight * 0.75)
}

function updateStreaks(deltaSeconds: number): void {
  streaks.forEach((streak) => {
    const distance = streak.speed * deltaSeconds
    streak.x += RAIN_DIRECTION_X * distance
    streak.y += RAIN_DIRECTION_Y * distance

    const tailX = streak.x - RAIN_DIRECTION_X * streak.length
    const tailY = streak.y - RAIN_DIRECTION_Y * streak.length
    const exitedLeft = tailX < -RECYCLE_MARGIN
    const exitedBottom = tailY > viewportHeight + RECYCLE_MARGIN

    if (exitedLeft || exitedBottom)
      recycleStreak(streak)
  })
}

function getThemeProfile(): ThemeProfile {
  return document.documentElement.classList.contains('dark')
    ? DARK_THEME_PROFILE
    : LIGHT_THEME_PROFILE
}

function getStreakColor(): string {
  const canvas = canvasRef.value
  return canvas ? getComputedStyle(canvas).color : ''
}

function drawStreak(streak: RainStreak): void {
  if (!context)
    return

  const tailX = streak.x - RAIN_DIRECTION_X * streak.length
  const tailY = streak.y - RAIN_DIRECTION_Y * streak.length
  const opacity = themeProfile.minOpacity
    + streak.opacity * (themeProfile.maxOpacity - themeProfile.minOpacity)
  const gradient = context.createLinearGradient(tailX, tailY, streak.x, streak.y)

  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(1, streakColor)

  context.beginPath()
  context.moveTo(tailX, tailY)
  context.lineTo(streak.x, streak.y)
  context.lineCap = 'butt'
  context.lineWidth = streak.width
  context.globalAlpha = opacity
  context.strokeStyle = gradient
  context.stroke()
}

function drawFrame(): void {
  if (!context)
    return

  context.clearRect(0, 0, viewportWidth, viewportHeight)
  streaks.forEach(drawStreak)
  context.globalAlpha = 1
}

function clearCanvas(): void {
  context?.clearRect(0, 0, viewportWidth, viewportHeight)
}

function hasReducedMotion(): boolean {
  return document.documentElement.classList.contains('motion-reduced')
    || motionQuery?.matches === true
}

function shouldAnimate(): boolean {
  return viewportWidth > MOBILE_BREAKPOINT
    && !hasReducedMotion()
    && document.visibilityState === 'visible'
}

function animate(timestamp: number): void {
  animationFrameId = null

  if (!shouldAnimate()) {
    clearCanvas()
    return
  }

  const deltaSeconds = lastFrameTime === null
    ? 0
    : Math.min((timestamp - lastFrameTime) / 1000, MAX_FRAME_DELTA_SECONDS)

  lastFrameTime = timestamp
  updateStreaks(deltaSeconds)
  drawFrame()
  animationFrameId = requestAnimationFrame(animate)
}

function startAnimation(): void {
  if (animationFrameId !== null)
    return

  if (streaks.length === 0)
    createStreakField()

  lastFrameTime = null
  animationFrameId = requestAnimationFrame(animate)
}

function stopAnimation(): void {
  if (animationFrameId !== null)
    cancelAnimationFrame(animationFrameId)

  animationFrameId = null
  lastFrameTime = null
  clearCanvas()
}

function reconcileAnimation(): void {
  if (shouldAnimate())
    startAnimation()
  else
    stopAnimation()
}

function resizeCanvas(): void {
  const canvas = canvasRef.value
  if (!canvas || !context)
    return

  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight

  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
  canvas.width = Math.round(viewportWidth * pixelRatio)
  canvas.height = Math.round(viewportHeight * pixelRatio)
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function handleResize(): void {
  resizeCanvas()

  if (viewportWidth > MOBILE_BREAKPOINT && !hasReducedMotion())
    createStreakField()
  else
    streaks = []

  reconcileAnimation()
}

function handleThemeChanged(): void {
  themeProfile = getThemeProfile()
  streakColor = getStreakColor()
}

function handleMotionPreferenceChanged(): void {
  if (!hasReducedMotion() && viewportWidth > MOBILE_BREAKPOINT)
    createStreakField()
  else
    streaks = []

  reconcileAnimation()
}

function handleVisibilityChanged(): void {
  reconcileAnimation()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return

  context = canvas.getContext('2d')
  if (!context)
    return

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  themeProfile = getThemeProfile()
  streakColor = getStreakColor()

  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('theme-changed', handleThemeChanged)
  document.addEventListener('visibilitychange', handleVisibilityChanged)
  motionQuery.addEventListener('change', handleMotionPreferenceChanged)

  handleResize()
})

onBeforeUnmount(() => {
  stopAnimation()
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('theme-changed', handleThemeChanged)
  document.removeEventListener('visibilitychange', handleVisibilityChanged)
  motionQuery?.removeEventListener('change', handleMotionPreferenceChanged)

  streaks = []
  context = null
  motionQuery = null
})
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="rain-canvas pointer-events-none fixed left-0 top-0 z-[-1] h-full w-full"
  />
</template>

<style>
.rain-canvas {
  color: color-mix(
    in oklch,
    oklch(var(--un-preset-theme-colors-secondary)) 86%,
    oklch(var(--un-preset-theme-colors-background))
  );
}

html.dark .rain-canvas {
  color: color-mix(
    in oklch,
    oklch(var(--un-preset-theme-colors-background)) 30%,
    oklch(0.82 0.025 255)
  );
}
</style>
