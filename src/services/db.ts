import {
  Category,
  FullRecipeData,
  Recipe,
  RecipeIngredient,
  RecipePermission,
  RecipeStep,
  SortOption,
  User,
} from '../types/models';
import { getSeedDataForUser, INITIAL_USERS } from './sampleData';

const STORAGE_KEYS = {
  USERS: 'velvet_db_users',
  CATEGORIES: 'velvet_db_categories',
  RECIPES: 'velvet_db_recipes',
  INGREDIENTS: 'velvet_db_ingredients',
  STEPS: 'velvet_db_steps',
  PERMISSIONS: 'velvet_db_permissions',
  ACTIVE_USER_ID: 'velvet_active_user_id',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeToDatabase(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

// Database initialisation
export function initializeDatabase(): void {
  let users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    users = INITIAL_USERS;
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  // Check if initial users have categories & recipes seeded
  let categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  let recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  let ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  let steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);
  let permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);

  // Seed for Chef Gordon if empty
  const gordonId = INITIAL_USERS[0].id;
  const hasGordonData = recipes.some((r) => r.userId === gordonId);
  if (!hasGordonData) {
    const gordonSeed = getSeedDataForUser(gordonId);
    categories = [...categories, ...gordonSeed.categories];
    recipes = [...recipes, ...gordonSeed.recipes];
    ingredients = [...ingredients, ...gordonSeed.ingredients];
    steps = [...steps, ...gordonSeed.steps];

    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    saveToStorage(STORAGE_KEYS.RECIPES, recipes);
    saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
    saveToStorage(STORAGE_KEYS.STEPS, steps);
    saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
  }

  // Set default active user if none
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, gordonId);
  }
}

// ================= USER OPERATIONS =================
export function getAllUsers(): User[] {
  return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

export function createOrUpdateUser(user: User): User {
  const users = getAllUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
    // Seed new user with starting categories
    const seed = getSeedDataForUser(user.id);
    const existingCats = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const existingRecs = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
    const existingIngs = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
    const existingStps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);

    saveToStorage(STORAGE_KEYS.CATEGORIES, [...existingCats, ...seed.categories]);
    saveToStorage(STORAGE_KEYS.RECIPES, [...existingRecs, ...seed.recipes.slice(0, 3)]);
    saveToStorage(STORAGE_KEYS.INGREDIENTS, [...existingIngs, ...seed.ingredients.filter(i => seed.recipes.slice(0, 3).some(r => r.id === i.recipeId))]);
    saveToStorage(STORAGE_KEYS.STEPS, [...existingStps, ...seed.steps.filter(s => seed.recipes.slice(0, 3).some(r => r.id === s.recipeId))]);
  }
  saveToStorage(STORAGE_KEYS.USERS, users);
  notifyListeners();
  return user;
}

export function getActiveUserId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || INITIAL_USERS[0].id;
}

export function setActiveUserId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  notifyListeners();
}

// ================= CATEGORY OPERATIONS =================
export function getCategories(userId: string): Category[] {
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  return categories.filter((c) => c.userId === userId).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoryById(id: string): Category | undefined {
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  return categories.find((c) => c.id === id);
}

export function createCategory(userId: string, name: string, color?: string): Category {
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const newCategory: Category = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    name: name.trim(),
    color: color || '#10b981',
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  notifyListeners();
  return newCategory;
}

export function updateCategory(id: string, name: string, color?: string): Category | null {
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  categories[index] = {
    ...categories[index],
    name: name.trim(),
    ...(color ? { color } : {}),
  };
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  notifyListeners();
  return categories[index];
}

export function deleteCategory(id: string, reassignCategoryId?: string): boolean {
  let categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const exists = categories.some((c) => c.id === id);
  if (!exists) return false;

  categories = categories.filter((c) => c.id !== id);
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

  // Handle associated recipes
  let recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  if (reassignCategoryId) {
    recipes = recipes.map((r) => (r.categoryId === id ? { ...r, categoryId: reassignCategoryId } : r));
    saveToStorage(STORAGE_KEYS.RECIPES, recipes);
  } else {
    // Cascade delete recipes assigned to this category
    const recipeIdsToDelete = recipes.filter((r) => r.categoryId === id).map((r) => r.id);
    recipeIdsToDelete.forEach((recId) => deleteRecipe(recId, false));
  }

  notifyListeners();
  return true;
}

// ================= RECIPE OPERATIONS =================
export function getRecipes(
  userId: string,
  categoryId?: string | null,
  sort: SortOption = 'alpha-asc',
  searchQuery?: string,
  isShortcutFilter?: boolean | null
): FullRecipeData[] {
  const recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  const steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);
  const permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);

  // Filter recipes owned by user OR shared with user
  const userRecipePermissions = permissions.filter((p) => p.userId === userId);
  const sharedRecipeIds = new Set(userRecipePermissions.map((p) => p.recipeId));

  let filtered = recipes.filter((r) => r.userId === userId || sharedRecipeIds.has(r.id));

  // Category filter
  if (categoryId) {
    filtered = filtered.filter((r) => r.categoryId === categoryId);
  }

  // Shortcut vs Full filter
  if (isShortcutFilter !== null && isShortcutFilter !== undefined) {
    filtered = filtered.filter((r) => !!r.isShortcut === isShortcutFilter);
  }

  // Real-time search query across Title, Source, Notes, AND Ingredients
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((r) => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchSource = r.source?.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);
      const matchIngredients = ingredients
        .filter((ing) => ing.recipeId === r.id)
        .some((ing) => ing.ingredientText.toLowerCase().includes(q));
      return matchTitle || matchSource || matchNotes || matchIngredients;
    });
  }

  // Build FullRecipeData map
  const fullRecipes: FullRecipeData[] = filtered.map((r) => {
    const cat = categories.find((c) => c.id === r.categoryId);
    const recIngredients = ingredients
      .filter((ing) => ing.recipeId === r.id)
      .sort((a, b) => a.order - b.order);
    const recSteps = steps
      .filter((s) => s.recipeId === r.id)
      .sort((a, b) => a.stepNumber - b.stepNumber);
    const recPerms = permissions.filter((p) => p.recipeId === r.id);

    return {
      ...r,
      categoryName: cat?.name || 'Uncategorized',
      ingredients: recIngredients,
      steps: recSteps,
      permissions: recPerms,
    };
  });

  // Sorting
  fullRecipes.sort((a, b) => {
    if (sort === 'alpha-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sort === 'alpha-desc') {
      return b.title.localeCompare(a.title);
    }
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  return fullRecipes;
}

export function getRecipeById(id: string): FullRecipeData | null {
  const recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return null;

  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  const steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);
  const permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);

  const cat = categories.find((c) => c.id === recipe.categoryId);
  const recIngredients = ingredients
    .filter((ing) => ing.recipeId === recipe.id)
    .sort((a, b) => a.order - b.order);
  const recSteps = steps
    .filter((s) => s.recipeId === recipe.id)
    .sort((a, b) => a.stepNumber - b.stepNumber);
  const recPerms = permissions.filter((p) => p.recipeId === recipe.id);

  return {
    ...recipe,
    categoryName: cat?.name || 'Uncategorized',
    ingredients: recIngredients,
    steps: recSteps,
    permissions: recPerms,
  };
}

