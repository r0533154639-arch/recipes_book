export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  source: string;
  externalUrl?: string;
  imageUrl?: string;
  notes?: string;
  isShortcut?: boolean;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientText: string;
  order: number;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  instructionText: string;
  stepNumber: number;
}

export interface RecipePermission {
  id: string;
  recipeId: string;
  userId: string;
  accessLevel: 'viewer' | 'editor' | 'owner';
}

export type SortOption = 'alpha-asc' | 'alpha-desc' | 'newest' | 'oldest';
export type FilterType = 'all' | 'full' | 'shortcuts';

export interface FullRecipeData extends Recipe {
  categoryName?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  permissions?: RecipePermission[];
}
