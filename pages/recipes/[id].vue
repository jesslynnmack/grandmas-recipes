<script setup lang="ts">
import { getTagColor } from '~/composables/useRecipes'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { recipes, loadFromStorage, deleteRecipe } = useRecipes()
const isLoaded = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

onMounted(() => {
  loadFromStorage()
  isLoaded.value = true
})

const recipe = computed(() =>
  recipes.value.find(r => r.id === (route.params.id as string))
)

const handleDelete = async () => {
  if (recipe.value) {
    deleteRecipe(recipe.value.id)
    await navigateTo('/recipes')
  }
}

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Top nav -->
    <header class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <NuxtLink
          to="/recipes"
          class="flex items-center gap-2 text-muted hover:text-ink text-sm font-sans transition-colors"
        >
          ← Back to Recipes
        </NuxtLink>
        <div v-if="recipe" class="flex items-center gap-2">
          <button @click="showEditModal = true" class="btn-secondary text-sm py-2 px-4">
            Edit
          </button>
          <button
            @click="showDeleteConfirm = true"
            class="text-sm py-2 px-4 rounded-lg border border-rust/30 text-rust hover:bg-rust hover:text-parchment transition-colors font-sans font-semibold cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </header>

    <!-- Not found state -->
    <div v-if="isLoaded && !recipe" class="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p class="text-6xl mb-6 select-none">🍽️</p>
      <h2 class="font-serif text-3xl text-ink mb-3">Recipe not found</h2>
      <p class="text-muted font-sans text-sm mb-8">This recipe may have been removed or the link is incorrect.</p>
      <NuxtLink to="/recipes" class="btn-primary">Back to Recipes</NuxtLink>
    </div>

    <!-- Recipe content -->
    <div v-else-if="recipe" class="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      <!-- Title area -->
      <div class="mb-8">

        <!-- Tags -->
        <div v-if="recipe.tags.length > 0" class="flex flex-wrap gap-1.5 mb-4">
          <span
            v-for="tag in recipe.tags"
            :key="tag"
            class="tag-pill"
            :class="getTagColor(tag)"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="font-serif text-4xl sm:text-5xl text-ink leading-tight mb-5">
          {{ recipe.title }}
        </h1>

        <!-- Time + servings bar -->
        <div
          v-if="recipe.prepTime || recipe.cookTime || recipe.servings"
          class="flex flex-wrap gap-x-8 gap-y-3 py-5 border-y border-border"
        >
          <div v-if="recipe.prepTime" class="flex flex-col">
            <span class="text-muted text-xs font-sans uppercase tracking-widest mb-1">Prep Time</span>
            <span class="font-sans font-semibold text-ink text-sm">{{ recipe.prepTime }}</span>
          </div>
          <div v-if="recipe.cookTime" class="flex flex-col">
            <span class="text-muted text-xs font-sans uppercase tracking-widest mb-1">Cook Time</span>
            <span class="font-sans font-semibold text-ink text-sm">{{ recipe.cookTime }}</span>
          </div>
          <div v-if="recipe.servings" class="flex flex-col">
            <span class="text-muted text-xs font-sans uppercase tracking-widest mb-1">Servings</span>
            <span class="font-sans font-semibold text-ink text-sm">{{ recipe.servings }}</span>
          </div>
          <div class="flex flex-col ml-auto">
            <span class="text-muted text-xs font-sans uppercase tracking-widest mb-1">Added</span>
            <span class="font-sans text-muted text-sm">{{ formatDate(recipe.createdAt) }}</span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="recipe.description" class="font-serif italic text-brown text-lg leading-relaxed mt-5">
          {{ recipe.description }}
        </p>
      </div>

      <!-- Ingredients + Instructions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">

        <!-- Ingredients -->
        <div class="md:col-span-1">
          <h2 class="font-serif text-2xl text-ink mb-5 pb-3 border-b border-border">
            Ingredients
          </h2>
          <ul class="space-y-3">
            <li
              v-for="(ingredient, i) in recipe.ingredients"
              :key="i"
              class="flex items-start gap-3 font-sans text-ink text-sm leading-relaxed"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <!-- Instructions -->
        <div class="md:col-span-2">
          <h2 class="font-serif text-2xl text-ink mb-5 pb-3 border-b border-border">
            Instructions
          </h2>
          <ol class="space-y-6">
            <li
              v-for="(step, i) in recipe.instructions"
              :key="i"
              class="flex gap-4 items-start"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-cream border border-border flex items-center justify-center font-serif text-brown font-semibold text-sm mt-0.5">
                {{ i + 1 }}
              </span>
              <p class="font-sans text-ink text-sm leading-relaxed pt-1.5">{{ step }}</p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="recipe.notes" class="bg-cream rounded-xl border border-border px-6 py-5">
        <h2 class="font-serif text-xl text-ink mb-3 flex items-center gap-2">
          <span class="text-gold">📝</span> Notes
        </h2>
        <p class="font-sans text-brown text-sm leading-relaxed italic">{{ recipe.notes }}</p>
      </div>

    </div>

    <!-- Delete confirmation dialog -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-cream rounded-2xl border border-border p-8 max-w-sm w-full shadow-xl">
          <h3 class="font-serif text-2xl text-ink mb-2">Delete Recipe?</h3>
          <p class="text-muted font-sans text-sm mb-7 leading-relaxed">
            Are you sure you want to delete <strong class="text-ink font-semibold">"{{ recipe?.title }}"</strong>?
            This cannot be undone.
          </p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button
              @click="handleDelete"
              class="flex-1 bg-rust text-parchment font-sans font-semibold py-2.5 rounded-lg hover:bg-brown transition-colors cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit modal -->
    <AddRecipeModal
      v-if="recipe"
      :recipe="recipe"
      :show="showEditModal"
      @close="showEditModal = false"
      @saved="showEditModal = false"
    />

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
