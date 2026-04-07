export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    const isAuth = localStorage.getItem('grandmas-recipes-auth')
    if (!isAuth) {
      return navigateTo('/')
    }
  }
})