export interface SaveRecipeInput {
  id?: string;
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
  ingredients: { text: string }[];
  steps: { text: string }[];
}

export function saveRecipe(input: SaveRecipeInput): FullRecipeData {
  const recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  let ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  let steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);

  const recipeId = input.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const recipePayload: Recipe = {
    id: recipeId,
    userId: input.userId,
    categoryId: input.categoryId,
    title: input.title.trim(),
    source: input.source.trim() || 'Personal Kitchen',
    externalUrl: input.externalUrl?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    isShortcut: !!input.isShortcut,
    prepTimeMinutes: input.prepTimeMinutes,
    cookTimeMinutes: input.cookTimeMinutes,
    servings: input.servings,
    createdAt: input.id ? (recipes.find((r) => r.id === input.id)?.createdAt || now) : now,
    updatedAt: now,
  };

  const existingIndex = recipes.findIndex((r) => r.id === recipeId);
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipePayload;
  } else {
    recipes.unshift(recipePayload);
  }
  saveToStorage(STORAGE_KEYS.RECIPES, recipes);

  // Replace ingredients for this recipe
  ingredients = ingredients.filter((ing) => ing.recipeId !== recipeId);
  if (!input.isShortcut && input.ingredients) {
    const newIngredients: RecipeIngredient[] = input.ingredients
      .filter((i) => i.text.trim() !== '')
      .map((i, index) => ({
        id: `ing_${recipeId}_${index + 1}_${Math.random().toString(36).substr(2, 4)}`,
        recipeId,
        ingredientText: i.text.trim(),
        order: index + 1,
      }));
    ingredients = [...ingredients, ...newIngredients];
  }
  saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);

  // Replace steps for this recipe
  steps = steps.filter((s) => s.recipeId !== recipeId);
  if (!input.isShortcut && input.steps) {
    const newSteps: RecipeStep[] = input.steps
      .filter((s) => s.text.trim() !== '')
      .map((s, index) => ({
        id: `stp_${recipeId}_${index + 1}_${Math.random().toString(36).substr(2, 4)}`,
        recipeId,
        instructionText: s.text.trim(),
        stepNumber: index + 1,
      }));
    steps = [...steps, ...newSteps];
  }
  saveToStorage(STORAGE_KEYS.STEPS, steps);

  notifyListeners();
  return getRecipeById(recipeId)!;
}

export function deleteRecipe(recipeId: string, shouldNotify: boolean = true): boolean {
  let recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  let ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  let steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);
  let permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);

  recipes = recipes.filter((r) => r.id !== recipeId);
  ingredients = ingredients.filter((ing) => ing.recipeId !== recipeId);
  steps = steps.filter((s) => s.recipeId !== recipeId);
  permissions = permissions.filter((p) => p.recipeId !== recipeId);

  saveToStorage(STORAGE_KEYS.RECIPES, recipes);
  saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
  saveToStorage(STORAGE_KEYS.STEPS, steps);
  saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);

  if (shouldNotify) {
    notifyListeners();
  }
  return true;
}

