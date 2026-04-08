<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <NuxtPage />
  <ClientOnly>
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 bg-ink text-parchment rounded-2xl px-5 py-3.5 shadow-xl font-sans text-sm font-semibold pointer-events-auto max-w-xs whitespace-nowrap"
        >
          <img :src="'/grandma.png'" alt="Grandma" class="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white/20" />
          <span>{{ toast.emoji }} {{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </ClientOnly>
</template>
