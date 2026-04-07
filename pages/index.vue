<script setup lang="ts">
onMounted(() => {
  if (localStorage.getItem('grandmas-recipes-auth')) {
    navigateTo('/recipes')
  }
})

const password = ref('')
const error = ref('')

const handleSubmit = async () => {
  if (password.value === 'morgan') {
    localStorage.setItem('grandmas-recipes-auth', 'true')
    await navigateTo('/recipes')
  } else {
    error.value = 'That\'s not quite right — try again!'
    password.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-parchment flex flex-col items-center justify-center p-6 relative overflow-hidden">

    <!-- Decorative background flourishes -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.04]">
      <span class="absolute font-serif text-[200px] text-ink leading-none" style="top: -2%; left: -3%">❧</span>
      <span class="absolute font-serif text-[160px] text-ink leading-none" style="bottom: -4%; right: -2%">❧</span>
      <span class="absolute font-serif text-[80px] text-ink leading-none" style="top: 15%; right: 8%">✦</span>
      <span class="absolute font-serif text-[60px] text-ink leading-none" style="bottom: 20%; left: 8%">✦</span>
    </div>

    <div class="relative z-10 w-full max-w-sm">

      <!-- Header -->
      <div class="text-center mb-10">
        <!-- Cinnamon roll SVG - top down view -->
        <div class="flex justify-center mb-5 select-none">
          <svg viewBox="0 0 120 120" class="w-32 h-32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g1" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#D08848"/><stop offset="100%" stop-color="#B86A28"/>
              </radialGradient>
              <radialGradient id="g2" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#F4BE80"/><stop offset="100%" stop-color="#E0A058"/>
              </radialGradient>
              <radialGradient id="g3" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#C06820"/><stop offset="100%" stop-color="#A04E10"/>
              </radialGradient>
              <radialGradient id="g4" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#F2B870"/><stop offset="100%" stop-color="#DA9848"/>
              </radialGradient>
              <radialGradient id="g5" cx="36%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#A85020"/><stop offset="100%" stop-color="#883A0C"/>
              </radialGradient>
            </defs>

            <!-- Shadow -->
            <ellipse cx="60" cy="112" rx="40" ry="7" fill="rgba(0,0,0,0.14)"/>

            <!-- Rings with gradient texture -->
            <circle cx="60" cy="57" r="46" fill="url(#g1)"/>
            <circle cx="60" cy="57" r="39" fill="url(#g2)"/>
            <circle cx="60" cy="57" r="31" fill="url(#g3)"/>
            <circle cx="60" cy="57" r="23" fill="url(#g4)"/>
            <circle cx="60" cy="57" r="15" fill="url(#g5)"/>
            <circle cx="60" cy="57" r="7"  fill="url(#g4)"/>

            <!-- Icing drip streams radiating outward from center -->
            <!-- Drip toward top-right -->
            <path d="M 72 43 C 78 37 87 34 90 39 C 93 44 88 50 81 50 C 76 50 72 47 72 43 Z" fill="white" opacity="0.88"/>
            <!-- Drip toward right -->
            <path d="M 81 55 C 87 51 96 52 97 58 C 98 64 91 67 85 65 C 80 63 79 58 81 55 Z" fill="white" opacity="0.85"/>
            <!-- Drip toward bottom-left -->
            <path d="M 47 70 C 41 75 33 76 31 71 C 29 66 35 61 42 62 C 47 63 49 68 47 70 Z" fill="white" opacity="0.87"/>
            <!-- Drip toward bottom -->
            <path d="M 62 79 C 64 86 61 94 57 94 C 53 94 51 86 54 79 C 56 75 61 76 62 79 Z" fill="white" opacity="0.84"/>
            <!-- Drip toward top-left (shorter) -->
            <path d="M 47 42 C 43 36 37 35 35 40 C 33 45 38 50 44 49 C 48 48 49 44 47 42 Z" fill="white" opacity="0.80"/>

            <!-- Main icing glob covering center -->
            <path d="M 64 37 C 76 35 85 44 85 57 C 85 70 75 80 62 80 C 49 80 39 70 39 57 C 39 45 51 38 64 37 Z" fill="white"/>
            <!-- Inner highlight for 3D depth -->
            <path d="M 64 37 C 72 36 80 43 80 54 C 80 66 73 75 63 76 C 52 77 44 69 44 59 C 44 48 53 39 64 37 Z" fill="white" opacity="0.4"/>
            <!-- Sheen spot -->
            <ellipse cx="53" cy="49" rx="8" ry="6" fill="white" opacity="0.45"/>
          </svg>
        </div>
        <h1 class="font-serif text-5xl text-ink leading-tight">Grandma's</h1>
        <h2 class="font-serif text-4xl text-rust italic mb-5">Recipes</h2>
        <div class="flex items-center justify-center gap-3">
          <div class="h-px w-14 bg-gold"></div>
          <span class="text-muted font-sans text-xs tracking-[0.2em] uppercase">A Family Collection</span>
          <div class="h-px w-14 bg-gold"></div>
        </div>
      </div>

      <!-- Card -->
      <div class="bg-cream rounded-2xl shadow-sm border border-border px-8 py-8">
        <p class="text-center text-brown font-sans text-sm leading-relaxed mb-6">
          This recipe book holds our family's most treasured recipes.
          Enter the family password to open it.
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <input
            v-model="password"
            type="password"
            placeholder="Family password"
            autocomplete="current-password"
            class="input-field text-center text-base tracking-[0.15em]"
            autofocus
          />

          <Transition name="fade">
            <p v-if="error" class="text-rust text-sm text-center font-sans">{{ error }}</p>
          </Transition>

          <button type="submit" class="btn-primary w-full justify-center text-base py-3">
            Open Recipe Book
          </button>
        </form>
      </div>

      <p class="text-center text-muted text-xs font-sans mt-8 tracking-wide">
        Made with love for the family &hearts;
      </p>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
