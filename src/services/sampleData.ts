import { Category, Recipe, RecipeIngredient, RecipeStep, User } from '../types/models';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_chef_gordon',
    name: 'Chef Gordon',
    email: 'chef.gordon@velvetkitchen.io',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user_maya_cook',
    name: 'Maya Lin',
    email: 'maya.cooks@velvetkitchen.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-02-10T11:30:00Z',
  },
];

export const FOOD_PRESET_IMAGES = [
  { label: 'Ribeye Steak', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Neapolitan Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Truffle Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281293?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Crispy Salmon', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Avocado Tartine', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Matcha Iced Latte', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Dark Chocolate Lava', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Japanese Ramen', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Fresh Green Salad', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80' },
];

export const getSeedDataForUser = (userId: string): {
  categories: Category[];
  recipes: Recipe[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
} => {
  const catMains = `cat_${userId}_mains`;
  const catPastas = `cat_${userId}_pastas`;
  const catDesserts = `cat_${userId}_desserts`;
  const catShortcuts = `cat_${userId}_quicklinks`;

  const categories: Category[] = [
    {
      id: catMains,
      userId,
      name: 'Main Courses',
      color: '#10b981', // emerald
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: catPastas,
      userId,
      name: 'Artisan Pastas',
      color: '#f59e0b', // amber
      createdAt: '2026-03-02T10:00:00Z',
    },
    {
      id: catDesserts,
      userId,
      name: 'Desserts & Sweets',
      color: '#ec4899', // pink
      createdAt: '2026-03-03T10:00:00Z',
    },
    {
      id: catShortcuts,
      userId,
      name: 'Web Bookmarks & Inspiration',
      color: '#6366f1', // indigo
      createdAt: '2026-03-04T10:00:00Z',
    },
  ];

  // Recipe 1: Pan-Seared Truffle Ribeye (Full Recipe)
  const recRibeyeId = `rec_${userId}_ribeye`;
  // Recipe 2: Creamy Wild Mushroom Tagliatelle (Full Recipe)
  const recTagliatelleId = `rec_${userId}_tagliatelle`;
  // Recipe 3: Dark Chocolate Fondant (Full Recipe)
  const recFondantId = `rec_${userId}_fondant`;
  // Recipe 4: Serious Eats Ultra-Crispy Roasted Potatoes (Bookmark/Shortcut)
  const recPotatoesId = `rec_${userId}_potatoes`;
  // Recipe 5: Kenji's 15-Minute Creamy Carbonara (Bookmark/Shortcut)
  const recCarbonaraId = `rec_${userId}_carbonara`;

  const recipes: Recipe[] = [
    {
      id: recRibeyeId,
      userId,
      categoryId: catMains,
      title: 'Pan-Seared Truffle Butter Ribeye',
      source: 'Family Secret & Modern Technique',
      imageUrl: FOOD_PRESET_IMAGES[0].url,
      prepTimeMinutes: 15,
      cookTimeMinutes: 12,
      servings: 2,
      isShortcut: false,
      notes: 'Ensure the cast iron skillet is smoking hot before adding the steak. Rest for a full 8 minutes before slicing across the grain.',
      createdAt: '2026-03-10T12:00:00Z',
    },
    {
      id: recTagliatelleId,
      userId,
      categoryId: catPastas,
      title: 'Creamy Truffle & Wild Mushroom Tagliatelle',
      source: 'Tuscany Culinary Journal',
      imageUrl: FOOD_PRESET_IMAGES[2].url,
      prepTimeMinutes: 20,
      cookTimeMinutes: 15,
      servings: 4,
      isShortcut: false,
      notes: 'Reserve at least 1 cup of starchy pasta water to emulsify the rich parmesan sauce.',
      createdAt: '2026-03-12T14:30:00Z',
    },
    {
      id: recFondantId,
      userId,
      categoryId: catDesserts,
      title: 'Molten Dark Chocolate Lava Cakes',
      source: 'Le Cordon Bleu Basics',
      imageUrl: FOOD_PRESET_IMAGES[6].url,
      prepTimeMinutes: 20,
      cookTimeMinutes: 11,
      servings: 4,
      isShortcut: false,
      notes: 'Use 70% Valrhona or Guittard dark chocolate for the most luxurious molten center.',
      createdAt: '2026-03-15T18:00:00Z',
    },
    {
      id: recPotatoesId,
      userId,
      categoryId: catShortcuts,
      title: 'Serious Eats: The Best Crispy Roast Potatoes',
      source: 'J. Kenji López-Alt (Serious Eats)',
      externalUrl: 'https://www.seriouseats.com/the-best-roast-potatoes-ever-recipe',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80',
      isShortcut: true,
      notes: 'Key technique is parboiling the potatoes with baking soda to create an exterior starch slurry.',
      createdAt: '2026-03-18T09:15:00Z',
    },
    {
      id: recCarbonaraId,
      userId,
      categoryId: catPastas,
      title: 'Traditional Roman Spaghetti alla Carbonara',
      source: 'La Cucina Italiana',
      externalUrl: 'https://www.lacucinaitaliana.com/recipe/pasta/spaghetti-alla-carbonara',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
      isShortcut: true,
      notes: 'Zero heavy cream! Only egg yolks, Pecorino Romano, guanciale, and cracked black pepper.',
      createdAt: '2026-03-20T16:45:00Z',
    },
  ];

  const ingredients: RecipeIngredient[] = [
    // Ribeye ingredients
    { id: `ing_${recRibeyeId}_1`, recipeId: recRibeyeId, ingredientText: '2 thick-cut USDA Prime Ribeye steaks (approx 16 oz each)', order: 1 },
    { id: `ing_${recRibeyeId}_2`, recipeId: recRibeyeId, ingredientText: '2 tbsp Maldon flaky sea salt & freshly cracked black pepper', order: 2 },
    { id: `ing_${recRibeyeId}_3`, recipeId: recRibeyeId, ingredientText: '3 tbsp high-smoke avocado oil', order: 3 },
    { id: `ing_${recRibeyeId}_4`, recipeId: recRibeyeId, ingredientText: '4 tbsp unsalted French butter', order: 4 },
    { id: `ing_${recRibeyeId}_5`, recipeId: recRibeyeId, ingredientText: '4 sprigs fresh thyme & 2 sprigs rosemary', order: 5 },
    { id: `ing_${recRibeyeId}_6`, recipeId: recRibeyeId, ingredientText: '4 cloves garlic, gently crushed', order: 6 },
    { id: `ing_${recRibeyeId}_7`, recipeId: recRibeyeId, ingredientText: '1 tbsp white truffle butter or finishing oil', order: 7 },

    // Tagliatelle ingredients
    { id: `ing_${recTagliatelleId}_1`, recipeId: recTagliatelleId, ingredientText: '400g fresh egg tagliatelle pasta', order: 1 },
    { id: `ing_${recTagliatelleId}_2`, recipeId: recTagliatelleId, ingredientText: '350g mixed wild mushrooms (chanterelles, cremini, shiitake), sliced', order: 2 },
    { id: `ing_${recTagliatelleId}_3`, recipeId: recTagliatelleId, ingredientText: '3 shallots, finely minced', order: 3 },
    { id: `ing_${recTagliatelleId}_4`, recipeId: recTagliatelleId, ingredientText: '1/2 cup dry Italian white wine (Pinot Grigio)', order: 4 },
    { id: `ing_${recTagliatelleId}_5`, recipeId: recTagliatelleId, ingredientText: '1 cup heavy whipping cream or crème fraîche', order: 5 },
    { id: `ing_${recTagliatelleId}_6`, recipeId: recTagliatelleId, ingredientText: '1 cup Parmigiano-Reggiano, freshly grated (24 months)', order: 6 },
    { id: `ing_${recTagliatelleId}_7`, recipeId: recTagliatelleId, ingredientText: '2 tbsp finely chopped flat-leaf parsley', order: 7 },

    // Lava cake ingredients
    { id: `ing_${recFondantId}_1`, recipeId: recFondantId, ingredientText: '170g bittersweet dark chocolate (70%), coarsely chopped', order: 1 },
    { id: `ing_${recFondantId}_2`, recipeId: recFondantId, ingredientText: '115g unsalted butter (1 stick)', order: 2 },
    { id: `ing_${recFondantId}_3`, recipeId: recFondantId, ingredientText: '2 large whole eggs + 2 large egg yolks (room temp)', order: 3 },
    { id: `ing_${recFondantId}_4`, recipeId: recFondantId, ingredientText: '1/3 cup granulated sugar', order: 4 },
    { id: `ing_${recFondantId}_5`, recipeId: recFondantId, ingredientText: 'pinch of fine sea salt', order: 5 },
    { id: `ing_${recFondantId}_6`, recipeId: recFondantId, ingredientText: '2 tbsp all-purpose flour', order: 6 },
  ];

  const steps: RecipeStep[] = [
    // Ribeye steps
    { id: `stp_${recRibeyeId}_1`, recipeId: recRibeyeId, instructionText: 'Pat the steaks completely dry with paper towels. Season generously on all sides with kosher salt and black pepper. Let rest at room temp for 30 minutes.', stepNumber: 1 },
    { id: `stp_${recRibeyeId}_2`, recipeId: recRibeyeId, instructionText: 'Heat a heavy 12-inch cast-iron skillet over high heat until wisps of smoke appear. Add avocado oil and swirl to coat.', stepNumber: 2 },
    { id: `stp_${recRibeyeId}_3`, recipeId: recRibeyeId, instructionText: 'Carefully lay steaks into the pan. Sear untouched for 2.5 minutes until a deep golden-brown crust forms, then flip.', stepNumber: 3 },
    { id: `stp_${recRibeyeId}_4`, recipeId: recRibeyeId, instructionText: 'Reduce heat to medium-high. Add butter, crushed garlic, thyme, and rosemary. Tilt the pan and continuously baste the foaming herb butter over the steaks for 2 minutes.', stepNumber: 4 },
    { id: `stp_${recRibeyeId}_5`, recipeId: recRibeyeId, instructionText: 'Transfer steaks to a cutting board, crown with a dollop of truffle butter, and tent loosely with foil for 8 minutes before slicing.', stepNumber: 5 },

    // Tagliatelle steps
    { id: `stp_${recTagliatelleId}_1`, recipeId: recTagliatelleId, instructionText: 'Bring a large pot of heavily salted water to a rolling boil. Cook tagliatelle until 1 minute shy of al dente; reserve 1 cup pasta cooking water before draining.', stepNumber: 1 },
    { id: `stp_${recTagliatelleId}_2`, recipeId: recTagliatelleId, instructionText: 'In a wide skillet, heat butter and olive oil over medium-high. Add mushrooms in a single layer and sear undisturbed for 4 minutes until deeply browned.', stepNumber: 2 },
    { id: `stp_${recTagliatelleId}_3`, recipeId: recTagliatelleId, instructionText: 'Add minced shallots and garlic; sauté for 2 minutes. Deglaze the pan with white wine, scraping up flavorful browned fond from the bottom.', stepNumber: 3 },
    { id: `stp_${recTagliatelleId}_4`, recipeId: recTagliatelleId, instructionText: 'Pour in heavy cream and simmer gently for 2 minutes. Toss in the hot pasta along with grated Parmigiano and a splash of reserved pasta water.', stepNumber: 4 },
    { id: `stp_${recTagliatelleId}_5`, recipeId: recTagliatelleId, instructionText: 'Stir vigorously until the sauce coats every strand in a glossy emulsion. Finish with fresh parsley and flaky salt.', stepNumber: 5 },

    // Lava cake steps
    { id: `stp_${recFondantId}_1`, recipeId: recFondantId, instructionText: 'Preheat oven to 425°F (220°C). Butter four 6-ounce ramekins and dust thoroughly with cocoa powder, tapping out excess.', stepNumber: 1 },
    { id: `stp_${recFondantId}_2`, recipeId: recFondantId, instructionText: 'Melt chopped chocolate and butter together in a heatproof bowl set over a pot of barely simmering water, stirring until silky smooth.', stepNumber: 2 },
    { id: `stp_${recFondantId}_3`, recipeId: recFondantId, instructionText: 'In a mixing bowl, whisk whole eggs, yolks, sugar, and salt together until pale and slightly frothy (about 2 minutes).', stepNumber: 3 },
    { id: `stp_${recFondantId}_4`, recipeId: recFondantId, instructionText: 'Gently fold the melted chocolate mixture into the eggs, then sift in flour and fold until just combined. Divide evenly into ramekins.', stepNumber: 4 },
    { id: `stp_${recFondantId}_5`, recipeId: recFondantId, instructionText: 'Bake for 11–12 minutes until the edges are firm and cake-like but the center remains soft. Let cool for 1 minute, invert onto plates, and serve immediately.', stepNumber: 5 },
  ];

  return { categories, recipes, ingredients, steps };
};
