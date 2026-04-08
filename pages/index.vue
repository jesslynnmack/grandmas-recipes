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
        <!-- Cinnamon roll image -->
        <div class="flex justify-center mb-5 select-none">
          <img :src="'/cinnamon-roll.png'" alt="Cinnamon roll" class="w-40 h-40 object-contain drop-shadow-lg" />
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
