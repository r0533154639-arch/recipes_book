import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  Grid,
  List as ListIcon,
  ChefHat,
  Search,
  ArrowUpDown,
  Layers,
  Menu,
  ExternalLink,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useTranslation } from './i18n/I18nContext';
import {
  createCategory,
  deleteCategory,
  deleteRecipe,
  getCategories,
  getRecipes,
  saveRecipe,
  subscribeToDatabase,
  updateCategory,
} from './services/db';
import { Category, FilterType, FullRecipeData, SortOption } from './types/models';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { RecipeFormModal } from './components/RecipeFormModal';
import { CookModeModal } from './components/CookModeModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { AuthModal } from './components/AuthModal';
import { DeployGuideModal } from './components/DeployGuideModal';

function MainApp() {
  const { t, isRtl } = useTranslation();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  // Navigation and Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('alpha-asc'); // Default A-Z Alphabetical as required!
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [activeDetailRecipe, setActiveDetailRecipe] = useState<FullRecipeData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<FullRecipeData | null>(null);
  const [activeCookRecipe, setActiveCookRecipe] = useState<FullRecipeData | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Database Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<FullRecipeData[]>([]);

  // Refresh data whenever database changes or user switches
  const refreshData = () => {
    if (!currentUser) return;
    const userCategories = getCategories(currentUser.id);
    const userRecipes = getRecipes(
      currentUser.id,
      selectedCategoryId,
      sortOption,
      searchQuery,
      selectedFilter === 'all' ? null : selectedFilter === 'shortcuts'
    );
    setCategories(userCategories);
    setRecipes(userRecipes);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDatabase(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [currentUser?.id, selectedCategoryId, sortOption, searchQuery, selectedFilter]);

  // Selected Category Object
  const currentCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Category handlers
  const handleCreateCategory = (name: string, color: string): Category => {
    return createCategory(userId, name, color);
  };

  const handleUpdateCategory = (id: string, name: string, color?: string) => {
    updateCategory(id, name, color);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
  };

  // Recipe handlers
  const handleSaveRecipe = (input: any) => {
    const saved = saveRecipe(input);
    if (activeDetailRecipe?.id === saved.id) {
      setActiveDetailRecipe(saved);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    deleteRecipe(recipeId);
    if (activeDetailRecipe?.id === recipeId) {
      setActiveDetailRecipe(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewRecipe={() => {
          setRecipeToEdit(null);
          setIsFormOpen(true);
        }}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Category Sidebar */}
        <Sidebar
          categories={categories}
          recipes={getRecipes(userId)}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile view top trigger & breadcrumb */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-[#1f2533]">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161b24] text-xs font-semibold text-gray-200 border border-[#252e3e]"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span>{t('sidebar.user_categories')}</span>
            </button>

            <span className="text-xs text-gray-400 font-mono">
              {t('dashboard.recipes_count_label', {
                count: recipes.length,
                s: recipes.length !== 1 ? 's' : '',
              })}
            </span>
          </div>

          {/* User Vault Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#151a24] via-[#12161f] to-[#101319] border border-[#232b3b] p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('app.isolated_vault')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t('app.active_chef')}:{' '}
                    <strong className="text-gray-200">{currentUser?.name}</strong>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {selectedFilter === 'shortcuts'
                    ? t('dashboard.web_bookmarks_title')
                    : currentCategory
                    ? currentCategory.name
                    : t('dashboard.culinary_master_collection')}
                </h1>

                <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
                  {selectedFilter === 'shortcuts'
                    ? t('dashboard.web_bookmarks_desc')
                    : currentCategory
                    ? t('dashboard.category_recipes_desc', { name: currentCategory.name })
                    : t('dashboard.culinary_master_desc')}
                </p>
              </div>

              {/* Quick stats on header */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#181e2b]/80 border border-[#273244] px-4 py-2.5 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {t('dashboard.category_recipes_count')}
                  </p>
                  <p className="text-lg font-bold text-white font-mono">{recipes.length}</p>
                </div>
                <button
                  onClick={() => {
                    setRecipeToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('dashboard.create_recipe_button')}</span>
                </button>
              </div>
            </div>

            {/* Subtle background glow */}
            <div
              className={`absolute ${
                isRtl ? 'left-0' : 'right-0'
              } top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none`}
            />
          </div>

          {/* Quick Categories Bar (Dashboard Carousel) */}
          {!selectedCategoryId && selectedFilter === 'all' && categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  {t('dashboard.categories_overview')}
                </span>
                <span className="text-[11px] text-gray-400">{t('dashboard.click_to_filter')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const count = getRecipes(userId, cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`group flex flex-col justify-between p-3.5 rounded-2xl bg-[#151922] hover:bg-[#1a202c] border border-[#222938] hover:border-emerald-500/30 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        />
                        <span className="text-[11px] font-mono text-gray-400 px-1.5 py-0.5 rounded bg-[#1f2533]">
                          {count}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-200 group-hover:text-emerald-300 truncate">
                        {cat.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls Bar: Filters, Sorting (A-Z Alphabetical default), and View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#141822] border border-[#222938] rounded-2xl">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a202c]'
                }`}
              >
                {t('dashboard.filter_all')} ({getRecipes(userId, selectedCategoryId).length})
              </button>

              <button
                onClick={() => setSelectedFilter('full')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === 'full'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a202c]'
                }`}
              >
                {t('dashboard.filter_full')}
              </button>

              <button
                onClick={() => setSelectedFilter('shortcuts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === 'shortcuts'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a202c]'
                }`}
              >
                {t('dashboard.filter_shortcuts')}
              </button>
            </div>

            {/* Sorting & Grid/List view */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              {/* Sorting Dropdown (Alphabetical A-Z by default) */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#191f2b] px-2.5 py-1.5 rounded-xl border border-[#283243]">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">{t('dashboard.sort_label')}</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-transparent text-gray-200 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="alpha-asc" className="bg-[#191f2b] text-white">
                    {t('dashboard.sort_alpha_asc')}
                  </option>
                  <option value="alpha-desc" className="bg-[#191f2b] text-white">
                    {t('dashboard.sort_alpha_desc')}
                  </option>
                  <option value="newest" className="bg-[#191f2b] text-white">
                    {t('dashboard.sort_newest')}
                  </option>
                  <option value="oldest" className="bg-[#191f2b] text-white">
                    {t('dashboard.sort_oldest')}
                  </option>
                </select>
              </div>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-[#191f2b] p-1 rounded-xl border border-[#283243] gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Compact List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Search notification badge */}
          {searchQuery && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>
                  {t('dashboard.search_filtering', { query: searchQuery })}
                </span>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="underline hover:text-white text-[11px]"
              >
                {t('dashboard.clear_search')}
              </button>
            </div>
          )}

          {/* Recipes Display (Grid or List) */}
          {recipes.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-[#13161f] border border-dashed border-[#242c3d] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1b2230] text-gray-500 flex items-center justify-center mx-auto">
                <ChefHat className="w-7 h-7 stroke-[1.3]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-200">{t('dashboard.no_recipes_found')}</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                  {searchQuery
                    ? t('dashboard.no_recipes_search_desc', { query: searchQuery })
                    : currentCategory
                    ? t('dashboard.no_recipes_cat_desc', { name: currentCategory.name })
                    : t('dashboard.no_recipes_general_desc')}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setRecipeToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('dashboard.create_recipe_button')}</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recipes.map((recipe) => {
                const cat = categories.find((c) => c.id === recipe.categoryId);
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    categoryColor={cat?.color || '#10b981'}
                    onView={(r) => setActiveDetailRecipe(r)}
                    onEdit={(r) => {
                      setRecipeToEdit(r);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteRecipe}
                    searchHighlight={searchQuery}
                  />
                );
              })}
            </div>
          ) : (
            /* Compact List View */
            <div className="bg-[#141822] border border-[#222938] rounded-2xl divide-y divide-[#1e2533] overflow-hidden">
              {recipes.map((recipe) => {
                const cat = categories.find((c) => c.id === recipe.categoryId);
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setActiveDetailRecipe(recipe)}
                    className="group flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#191f2c] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#1c222f] overflow-hidden shrink-0 border border-[#283243]">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ChefHat className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 truncate">
                            {recipe.title}
                          </h4>
                          {recipe.isShortcut && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono shrink-0">
                              {t('card.shortcut')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          <span>{recipe.source || t('detail.personal_archive')}</span>
                          <span className="mx-1.5">•</span>
                          <span style={{ color: cat?.color || '#10b981' }}>
                            {recipe.categoryName}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {recipe.prepTimeMinutes && (
                        <span className="hidden sm:inline-block text-xs text-gray-400 font-mono">
                          {t('dashboard.prep_time_short', { mins: recipe.prepTimeMinutes })}
                        </span>
                      )}
                      {recipe.externalUrl && (
                        <a
                          href={recipe.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-gray-800 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors ${
                          isRtl ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={activeDetailRecipe}
        onClose={() => setActiveDetailRecipe(null)}
        onEdit={(r) => {
          setActiveDetailRecipe(null);
          setRecipeToEdit(r);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteRecipe}
        onStartCookMode={(r) => {
          setActiveDetailRecipe(null);
          setActiveCookRecipe(r);
        }}
      />

      {/* 2. Recipe Add/Edit Form Modal */}
      {isFormOpen && (
        <RecipeFormModal
          recipeToEdit={recipeToEdit}
          categories={categories}
          userId={userId}
          defaultCategoryId={selectedCategoryId}
          onClose={() => {
            setIsFormOpen(false);
            setRecipeToEdit(null);
          }}
          onSave={handleSaveRecipe}
          onCreateCategory={handleCreateCategory}
        />
      )}

      {/* 3. Cook Mode Fullscreen Carousel & Timer */}
      {activeCookRecipe && (
        <CookModeModal
          recipe={activeCookRecipe}
          onClose={() => setActiveCookRecipe(null)}
        />
      )}

      {/* 4. SQL Schema Explorer & DDL Download Modal */}
      {isSqlModalOpen && (
        <SqlSchemaModal onClose={() => setIsSqlModalOpen(false)} />
      )}

      {/* 5. User Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

      {/* 6. Deploy & GitHub Setup Guide */}
      {isDeployModalOpen && (
        <DeployGuideModal onClose={() => setIsDeployModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </I18nProvider>
  );
}
