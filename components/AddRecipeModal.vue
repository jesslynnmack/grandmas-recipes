<script setup lang="ts">
import { RECIPE_TAGS, getTagColor } from '~/composables/useRecipes'
import type { Recipe } from '~/composables/useRecipes'

const props = defineProps<{
  recipe?: Recipe | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { addRecipe, updateRecipe } = useRecipes()

const isEdit = computed(() => !!props.recipe)

// Tab state — only show scan tab when adding a new recipe
const activeTab = ref<'scan' | 'manual'>('manual')

// Scan state (up to 2 photos)
const scanFiles = ref<File[]>([])
const scanPreviewUrls = ref<string[]>([])
const scanLoading = ref(false)
const scanError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const title = ref('')
const description = ref('')
const selectedTags = ref<string[]>([])
const prepTime = ref('')
const cookTime = ref('')
const servings = ref('')
const ingredients = ref<string[]>([''])
const instructions = ref<string[]>([''])
const notes = ref('')
const errors = ref<Record<string, string>>({})

const resetForm = () => {
  title.value = ''
  description.value = ''
  selectedTags.value = []
  prepTime.value = ''
  cookTime.value = ''
  servings.value = ''
  ingredients.value = ['']
  instructions.value = ['']
  notes.value = ''
  errors.value = {}
}

const resetScan = () => {
  scanFiles.value = []
  scanPreviewUrls.value = []
  scanLoading.value = false
  scanError.value = ''
}

const removePhoto = (idx: number) => {
  scanFiles.value.splice(idx, 1)
  scanPreviewUrls.value.splice(idx, 1)
}

watch(() => props.recipe, (recipe) => {
  if (recipe) {
    title.value = recipe.title
    description.value = recipe.description
    selectedTags.value = [...recipe.tags]
    prepTime.value = recipe.prepTime
    cookTime.value = recipe.cookTime
    servings.value = recipe.servings
    ingredients.value = recipe.ingredients.length ? [...recipe.ingredients] : ['']
    instructions.value = recipe.instructions.length ? [...recipe.instructions] : ['']
    notes.value = recipe.notes
    errors.value = {}
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    if (!isEdit.value) activeTab.value = 'scan'
  } else {
    document.body.style.overflow = ''
    resetScan()
    activeTab.value = 'manual'
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

const addIngredient = () => ingredients.value.push('')
const removeIngredient = (idx: number) => {
  if (ingredients.value.length > 1) ingredients.value.splice(idx, 1)
}

const addInstruction = () => instructions.value.push('')
const removeInstruction = (idx: number) => {
  if (instructions.value.length > 1) instructions.value.splice(idx, 1)
}

const validate = (): boolean => {
  errors.value = {}
  if (!title.value.trim()) errors.value.title = 'Recipe name is required'
  if (ingredients.value.every(i => !i.trim())) errors.value.ingredients = 'Add at least one ingredient'
  if (instructions.value.every(i => !i.trim())) errors.value.instructions = 'Add at least one instruction'
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  const data = {
    title: title.value.trim(),
    description: description.value.trim(),
    tags: selectedTags.value,
    prepTime: prepTime.value.trim(),
    cookTime: cookTime.value.trim(),
    servings: servings.value.trim(),
    ingredients: ingredients.value.filter(i => i.trim()),
    instructions: instructions.value.filter(i => i.trim()),
    notes: notes.value.trim(),
  }

  if (isEdit.value && props.recipe) {
    updateRecipe(props.recipe.id, data)
  } else {
    addRecipe(data)
  }

  emit('saved')
  if (!isEdit.value) resetForm()
}

const handleClose = () => {
  emit('close')
  if (!isEdit.value) resetForm()
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) handleClose()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') handleClose()
}

// Scan photo handlers
const addFiles = (files: FileList | File[]) => {
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    if (scanFiles.value.length >= 2) break
    scanFiles.value.push(file)
    scanPreviewUrls.value.push(URL.createObjectURL(file))
  }
  scanError.value = ''
}

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
  // Reset input so same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const handleScan = async () => {
  if (!scanFiles.value.length) return
  scanLoading.value = true
  scanError.value = ''

  try {
    const images = await Promise.all(
      scanFiles.value.map(async (file) => ({
        imageBase64: await toBase64(file),
        mediaType: file.type,
      }))
    )

    const result = await $fetch('/api/scan-recipe', {
      method: 'POST',
      body: { images },
    }) as any

    title.value = result.title || ''
    description.value = result.description || ''
    prepTime.value = result.prepTime || ''
    cookTime.value = result.cookTime || ''
    servings.value = result.servings || ''
    ingredients.value = result.ingredients?.length ? result.ingredients : ['']
    instructions.value = result.instructions?.length ? result.instructions : ['']
    notes.value = result.notes || ''
    errors.value = {}

    activeTab.value = 'manual'
  } catch (err: any) {
    scanError.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    scanLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 bg-ink/60 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div class="bg-parchment rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-auto">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <h2 class="font-serif text-2xl text-ink">
              {{ isEdit ? 'Edit Recipe' : 'Add a New Recipe' }}
            </h2>
            <button
              @click="handleClose"
              class="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-soft transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <!-- Tabs (only shown when adding new) -->
          <div v-if="!isEdit" class="flex border-b border-border">
            <button
              type="button"
              @click="activeTab = 'scan'"
              class="flex-1 py-3 text-sm font-sans font-semibold transition-colors"
              :class="activeTab === 'scan'
                ? 'text-rust border-b-2 border-rust -mb-px'
                : 'text-muted hover:text-ink'"
            >
              📷 Scan a Photo
            </button>
            <button
              type="button"
              @click="activeTab = 'manual'"
              class="flex-1 py-3 text-sm font-sans font-semibold transition-colors"
              :class="activeTab === 'manual'
                ? 'text-rust border-b-2 border-rust -mb-px'
                : 'text-muted hover:text-ink'"
            >
              ✏️ Enter Manually
            </button>
          </div>

          <!-- Scan tab -->
          <div v-if="!isEdit && activeTab === 'scan'" class="px-6 py-6 space-y-4">

            <!-- Photo slots -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Existing photos -->
              <div
                v-for="(url, idx) in scanPreviewUrls"
                :key="idx"
                class="relative rounded-xl overflow-hidden border border-border aspect-[4/3] bg-soft"
              >
                <img :src="url" :alt="`Photo ${idx + 1}`" class="w-full h-full object-contain" />
                <button
                  type="button"
                  @click="removePhoto(idx)"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center text-base hover:bg-ink transition-colors"
                >
                  ×
                </button>
                <span class="absolute bottom-2 left-2 text-xs font-sans font-semibold bg-ink/60 text-white rounded px-1.5 py-0.5">
                  {{ idx === 0 ? 'Front' : 'Back' }}
                </span>
              </div>

              <!-- Add photo slot (shown when < 2 photos) -->
              <div
                v-if="scanPreviewUrls.length < 2"
                class="border-2 border-dashed border-border rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-cream/40 transition-colors"
                @click="fileInputRef?.click()"
                @dragover.prevent
                @drop="onDrop"
              >
                <p class="text-3xl mb-1 select-none">📸</p>
                <p class="font-sans font-semibold text-ink text-xs text-center px-2">
                  {{ scanPreviewUrls.length === 0 ? 'Add photo' : 'Add back side' }}
                </p>
                <p class="font-sans text-muted text-xs mt-0.5">or drag & drop</p>
              </div>
            </div>

            <!-- Empty state hint when no photos yet -->
            <p v-if="scanPreviewUrls.length === 0" class="text-center text-muted text-xs font-sans">
              Upload 1–2 photos (front & back of a recipe card)
            </p>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />

            <p v-if="scanError" class="text-rust text-sm font-sans text-center">{{ scanError }}</p>

            <button
              type="button"
              @click="handleScan"
              :disabled="scanLoading || scanPreviewUrls.length === 0"
              class="btn-primary w-full justify-center"
            >
              <span v-if="scanLoading" class="inline-block w-4 h-4 border-2 border-parchment/40 border-t-parchment rounded-full animate-spin mr-1"></span>
              <span v-else class="mr-1">✨</span>
              {{ scanLoading ? 'Scanning recipe…' : 'Scan Recipe' }}
            </button>
          </div>

          <!-- Form -->
          <form v-if="isEdit || activeTab === 'manual'" @submit.prevent="handleSubmit" class="px-6 py-6 space-y-7">

            <!-- Basic Info -->
            <div class="space-y-4">
              <div class="section-heading"><h3>Basic Info</h3></div>

              <div>
                <label class="block text-xs font-sans font-semibold text-brown uppercase tracking-widest mb-1.5">
                  Recipe Name <span class="text-rust">*</span>
                </label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="e.g. Grandma's Famous Peach Cobbler"
                  class="input-field"
                  :class="errors.title ? 'border-rust focus:ring-rust/30' : ''"
                />
                <p v-if="errors.title" class="text-rust text-xs font-sans mt-1">{{ errors.title }}</p>
              </div>

              <div>
                <label class="block text-xs font-sans font-semibold text-brown uppercase tracking-widest mb-1.5">
                  Description
                </label>
                <textarea
                  v-model="description"
                  rows="2"
                  placeholder="A brief description of the recipe..."
                  class="input-field resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <div class="section-heading"><h3>Tags</h3></div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in RECIPE_TAGS"
                  :key="tag"
                  type="button"
                  @click="toggleTag(tag)"
                  class="tag-pill cursor-pointer transition-all duration-150 border"
                  :class="selectedTags.includes(tag)
                    ? 'bg-rust text-parchment border-rust'
                    : 'bg-soft text-brown border-border hover:border-gold hover:bg-cream'"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Details -->
            <div>
              <div class="section-heading"><h3>Details</h3></div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-sans font-semibold text-brown uppercase tracking-widest mb-1.5">Prep Time</label>
                  <input v-model="prepTime" type="text" placeholder="20 minutes" class="input-field" />
                </div>
                <div>
                  <label class="block text-xs font-sans font-semibold text-brown uppercase tracking-widest mb-1.5">Cook Time</label>
                  <input v-model="cookTime" type="text" placeholder="45 minutes" class="input-field" />
                </div>
                <div>
                  <label class="block text-xs font-sans font-semibold text-brown uppercase tracking-widest mb-1.5">Servings</label>
                  <input v-model="servings" type="text" placeholder="8 servings" class="input-field" />
                </div>
              </div>
            </div>

            <!-- Ingredients -->
            <div>
              <div class="section-heading"><h3>Ingredients <span class="text-rust text-sm">*</span></h3></div>
              <div class="space-y-2">
                <div v-for="(_, idx) in ingredients" :key="idx" class="flex gap-2">
                  <input
                    v-model="ingredients[idx]"
                    type="text"
                    :placeholder="`e.g. 2 cups all-purpose flour`"
                    class="input-field flex-1"
                    :class="errors.ingredients ? 'border-rust/60' : ''"
                  />
                  <button
                    type="button"
                    @click="removeIngredient(idx)"
                    :disabled="ingredients.length === 1"
                    class="w-9 h-10 flex items-center justify-center text-muted hover:text-rust transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p v-if="errors.ingredients" class="text-rust text-xs font-sans mt-1">{{ errors.ingredients }}</p>
              <button
                type="button"
                @click="addIngredient"
                class="mt-3 text-sm font-sans font-semibold text-brown hover:text-rust transition-colors flex items-center gap-1.5"
              >
                <span class="text-base leading-none">+</span> Add Ingredient
              </button>
            </div>

            <!-- Instructions -->
            <div>
              <div class="section-heading"><h3>Instructions <span class="text-rust text-sm">*</span></h3></div>
              <div class="space-y-2">
                <div v-for="(_, idx) in instructions" :key="idx" class="flex gap-2 items-start">
                  <span class="w-7 h-10 flex items-center justify-center font-serif text-sm text-gold font-semibold flex-shrink-0">
                    {{ idx + 1 }}.
                  </span>
                  <textarea
                    v-model="instructions[idx]"
                    rows="2"
                    :placeholder="`Step ${idx + 1}...`"
                    class="input-field flex-1 resize-none"
                    :class="errors.instructions ? 'border-rust/60' : ''"
                  ></textarea>
                  <button
                    type="button"
                    @click="removeInstruction(idx)"
                    :disabled="instructions.length === 1"
                    class="w-9 h-10 flex items-center justify-center text-muted hover:text-rust transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p v-if="errors.instructions" class="text-rust text-xs font-sans mt-1">{{ errors.instructions }}</p>
              <button
                type="button"
                @click="addInstruction"
                class="mt-3 text-sm font-sans font-semibold text-brown hover:text-rust transition-colors flex items-center gap-1.5"
              >
                <span class="text-base leading-none">+</span> Add Step
              </button>
            </div>

            <!-- Notes -->
            <div>
              <div class="section-heading"><h3>Notes</h3></div>
              <textarea
                v-model="notes"
                rows="3"
                placeholder="Any tips, variations, or memories to share with the family..."
                class="input-field resize-none"
              ></textarea>
            </div>

            <!-- Footer buttons -->
            <div class="flex gap-3 pt-2 border-t border-border">
              <button type="button" @click="handleClose" class="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" class="btn-primary flex-1 justify-center">
                {{ isEdit ? 'Save Changes' : 'Save Recipe' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-parchment,
.modal-leave-active .bg-parchment {
  transition: transform 0.2s ease;
}
.modal-enter-from .bg-parchment {
  transform: translateY(12px);
}
</style>
