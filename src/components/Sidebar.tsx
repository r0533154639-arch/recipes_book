import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  Bookmark,
  BookOpen,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Palette,
  Layers,
} from 'lucide-react';
import { Category, FullRecipeData } from '../types/models';
import { useTranslation } from '../i18n/I18nContext';

interface SidebarProps {
  categories: Category[];
  recipes: FullRecipeData[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedFilter: 'all' | 'full' | 'shortcuts';
  onSelectFilter: (filter: 'all' | 'full' | 'shortcuts') => void;
  onCreateCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color?: string) => void;
  onDeleteCategory: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ef4444', // red
];

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  recipes,
  selectedCategoryId,
  onSelectCategory,
  selectedFilter,
  onSelectFilter,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { t, isRtl } = useTranslation();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatColor, setEditingCatColor] = useState('');

  // Total recipes calculation
  const totalCount = recipes.length;
  const shortcutCount = recipes.filter((r) => r.isShortcut).length;

  const handleStartAdd = () => {
    setIsAddingCategory(true);
    setNewCatName('');
    setNewCatColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim(), newCatColor);
    setIsAddingCategory(false);
    setNewCatName('');
  };

  const handleStartEdit = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setEditingCatColor(cat.color || CATEGORY_COLORS[0]);
  };

  const handleSaveEdit = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatName.trim()) return;
    onUpdateCategory(catId, editingCatName.trim(), editingCatColor);
    setEditingCatId(null);
  };

  const handleDelete = (catId: string, catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = recipes.filter((r) => r.categoryId === catId).length;
    const msg = count > 0
      ? t('sidebar.delete_category_confirm', { name: catName, count })
      : t('sidebar.delete_category_simple_confirm', { name: catName });
    if (window.confirm(msg)) {
      onDeleteCategory(catId);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] ${
          isRtl ? 'right-0 border-l border-[#222733]' : 'left-0 border-r border-[#222733]'
        } h-full lg:h-[calc(100vh-61px)] w-72 bg-[#12151b] z-50 lg:z-10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#222733]">
          <span className="font-bold text-gray-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            {t('sidebar.categories_and_views')}
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation / Main sections */}
        <div className="p-3 border-b border-[#222733] space-y-1">
          <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('sidebar.quick_views')}
          </p>

          {/* All Recipes */}
          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectFilter('all');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedCategoryId === null && selectedFilter === 'all'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-gray-300 hover:bg-[#1a1f29] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t('sidebar.all_recipes')}</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2430] text-gray-300 font-mono">
              {totalCount}
            </span>
          </button>

          {/* Bookmarks / Shortcuts */}
          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectFilter('shortcuts');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedFilter === 'shortcuts'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                : 'text-gray-300 hover:bg-[#1a1f29] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>{t('sidebar.web_bookmarks')}</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2430] text-gray-300 font-mono">
              {shortcutCount}
            </span>
          </button>
        </div>

        {/* Categories Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3 h-3 text-gray-400" />
              {t('sidebar.user_categories')} ({categories.length})
            </span>
            <button
              onClick={handleStartAdd}
              className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              title={t('sidebar.create_first_category')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Category Form Inline */}
          {isAddingCategory && (
            <form
              onSubmit={handleSaveNew}
              className="p-2.5 mb-2 bg-[#181d26] rounded-xl border border-emerald-500/40 space-y-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t('sidebar.add_category_placeholder')}
                  autoFocus
                  className="w-full text-xs bg-[#11141a] text-white px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Color picker pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        newCatColor === color ? 'scale-125 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="submit"
                    className="p-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-md"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="p-1 text-gray-400 hover:text-white rounded-md"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-[#151922] border border-dashed border-[#262c3a] text-xs text-gray-400">
              <p>{t('sidebar.no_categories')}</p>
              <button
                onClick={handleStartAdd}
                className="mt-2 text-emerald-400 hover:underline font-medium"
              >
                {t('sidebar.create_first_category')}
              </button>
            </div>
          ) : (
            categories.map((cat) => {
              const recipeCount = recipes.filter((r) => r.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id && selectedFilter !== 'shortcuts';
              const isEditing = editingCatId === cat.id;

              if (isEditing) {
                return (
                  <form
                    key={cat.id}
                    onSubmit={(e) => handleSaveEdit(cat.id, e)}
                    className="p-2 bg-[#181d26] rounded-xl border border-blue-500/40 space-y-2 animate-in fade-in"
                  >
                    <input
                      type="text"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      autoFocus
                      className="w-full text-xs bg-[#11141a] text-white px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {CATEGORY_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditingCatColor(color)}
                            style={{ backgroundColor: color }}
                            className={`w-3.5 h-3.5 rounded-full ${
                              editingCatColor === color ? 'scale-125 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="submit"
                          className="p-1 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
                          title={t('sidebar.rename_category')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1 text-gray-400 hover:text-white rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectFilter('all');
                    onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1b222f] text-white border border-[#2e3748] shadow-sm'
                      : 'text-gray-300 hover:bg-[#161a23] hover:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2430] text-gray-400 font-mono group-hover:hidden">
                      {recipeCount}
                    </span>

                    {/* Action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => handleStartEdit(cat, e)}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded"
                        title={t('sidebar.rename_category')}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(cat.id, cat.name, e)}
                        className="p-1 text-gray-400 hover:text-rose-400 hover:bg-gray-700/50 rounded"
                        title={t('sidebar.delete_category')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info: relational isolation */}
        <div className="p-3 border-t border-[#222733] bg-[#101318]">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{t('app.storage_relational')}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
              {t('app.postgres_schema')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
