<script setup lang="ts">
import { RECIPE_TAGS } from '~/composables/useRecipes'

definePageMeta({ middleware: 'auth' })

const { recipes, loadFromStorage } = useRecipes()

const showAddModal = ref(false)
const editingRecipe = ref(null)
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const sortBy = ref('newest')

onMounted(() => {
  loadFromStorage()
})

const filteredRecipes = computed(() => {
  let result = [...recipes.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q)) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  if (selectedTags.value.length > 0) {
    result = result.filter(r =>
      selectedTags.value.some(t => r.tags.includes(t))
    )
  }

  switch (sortBy.value) {
    case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break
    case 'az': result.sort((a, b) => a.title.localeCompare(b.title)); break
    case 'za': result.sort((a, b) => b.title.localeCompare(a.title)); break
    default: result.sort((a, b) => b.createdAt - a.createdAt)
  }

  return result
})

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || selectedTags.value.length > 0 || sortBy.value !== 'newest'
)

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTags.value = []
  sortBy.value = 'newest'
}

const handleLogout = () => {
  localStorage.removeItem('grandmas-recipes-auth')
  navigateTo('/')
}

const openAddModal = () => {
  editingRecipe.value = null
  showAddModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Sticky header -->
    <header class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="font-serif text-2xl sm:text-3xl text-ink leading-tight">Grandma's Recipe Book</h1>
          <p class="text-muted text-xs font-sans mt-0.5 hidden sm:block">
            {{ recipes.length }} {{ recipes.length === 1 ? 'recipe' : 'recipes' }} in the collection
          </p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <button @click="openAddModal" class="btn-primary text-sm">
            <span class="text-base leading-none">+</span>
            <span class="hidden sm:inline">Add Recipe</span>
          </button>
          <button
            @click="handleLogout"
            class="text-muted hover:text-ink text-sm font-sans transition-colors px-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <!-- Search + Sort -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-3">
      <div class="flex gap-3">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search recipes, ingredients..."
            class="input-field pl-10"
          />
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm select-none">🔍</span>
        </div>
        <select v-model="sortBy" class="input-field w-auto min-w-[130px] cursor-pointer">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A – Z</option>
          <option value="za">Z – A</option>
        </select>
      </div>
    </div>

    <!-- Tag filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
      <div class="flex gap-2 overflow-x-auto pb-1" style="-webkit-overflow-scrolling: touch; scrollbar-width: none;">
        <button
          @click="selectedTags = []"
          class="tag-pill cursor-pointer transition-all whitespace-nowrap flex-shrink-0 border"
          :class="selectedTags.length === 0
            ? 'bg-rust text-parchment border-rust'
            : 'bg-soft text-brown border-border hover:bg-cream'"
        >
          All Recipes
        </button>
        <button
          v-for="tag in RECIPE_TAGS"
          :key="tag"
          @click="toggleTag(tag)"
          class="tag-pill cursor-pointer transition-all whitespace-nowrap flex-shrink-0 border"
          :class="selectedTags.includes(tag)
            ? 'bg-rust text-parchment border-rust'
            : 'bg-soft text-brown border-border hover:bg-cream'"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Active filters info -->
    <div v-if="hasActiveFilters" class="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
      <div class="flex items-center justify-between">
        <p class="text-muted text-sm font-sans">
          {{ filteredRecipes.length }} {{ filteredRecipes.length === 1 ? 'recipe' : 'recipes' }} found
        </p>
        <button @click="clearFilters" class="text-rust text-sm font-sans hover:text-brown transition-colors underline underline-offset-2">
          Clear filters
        </button>
      </div>
    </div>

    <!-- Recipe grid -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 pb-14">

      <!-- Results -->
      <div v-if="filteredRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <RecipeCard
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>

      <!-- No search results (but recipes exist) -->
      <div v-else-if="recipes.length > 0" class="text-center py-24">
        <p class="text-5xl mb-5 select-none">🔍</p>
        <h3 class="font-serif text-2xl text-ink mb-2">No recipes found</h3>
        <p class="text-muted font-sans text-sm mb-7">Try a different search term or adjust the filters</p>
        <button @click="clearFilters" class="btn-secondary">Clear filters</button>
      </div>

      <!-- Empty state (no recipes yet) -->
      <div v-else class="text-center py-24">
        <p class="text-7xl mb-6 select-none">📖</p>
        <h3 class="font-serif text-3xl text-ink mb-3">The recipe book is empty</h3>
        <p class="text-muted font-sans text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Start adding Grandma's recipes to preserve them for the whole family to enjoy for generations to come
        </p>
        <button @click="openAddModal" class="btn-primary">
          <span class="text-base leading-none">+</span> Add the First Recipe
        </button>
      </div>
    </main>

    <!-- Add recipe modal -->
    <AddRecipeModal
      :recipe="editingRecipe"
      :show="showAddModal"
      @close="showAddModal = false"
      @saved="showAddModal = false"
    />
  </div>
</template>