// ================= PERMISSION OPERATIONS =================
export function addRecipePermission(recipeId: string, userEmail: string, accessLevel: 'viewer' | 'editor'): boolean {
  const users = getAllUsers();
  const targetUser = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase().trim());
  if (!targetUser) return false;

  let permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);
  permissions = permissions.filter((p) => !(p.recipeId === recipeId && p.userId === targetUser.id));

  permissions.push({
    id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    recipeId,
    userId: targetUser.id,
    accessLevel,
  });

  saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
  notifyListeners();
  return true;
}

export function removeRecipePermission(recipeId: string, userId: string): void {
  let permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);
  permissions = permissions.filter((p) => !(p.recipeId === recipeId && p.userId === userId));
  saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
  notifyListeners();
}

// ================= SQL SCHEMA & EXPORT GENERATOR =================
export function generateSqlSchemaScript(): string {
  const users = getAllUsers();
  const categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const recipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  const ingredients = loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  const steps = loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []);
  const permissions = loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []);

  const ddl = `-- ========================================================
-- VELVETKITCHEN RELATIONAL DATABASE SCHEMA (PostgreSQL / SQLite)
-- Entities: User, Category, Recipe, RecipeIngredient, RecipeStep, RecipePermission
-- ========================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  color VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  source VARCHAR(255),
  external_url TEXT,
  image_url TEXT,
  notes TEXT,
  is_shortcut BOOLEAN DEFAULT FALSE,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id VARCHAR(64) PRIMARY KEY,
  recipe_id VARCHAR(64) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_text TEXT NOT NULL,
  ingredient_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id VARCHAR(64) PRIMARY KEY,
  recipe_id VARCHAR(64) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  instruction_text TEXT NOT NULL,
  step_number INT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_permissions (
  id VARCHAR(64) PRIMARY KEY,
  recipe_id VARCHAR(64) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(32) NOT NULL CHECK (access_level IN ('viewer', 'editor', 'owner')),
  UNIQUE (recipe_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_steps_recipe ON recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_permissions_recipe ON recipe_permissions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON recipe_permissions(user_id);
`;

  // Escape helpers
  const escapeSql = (str?: string | null) => {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
  };

  const userInserts = users
    .map(
      (u) =>
        `INSERT INTO users (id, name, email, avatar_url, created_at) VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.avatarUrl)}, ${escapeSql(u.createdAt)});`
    )
    .join('\n');

  const categoryInserts = categories
    .map(
      (c) =>
        `INSERT INTO categories (id, user_id, name, color, created_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.userId)}, ${escapeSql(c.name)}, ${escapeSql(c.color)}, ${escapeSql(c.createdAt)});`
    )
    .join('\n');

  const recipeInserts = recipes
    .map(
      (r) =>
        `INSERT INTO recipes (id, user_id, category_id, title, source, external_url, image_url, notes, is_shortcut, prep_time_minutes, cook_time_minutes, servings, created_at) VALUES (${escapeSql(r.id)}, ${escapeSql(r.userId)}, ${escapeSql(r.categoryId)}, ${escapeSql(r.title)}, ${escapeSql(r.source)}, ${escapeSql(r.externalUrl)}, ${escapeSql(r.imageUrl)}, ${escapeSql(r.notes)}, ${r.isShortcut ? 'TRUE' : 'FALSE'}, ${r.prepTimeMinutes || 'NULL'}, ${r.cookTimeMinutes || 'NULL'}, ${r.servings || 'NULL'}, ${escapeSql(r.createdAt)});`
    )
    .join('\n');

  const ingredientInserts = ingredients
    .map(
      (i) =>
        `INSERT INTO recipe_ingredients (id, recipe_id, ingredient_text, ingredient_order) VALUES (${escapeSql(i.id)}, ${escapeSql(i.recipeId)}, ${escapeSql(i.ingredientText)}, ${i.order});`
    )
    .join('\n');

  const stepInserts = steps
    .map(
      (s) =>
        `INSERT INTO recipe_steps (id, recipe_id, instruction_text, step_number) VALUES (${escapeSql(s.id)}, ${escapeSql(s.recipeId)}, ${escapeSql(s.instructionText)}, ${s.stepNumber});`
    )
    .join('\n');

  return `${ddl}

-- ========================================================
-- DATA SEED / EXPORT INSERTS
-- ========================================================

${userInserts}

${categoryInserts}

${recipeInserts}

${ingredientInserts}

${stepInserts}
`;
}

export function exportDatabaseJson(): string {
  const data = {
    exportDate: new Date().toISOString(),
    users: getAllUsers(),
    categories: loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []),
    recipes: loadFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []),
    ingredients: loadFromStorage<RecipeIngredient[]>(STORAGE_KEYS.INGREDIENTS, []),
    steps: loadFromStorage<RecipeStep[]>(STORAGE_KEYS.STEPS, []),
    permissions: loadFromStorage<RecipePermission[]>(STORAGE_KEYS.PERMISSIONS, []),
  };
  return JSON.stringify(data, null, 2);
}
