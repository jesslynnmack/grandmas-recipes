export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  tags: string[]
  servings: string
  prepTime: string
  cookTime: string
  notes: string
  createdAt: number
  scanPhotoUrl?: string
}

const STORAGE_KEY = 'grandmas-recipes-data'

export const RECIPE_TAGS = [
  'Appetizers',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Soups & Stews',
  'Salads',
  'Side Dishes',
  'Breads & Baking',
  'Cookies & Bars',
  'Cakes & Pies',
  'Drinks & Beverages',
  'Snacks',
  'Holiday & Special',
  'Comfort Food',
  'Quick & Easy',
  'Italian',
  'Casseroles',
  'Preserves & Jams',
  'Grilling',
]

const TAG_COLORS: Record<string, string> = {
  'Appetizers': 'bg-amber-100 text-amber-800',
  'Breakfast': 'bg-orange-100 text-orange-800',
  'Lunch': 'bg-yellow-100 text-yellow-800',
  'Dinner': 'bg-red-100 text-red-800',
  'Desserts': 'bg-pink-100 text-pink-800',
  'Soups & Stews': 'bg-orange-100 text-orange-900',
  'Salads': 'bg-green-100 text-green-800',
  'Side Dishes': 'bg-lime-100 text-lime-800',
  'Breads & Baking': 'bg-amber-100 text-amber-900',
  'Cookies & Bars': 'bg-rose-100 text-rose-800',
  'Cakes & Pies': 'bg-fuchsia-100 text-fuchsia-800',
  'Drinks & Beverages': 'bg-sky-100 text-sky-800',
  'Snacks': 'bg-yellow-100 text-yellow-900',
  'Holiday & Special': 'bg-red-100 text-red-900',
  'Comfort Food': 'bg-orange-100 text-orange-800',
  'Quick & Easy': 'bg-teal-100 text-teal-800',
  'Italian': 'bg-green-100 text-green-900',
  'Casseroles': 'bg-amber-100 text-amber-800',
  'Preserves & Jams': 'bg-purple-100 text-purple-800',
  'Grilling': 'bg-red-100 text-red-800',
}

export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag] || 'bg-stone-100 text-stone-700'
}

export const useRecipes = () => {
  const recipes = useState<Recipe[]>('recipes', () => [])

  const loadFromStorage = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      recipes.value = stored ? JSON.parse(stored) : []
    }
  }

  const saveToStorage = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes.value))
    }
  }

  const addRecipe = (data: Omit<Recipe, 'id' | 'createdAt'>): Recipe => {
    const recipe: Recipe = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }
    recipes.value = [...recipes.value, recipe]
    saveToStorage()
    return recipe
  }

  const updateRecipe = (id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => {
    recipes.value = recipes.value.map(r => r.id === id ? { ...r, ...data } : r)
    saveToStorage()
  }

  const deleteRecipe = (id: string) => {
    recipes.value = recipes.value.filter(r => r.id !== id)
    saveToStorage()
  }

  const getRecipe = (id: string): Recipe | undefined => {
    return recipes.value.find(r => r.id === id)
  }

  return { recipes, loadFromStorage, addRecipe, updateRecipe, deleteRecipe, getRecipe }
}
