import React, { useState } from 'react';
import {
  X,
  Clock,
  Utensils,
  ExternalLink,
  Edit,
  Trash2,
  Play,
  Share2,
  CheckCircle2,
  Circle,
  Bookmark,
  ChefHat,
  Users,
  Shield,
  Plus,
  Copy,
} from 'lucide-react';
import { FullRecipeData } from '../types/models';
import { addRecipePermission, removeRecipePermission } from '../services/db';
import { useTranslation } from '../i18n/I18nContext';

interface RecipeDetailModalProps {
  recipe: FullRecipeData | null;
  onClose: () => void;
  onEdit: (recipe: FullRecipeData) => void;
  onDelete: (recipeId: string) => void;
  onStartCookMode: (recipe: FullRecipeData) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEdit,
  onDelete,
  onStartCookMode,
}) => {
  const { t, isRtl } = useTranslation();
  if (!recipe) return null;

  // Local interactive checkboxes for ingredients & steps during viewing
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Share permission state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareMsg, setShareMsg] = useState<{ text: string; success: boolean } | null>(null);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    const ok = addRecipePermission(recipe.id, shareEmail.trim(), shareRole);
    if (ok) {
      setShareMsg({
        text: t('detail.granted_msg', {
          role: shareRole === 'editor' ? t('detail.role_editor') : t('detail.role_viewer'),
          email: shareEmail,
        }),
        success: true,
      });
      setShareEmail('');
    } else {
      setShareMsg({ text: t('detail.user_not_found_msg'), success: false });
    }
  };

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#141720] border border-[#252c3c] rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white backdrop-blur-md transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 w-full bg-[#1c222e]">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1e2533] to-[#12151d] text-gray-500">
              <ChefHat className="w-16 h-16 stroke-[1.2] text-gray-600 mb-2" />
              <span className="text-sm font-mono text-gray-400">{t('detail.gourmet_recipe')}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-[#141720]/50 to-transparent" />

          {/* Hero text overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
                  {recipe.categoryName}
                </span>

                {recipe.isShortcut ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    {t('detail.web_bookmark_shortcut')}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium text-gray-300 bg-black/40 backdrop-blur-md">
                    {t('detail.full_recipe')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {recipe.title}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300">
                {t('detail.source_label')}{' '}
                <span className="text-gray-100 font-medium">
                  {recipe.source || t('detail.personal_archive')}
                </span>
              </p>
            </div>

            {/* Action buttons on hero */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!recipe.isShortcut && recipe.steps.length > 0 && (
                <button
                  onClick={() => onStartCookMode(recipe)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Play className={`w-4 h-4 fill-emerald-950 ${isRtl ? 'rotate-180' : ''}`} />
                  <span>{t('detail.start_cook_mode')}</span>
                </button>
              )}

              {recipe.externalUrl && (
                <a
                  href={recipe.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#222938] hover:bg-[#2c3548] text-white font-medium text-xs border border-[#354055] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>{t('detail.open_url')}</span>
                </a>
              )}

              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="p-2.5 rounded-xl bg-[#222938] hover:bg-[#2c3548] text-gray-200 hover:text-white border border-[#354055] transition-colors"
                title={t('detail.share_permissions')}
              >
                <Share2 className="w-4 h-4 text-blue-400" />
              </button>

              <button
                onClick={() => onEdit(recipe)}
                className="p-2.5 rounded-xl bg-[#222938] hover:bg-[#2c3548] text-gray-200 hover:text-white border border-[#354055] transition-colors"
                title={t('detail.edit_recipe')}
              >
                <Edit className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  if (window.confirm(t('card.delete_confirm', { title: recipe.title }))) {
                    onDelete(recipe.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-[#222938] hover:bg-rose-500/20 text-gray-200 hover:text-rose-400 border border-[#354055] transition-colors"
                title={t('detail.delete_recipe')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Share & Permissions Bar (Toggleable) */}
        {isShareOpen && (
          <div className="bg-[#181d28] border-b border-[#293244] p-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{t('detail.recipe_permissions_title')}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {t('detail.access_isolated')}
              </span>
            </div>

            <form onSubmit={handleAddCollaborator} className="flex flex-wrap items-center gap-2 mb-2">
              <input
                type="email"
                placeholder={t('detail.collaborator_email_placeholder')}
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 min-w-[200px] text-xs bg-[#11141b] text-white px-3 py-2 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor')}
                className="text-xs bg-[#11141b] text-gray-300 px-3 py-2 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="viewer">{t('detail.role_viewer')}</option>
                <option value="editor">{t('detail.role_editor')}</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('detail.grant_button')}</span>
              </button>
            </form>

            {shareMsg && (
              <p
                className={`text-xs ${
                  shareMsg.success ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {shareMsg.text}
              </p>
            )}

            {/* List active permissions */}
            {recipe.permissions && recipe.permissions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-800 space-y-1">
                <p className="text-[11px] text-gray-400 font-medium">{t('detail.shared_with')}</p>
                {recipe.permissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs text-gray-300 bg-[#12161f] px-3 py-1.5 rounded-lg border border-gray-800"
                  >
                    <span>{t('detail.user_id_label')} {p.userId}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase font-mono">
                        {p.accessLevel === 'editor' ? t('detail.role_editor') : t('detail.role_viewer')}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRecipePermission(recipe.id, p.userId)}
                        className="text-gray-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-320px)] overflow-y-auto">
          {/* Quick Stats Grid */}
          {!recipe.isShortcut && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#181c26] border border-[#252d3d] p-3 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {t('detail.prep_time')}
                  </p>
                  <p className="text-sm font-bold text-gray-100">
                    {recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} ${t('detail.minutes_suffix')}` : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-[#181c26] border border-[#252d3d] p-3 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {t('detail.cook_time')}
                  </p>
                  <p className="text-sm font-bold text-gray-100">
                    {recipe.cookTimeMinutes ? `${recipe.cookTimeMinutes} ${t('detail.minutes_suffix')}` : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-[#181c26] border border-[#252d3d] p-3 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {t('detail.servings')}
                  </p>
                  <p className="text-sm font-bold text-gray-100">
                    {recipe.servings ? `${recipe.servings} ${t('detail.people')}` : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-[#181c26] border border-[#252d3d] p-3 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {t('detail.total_time')}
                  </p>
                  <p className="text-sm font-bold text-gray-100">
                    {totalTime > 0 ? `${totalTime} ${t('detail.minutes_suffix')}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes or External Link highlight */}
          {recipe.isShortcut ? (
            <div className="bg-gradient-to-r from-indigo-950/40 to-[#191d29] border border-indigo-500/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                <Bookmark className="w-4 h-4" />
                <span>{t('detail.web_bookmark_shortcut')}</span>
              </div>
              <p className="text-xs text-gray-300">
                {t('detail.shortcut_banner_desc')}
              </p>
              {recipe.externalUrl && (
                <a
                  href={recipe.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  <span>{t('detail.visit_source', { source: recipe.source || t('detail.personal_archive') })}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : null}

          {/* Chef's Notes */}
          {recipe.notes && (
            <div className="bg-[#181c26] border border-[#252d3d] p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t('detail.chef_notes_title')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {recipe.notes}
              </p>
            </div>
          )}

          {/* Ingredients & Steps (for Full Recipes) */}
          {!recipe.isShortcut && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Ingredients Column */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t('detail.ingredients_title')} ({recipe.ingredients.length})
                  </h3>
                  <span className="text-[11px] text-gray-400">{t('detail.tap_to_check')}</span>
                </div>

                <div className="bg-[#181c26] border border-[#252d3d] rounded-2xl p-2 divide-y divide-[#202634]">
                  {recipe.ingredients.length === 0 ? (
                    <p className="p-3 text-xs text-gray-500 italic">{t('detail.no_ingredients')}</p>
                  ) : (
                    recipe.ingredients.map((ing) => {
                      const isChecked = !!checkedIngredients[ing.id];
                      return (
                        <div
                          key={ing.id}
                          onClick={() => toggleIngredient(ing.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-950/20 text-gray-500 line-through'
                              : 'hover:bg-[#1f2533] text-gray-200'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-gray-400 hover:text-emerald-400"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <span className="text-xs sm:text-sm leading-snug">
                            {ing.ingredientText}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Steps Column */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    {t('detail.steps_title')} ({recipe.steps.length})
                  </h3>
                  <span className="text-[11px] text-gray-400">{t('detail.step_by_step')}</span>
                </div>

                <div className="space-y-3">
                  {recipe.steps.length === 0 ? (
                    <div className="bg-[#181c26] border border-[#252d3d] p-4 rounded-2xl text-xs text-gray-500 italic">
                      {t('detail.no_steps')}
                    </div>
                  ) : (
                    recipe.steps.map((st) => {
                      const isDone = !!completedSteps[st.id];
                      return (
                        <div
                          key={st.id}
                          onClick={() => toggleStep(st.id)}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-[#151922] border-emerald-500/30 opacity-75'
                              : 'bg-[#181c26] border-[#252d3d] hover:border-[#354055]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isDone
                                ? 'bg-emerald-500 text-black'
                                : 'bg-[#252e3e] text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {isDone ? '✓' : st.stepNumber}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-xs sm:text-sm leading-relaxed ${
                                isDone ? 'text-gray-400 line-through' : 'text-gray-200'
                              }`}
                            >
                              {st.instructionText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
