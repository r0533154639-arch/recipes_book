import React from 'react';
import {
  Clock,
  Utensils,
  ExternalLink,
  Bookmark,
  MoreVertical,
  ChefHat,
  Eye,
  Edit,
  Trash2,
  ListOrdered,
} from 'lucide-react';
import { FullRecipeData } from '../types/models';
import { useTranslation } from '../i18n/I18nContext';

interface RecipeCardProps {
  recipe: FullRecipeData;
  categoryColor?: string;
  onView: (recipe: FullRecipeData) => void;
  onEdit: (recipe: FullRecipeData) => void;
  onDelete: (recipeId: string) => void;
  searchHighlight?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  categoryColor = '#10b981',
  onView,
  onEdit,
  onDelete,
  searchHighlight,
}) => {
  const { t, isRtl } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const highlightText = (text: string) => {
    if (!searchHighlight || !searchHighlight.trim()) return text;
    const parts = text.split(new RegExp(`(${searchHighlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchHighlight.toLowerCase() ? (
        <span key={i} className="bg-emerald-500/30 text-emerald-200 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onClick={() => onView(recipe)}
      className="group relative flex flex-col bg-[#161a23] hover:bg-[#191e28] border border-[#232a38] hover:border-[#354054] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5"
    >
      {/* Top Image banner */}
      <div className="relative h-48 w-full bg-[#1e2430] overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a202c] to-[#12161f] text-gray-500">
            <ChefHat className="w-10 h-10 stroke-[1.2] text-gray-600 mb-1" />
            <span className="text-xs font-mono text-gray-500">{t('card.no_image')}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#161a23] via-transparent to-black/30" />

        {/* Category Pill Tag */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex items-center gap-1.5`}>
          <span
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white/95 backdrop-blur-md shadow-md flex items-center gap-1.5"
            style={{
              backgroundColor: `${categoryColor}cc`,
              borderColor: categoryColor,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {recipe.categoryName}
          </span>

          {recipe.isShortcut && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold text-indigo-200 bg-indigo-950/80 border border-indigo-500/40 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Bookmark className="w-3 h-3 text-indigo-400" />
              {t('card.shortcut')}
            </span>
          )}
        </div>

        {/* Quick Menu Button */}
        <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-gray-300 hover:text-white backdrop-blur-md transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div
                className={`absolute mt-1 w-36 rounded-xl bg-[#1d232e] border border-[#2e3748] shadow-2xl p-1 z-40 text-xs animate-in fade-in zoom-in-95 ${
                  isRtl ? 'left-0' : 'right-0'
                }`}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onView(recipe);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-gray-200 hover:bg-[#283141] rounded-lg transition-colors text-start"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('card.view_details')}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(recipe);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-gray-200 hover:bg-[#283141] rounded-lg transition-colors text-start"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('card.edit_recipe')}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm(t('card.delete_confirm', { title: recipe.title }))) {
                      onDelete(recipe.id);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('card.delete_recipe')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Recipe Title */}
          <h3 className="text-base font-bold text-gray-100 group-hover:text-emerald-300 transition-colors line-clamp-1 mb-1">
            {highlightText(recipe.title)}
          </h3>

          {/* Source attribution */}
          <p className="text-xs text-gray-400 mb-3 truncate">
            <span className="text-gray-400">{t('card.by_source')}</span>
            {recipe.source || t('card.personal_collection')}
          </p>

          {/* Description / Notes snippet if available */}
          {recipe.notes && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3 bg-[#11141a]/60 p-2 rounded-lg border border-[#202633]">
              {highlightText(recipe.notes)}
            </p>
          )}
        </div>

        {/* Recipe Meta Footer */}
        <div className="pt-3 border-t border-[#222733] flex items-center justify-between text-xs text-gray-400">
          {recipe.isShortcut ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                {t('card.bookmarked_url')}
              </span>

              {recipe.externalUrl && (
                <a
                  href={recipe.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  <span>{t('card.open_website')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {totalTime > 0 && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('card.mins_total', { mins: totalTime })}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('card.servings_count', { count: recipe.servings })}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>
                  {t('card.stats_summary', {
                    ingCount: recipe.ingredients.length,
                    stepsCount: recipe.steps.length,
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
