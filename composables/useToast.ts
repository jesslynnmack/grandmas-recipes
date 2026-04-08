interface Toast {
  id: string
  message: string
  emoji: string
  type: 'success' | 'error'
}

// Plain Vue ref — no Nuxt context needed, safe in SSR
const toasts = ref<Toast[]>([])

export const useToast = () => {
  const show = (message: string, emoji = '💕', type: 'success' | 'error' = 'success') => {
    if (!import.meta.client) return
    const id = Math.random().toString(36).slice(2)
    toasts.value = [...toasts.value, { id, message, emoji, type }]
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3500)
  }
  return { toasts, show }
}
