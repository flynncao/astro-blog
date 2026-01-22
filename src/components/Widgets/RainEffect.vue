<script setup lang="ts">
import * as THREE from 'three'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// ============================================================================
// CONFIGURATION - Adjust these values to customize the rain effect
// ============================================================================

// Enable glass effect mode for light theme (true) or sparkle mode (false)
const GLASS_MODE = false

// Show rain effect in dark theme
const RAIN_IN_DARK_THEME = true

// Show rain effect in light theme
const RAIN_IN_LIGHT_THEME = false

// ============================================================================
// END CONFIGURATION
// ============================================================================

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isMobile = ref(false)

// Detect theme (dark: #1c1f27, light: #ffffff)
function getThemeColors() {
  const root = document.documentElement
  const style = getComputedStyle(root)
  const bgColor = style.backgroundColor

  // Parse RGB from computed style
  const rgb = bgColor.match(/\d+/g)
  if (rgb && rgb.length >= 3) {
    const r = Number.parseInt(rgb[0], 10)
    const g = Number.parseInt(rgb[1], 10)
    const b = Number.parseInt(rgb[2], 10)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // If background is dark (< 128 brightness), use light rain color
    if (brightness < 128) {
      // Subtle white-blue rain for dark background (#1c1f27)
      return { rainColor: new THREE.Vector3(0.85, 0.85, 0.9), rainOpacity: 0.35 }
    }
    else {
      // Light blue rain for light background (#ffffff)
      return { rainColor: new THREE.Vector3(0.45, 0.5, 0.6), rainOpacity: 0.35 }
    }
  }
  // Fallback for light theme
  return { rainColor: new THREE.Vector3(0.45, 0.5, 0.6), rainOpacity: 0.35 }
}

let themeColors: ReturnType<typeof getThemeColors>
let isDarkTheme = false

// Detect if current theme is dark
function detectDarkTheme(): boolean {
  const root = document.documentElement
  const style = getComputedStyle(root)
  const bgColor = style.backgroundColor
  const rgb = bgColor.match(/\d+/g)
  if (rgb && rgb.length >= 3) {
    const r = Number.parseInt(rgb[0], 10)
    const g = Number.parseInt(rgb[1], 10)
    const b = Number.parseInt(rgb[2], 10)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  }
  return false
}

