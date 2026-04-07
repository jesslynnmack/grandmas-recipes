<script setup lang="ts">
import type { Recipe } from '~/composables/useRecipes'
import { getTagColor } from '~/composables/useRecipes'

defineProps<{ recipe: Recipe }>()
</script>

<template>
  <NuxtLink :to="`/recipes/${recipe.id}`" class="block group h-full">
    <div class="bg-cream rounded-xl border border-border p-5 h-full flex flex-col hover:shadow-md hover:border-gold/50 hover:-translate-y-0.5 transition-all duration-200">

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
        <span
          v-for="tag in recipe.tags.slice(0, 3)"
          :key="tag"
          class="tag-pill"
          :class="getTagColor(tag)"
        >
          {{ tag }}
        </span>
        <span v-if="recipe.tags.length > 3" class="tag-pill bg-soft text-muted">
          +{{ recipe.tags.length - 3 }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-serif text-xl text-ink mb-2 leading-snug group-hover:text-rust transition-colors">
        {{ recipe.title }}
      </h3>

      <!-- Description -->
      <p v-if="recipe.description" class="text-muted font-sans text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
        {{ recipe.description }}
      </p>
      <div v-else class="flex-1"></div>

      <!-- Meta row -->
      <div
        v-if="recipe.prepTime || recipe.cookTime || recipe.servings"
        class="flex flex-wrap items-center gap-4 pt-3 border-t border-border/60 text-muted text-xs font-sans"
      >
        <span v-if="recipe.prepTime" class="flex items-center gap-1.5">
          <span class="text-sm">⏱</span> {{ recipe.prepTime }}
        </span>
        <span v-if="recipe.cookTime" class="flex items-center gap-1.5">
          <span class="text-sm">🔥</span> {{ recipe.cookTime }}
        </span>
        <span v-if="recipe.servings" class="flex items-center gap-1.5">
          <span class="text-sm">👥</span> {{ recipe.servings }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