// Check if device is mobile
function checkMobile() {
  isMobile.value = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

let renderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null
let material: THREE.ShaderMaterial | null = null

onMounted(() => {
  checkMobile()
  // Don't initialize on mobile
  if (isMobile.value)
    return

  // Detect theme and check if rain should be shown
  isDarkTheme = detectDarkTheme()
  const shouldShowRain = isDarkTheme ? RAIN_IN_DARK_THEME : RAIN_IN_LIGHT_THEME

  if (!shouldShowRain)
    return

  // Initialize theme colors after DOM is available
  themeColors = getThemeColors()

  const canvas = canvasRef.value
  if (!canvas)
    return

  // Time baseline
  const _startTime = performance.now() / 1000

  // WebGL2 context
  const gl = canvas.getContext('webgl2', { antialias: true })
  if (!gl)
    return

  renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const geometry = new THREE.PlaneGeometry(2, 2)

  // Create procedural background texture
  function makeBackgroundTexture(size = 1024) {
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    if (!ctx)
      return new THREE.CanvasTexture(c)
    // Gradient
    const g = ctx.createLinearGradient(0, 0, size, size)
    g.addColorStop(0, '#101826')
    g.addColorStop(0.5, '#2b4158')
    g.addColorStop(1, '#101026')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    // Simple stars/noise
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const r = Math.random() * 1.5
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(c)
  }

  const bgTexture = makeBackgroundTexture(1024)
  bgTexture.wrapS = bgTexture.wrapT = THREE.RepeatWrapping
  bgTexture.minFilter = THREE.LinearMipmapLinearFilter
  bgTexture.magFilter = THREE.LinearFilter
  bgTexture.generateMipmaps = true

  // Detect if light theme and apply glass mode setting
  const isLightTheme = themeColors.rainColor.z > 0.9
  const useGlassMode = GLASS_MODE

  // Rain intensity (0.1 = very subtle rain for better reading experience)
  const rainIntensity = isLightTheme ? 0.1 : 0.35

  // Shader material
  material = new THREE.ShaderMaterial({
    transparent: true,
    blending: useGlassMode ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      iResolution: { value: new THREE.Vector3() },
      iTime: { value: 0 },
      iMouse: { value: new THREE.Vector3(0, 0, 0) },
      iChannel0: { value: bgTexture },
      u_rain: { value: rainIntensity },
      u_pulse: { value: 0.0 },
      u_pulse_amp: { value: 0.0 },
      u_is_decrease: { value: 0.0 },
      u_disable_lightning: { value: 0.0 },
      u_speed: { value: 1.0 },
      u_story: { value: 0.0 },
      u_rain_color: { value: themeColors.rainColor },
      u_rain_opacity: { value: themeColors.rainOpacity },
      u_is_light_theme: { value: useGlassMode ? 1.0 : 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;

      uniform sampler2D iChannel0;
      uniform vec3 iResolution;
      uniform float iTime;
      uniform vec3 iMouse;
      uniform float u_rain;
      uniform float u_pulse;
      uniform float u_pulse_amp;
      uniform float u_is_decrease;
      uniform float u_disable_lightning;
      uniform float u_speed;
      uniform float u_story;
      uniform vec3 u_rain_color;
      uniform float u_rain_opacity;
      uniform float u_is_light_theme;

      #define S(a, b, t) smoothstep(a, b, t)
      #define CHEAP_NORMALS
      #define USE_POST_PROCESSING

      vec3 N13(float p) {
        vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
        p3 += dot(p3, p3.yzx + 19.19);
        return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
      }

      vec4 N14(float t) {
        return fract(sin(t*vec4(123., 1024., 1456., 264.))*vec4(6547., 345., 8799., 1564.));
      }
      float N(float t) { return fract(sin(t*12345.564)*7658.76); }

      float Saw(float b, float t) { return S(0., b, t)*S(1., b, t); }

      vec2 DropLayer2(vec2 uv, float t) {
        vec2 UV = uv;
        uv.y += t*0.75;
        vec2 a = vec2(6., 1.);
        vec2 grid = a*2.;
        vec2 id = floor(uv*grid);
        float colShift = N(id.x);
        uv.y += colShift;
        id = floor(uv*grid);
        vec3 n = N13(id.x*35.2+id.y*2376.1);
        vec2 st = fract(uv*grid)-vec2(.5, 0);
        float x = n.x-.5;
        float y = UV.y*20.;
        float wiggle = sin(y+sin(y));
        x += wiggle*(.5-abs(x))*(n.z-.5);
        x *= .7;
        float ti = fract(t+n.z);
        y = (Saw(.85, ti)-.5)*.9+.5;
        vec2 p = vec2(x, y);
        float d = length((st-p)*a.yx);
        float mainDrop = S(.4, .0, d);
        float r = sqrt(S(1., y, st.y));
        float cd = abs(st.x-x);
        float trail = S(.23*r, .15*r*r, cd);
        float trailFront = S(-.02, .02, st.y-y);
        trail *= trailFront*r*r;
        y = UV.y;
        float trail2 = S(.2*r, .0, cd);
        float droplets = max(0., (sin(y*(1.-y)*120.)-st.y))*trail2*trailFront*n.z;
        y = fract(y*10.)+(st.y-.5);
        float dd = length(st-vec2(x, y));
        droplets = S(.3, 0., dd);
        float m = mainDrop+droplets*r*trailFront;
        return vec2(m, trail);
      }

      float StaticDrops(vec2 uv, float t) {
        uv *= 40.;
        vec2 id = floor(uv);
        uv = fract(uv)-.5;
        vec3 n = N13(id.x*107.45+id.y*3543.654);
        vec2 p = (n.xy-.5)*.7;
        float d = length(uv-p);
        float fade = Saw(.025, fract(t+n.z));
        float c = S(.3, 0., d)*fract(n.z*10.)*fade;
        return c;
      }

      vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
        float s = StaticDrops(uv, t)*l0;
        vec2 m1 = DropLayer2(uv, t)*l1;
        vec2 m2 = DropLayer2(uv*1.85, t)*l2;
        float c = s+m1.x+m2.x;
        c = S(.3, 1., c);
        return vec2(c, max(m1.y*l0, m2.y*l1));
      }

      void main(){
        vec2 fragCoord = vUv * iResolution.xy;
        vec2 uv = (fragCoord.xy-.5*iResolution.xy) / iResolution.y;
        vec2 UV = fragCoord.xy/iResolution.xy;
        vec3 M = iMouse.xyz/iResolution.xyz;
        float T = iTime;
        float t = T*.2 * max(0.0001, u_speed);
        float rainAmount = u_rain;

        float pulse = 0.0;
        if (u_pulse_amp > 0.0001) {
          pulse = sin(3.14159265 * clamp(u_pulse, 0.0, 1.0)) * u_pulse_amp;
          rainAmount = clamp(rainAmount + pulse, 0.0, 1.0);
        }

        float maxBlur = mix(3., 6., rainAmount);
        float minBlur = 2.;

        float story = 0.;
        float zoom = -cos(T*.2);
        uv *= .7+zoom*.3;
        UV = (UV-.5)*(.9+zoom*.1)+.5;
        float staticDrops = S(-.5, 1., rainAmount)*2.;
        float layer1 = S(.25, .75, rainAmount);
        float layer2 = S(.0, .5, rainAmount);
        vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
        #ifdef CHEAP_NORMALS
        vec2 n = vec2(dFdx(c.x), dFdy(c.x));
        #else
        vec2 e = vec2(.001, 0.);
        float cx = Drops(uv+e, t, staticDrops, layer1, layer2).x;
        float cy = Drops(uv+e.yx, t, staticDrops, layer1, layer2).x;
        vec2 n = vec2(cx-c.x, cy-c.x);
        #endif

        float focus = mix(maxBlur-c.y, minBlur, S(.1, .2, c.x));

        // Glass effect for light theme, sparkly for dark theme
        float dropIntensity = c.x;
        vec3 finalColor;
        float finalAlpha;

        if (u_is_light_theme > 0.5) {
          // Glass effect: refraction-like with subtle shadows and highlights
          float shadow = dropIntensity * 0.15; // Subtle shadow
          float highlight = dropIntensity * dropIntensity * 0.8; // Sharp highlight
          vec3 glassColor = u_rain_color * 0.6; // Tinted glass
          finalColor = glassColor * dropIntensity + vec3(highlight);
          finalAlpha = dropIntensity * u_rain_opacity * 1.5;
        } else {
          // Sparkly effect for dark theme
          float sparkle = pow(dropIntensity * u_rain_opacity, 1.5) * 1.2;
          finalColor = u_rain_color * sparkle;
          finalAlpha = sparkle;
        }

        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `,
  })

  const quad = new THREE.Mesh(geometry, material)
  scene.add(quad)

  // Handle resize
  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer?.setSize(w, h, false)
    if (material && material.uniforms.iResolution) {
      material.uniforms.iResolution.value.set(w, h, Math.min(window.devicePixelRatio || 1, 2))
    }
  }
  window.addEventListener('resize', onResize, { passive: true })
  onResize()

  // Animation loop
  function animate() {
    animationId = requestAnimationFrame(animate)
    const t = (performance.now() / 1000) - _startTime
    if (material && material.uniforms) {
      material.uniforms.iTime.value = t
    }
    renderer?.render(scene, camera)
  }
  animate()
})

onBeforeUnmount(() => {
  if (animationId !== null)
    cancelAnimationFrame(animationId)
  renderer?.dispose()
})
</script>

<template>
  <!-- Only render canvas on desktop (non-mobile) -->
  <canvas
    v-show="!isMobile"
    ref="canvasRef"
    class="fixed left-0 top-0 z-[-1] h-full w-full"
  />
</template>
