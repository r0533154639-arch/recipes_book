import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Bookmark,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  ChefHat,
  ListPlus,
} from 'lucide-react';
import { Category, FullRecipeData } from '../types/models';
import { FOOD_PRESET_IMAGES } from '../services/sampleData';
import { useTranslation } from '../i18n/I18nContext';

interface RecipeFormModalProps {
  recipeToEdit: FullRecipeData | null;
  categories: Category[];
  userId: string;
  defaultCategoryId?: string | null;
  onClose: () => void;
  onSave: (data: {
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
  }) => void;
  onCreateCategory: (name: string, color: string) => Category;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  recipeToEdit,
  categories,
  userId,
  defaultCategoryId,
  onClose,
  onSave,
  onCreateCategory,
}) => {
  const { t, isRtl } = useTranslation();
  const [isShortcut, setIsShortcut] = useState(recipeToEdit?.isShortcut ?? false);
  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [categoryId, setCategoryId] = useState(
    recipeToEdit?.categoryId || defaultCategoryId || categories[0]?.id || ''
  );
  const [source, setSource] = useState(recipeToEdit?.source || '');
  const [externalUrl, setExternalUrl] = useState(recipeToEdit?.externalUrl || '');
  const [imageUrl, setImageUrl] = useState(recipeToEdit?.imageUrl || '');
  const [notes, setNotes] = useState(recipeToEdit?.notes || '');
  const [prepTime, setPrepTime] = useState<number | ''>(recipeToEdit?.prepTimeMinutes ?? '');
  const [cookTime, setCookTime] = useState<number | ''>(recipeToEdit?.cookTimeMinutes ?? '');
  const [servings, setServings] = useState<number | ''>(recipeToEdit?.servings ?? '');

  // Ingredients and Steps
  const [ingredients, setIngredients] = useState<{ id: string; text: string }[]>(
    recipeToEdit && recipeToEdit.ingredients.length > 0
      ? recipeToEdit.ingredients.map((i) => ({ id: i.id, text: i.ingredientText }))
      : [
          { id: '1', text: '' },
          { id: '2', text: '' },
          { id: '3', text: '' },
        ]
  );

  const [steps, setSteps] = useState<{ id: string; text: string }[]>(
    recipeToEdit && recipeToEdit.steps.length > 0
      ? recipeToEdit.steps.map((s) => ({ id: s.id, text: s.instructionText }))
      : [
          { id: '1', text: '' },
          { id: '2', text: '' },
        ]
  );

  // Quick category creation inside modal
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Bulk ingredients paste helper
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Preset image picker
  const [showImagePresets, setShowImagePresets] = useState(false);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: Math.random().toString(), text: '' }]);
  };

  const handleUpdateIngredient = (index: number, text: string) => {
    const updated = [...ingredients];
    updated[index].text = text;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleMoveIngredient = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === ingredients.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...ingredients];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setIngredients(updated);
  };

  const handleApplyBulkIngredients = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d+.]\s*/, ''))
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      const newItems = lines.map((text) => ({ id: Math.random().toString(), text }));
      setIngredients((prev) => [...prev.filter((i) => i.text.trim() !== ''), ...newItems]);
    }
    setBulkText('');
    setShowBulkPaste(false);
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: Math.random().toString(), text: '' }]);
  };

  const handleUpdateStep = (index: number, text: string) => {
    const updated = [...steps];
    updated[index].text = text;
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleQuickCreateCategory = () => {
    if (!newCatName.trim()) return;
    const cat = onCreateCategory(newCatName.trim(), '#10b981');
    setCategoryId(cat.id);
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(t('form.alert_title_req'));
      return;
    }
    if (!categoryId) {
      alert(t('form.alert_category_req'));
      return;
    }
    if (isShortcut && !externalUrl.trim()) {
      alert(t('form.alert_url_req'));
      return;
    }

    onSave({
      id: recipeToEdit?.id,
      userId,
      categoryId,
      title: title.trim(),
      source: source.trim() || (isShortcut ? 'Web Link' : 'Home Kitchen'),
      externalUrl: externalUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      isShortcut,
      prepTimeMinutes: typeof prepTime === 'number' ? prepTime : undefined,
      cookTimeMinutes: typeof cookTime === 'number' ? cookTime : undefined,
      servings: typeof servings === 'number' ? servings : undefined,
      ingredients: ingredients.map((i) => ({ text: i.text })),
      steps: steps.map((s) => ({ text: s.text })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#141720] border border-[#252c3c] rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252c3c] flex items-center justify-between bg-[#161a24]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {recipeToEdit ? t('form.edit_title') : t('form.add_title')}
              </h2>
              <p className="text-xs text-gray-400">
                {t('form.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Mode Switcher: Full Recipe vs Bookmark Shortcut */}
          <div className="flex p-1 bg-[#191e28] rounded-2xl border border-[#262f3f] gap-1">
            <button
              type="button"
              onClick={() => setIsShortcut(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                !isShortcut
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('form.mode_full')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsShortcut(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isShortcut
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{t('form.mode_shortcut')}</span>
            </button>
          </div>

          {/* Basic Info: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t('form.title_label')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('form.title_placeholder')}
                className="w-full text-sm bg-[#191e28] text-white px-3.5 py-2.5 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {t('form.category_label')} <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('form.new_category_btn')}</span>
                </button>
              </div>

              {showNewCatInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={t('form.new_category_placeholder')}
                    className="flex-1 text-xs bg-[#191e28] text-white px-3 py-2 rounded-xl border border-emerald-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickCreateCategory}
                    className="px-3 py-1.5 text-xs bg-emerald-500 text-black font-semibold rounded-xl"
                  >
                    {t('form.add_cat_btn')}
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs bg-[#191e28] text-white px-3.5 py-2.5 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t('form.source_label')}
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder={t('form.source_placeholder')}
                className="w-full text-xs bg-[#191e28] text-white px-3.5 py-2.5 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bookmark External URL (Prominent if shortcut) */}
          <div className={`${isShortcut ? 'p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl' : ''}`}>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('form.external_url_label')} {isShortcut && <span className="text-rose-400">*</span>}</span>
              </span>
              {isShortcut && <span className="text-[10px] text-indigo-300">{t('form.shortcut_requirement')}</span>}
            </label>
            <input
              type="url"
              required={isShortcut}
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://cooking.nytimes.com/recipes/..."
              className="w-full text-xs bg-[#191e28] text-white px-3.5 py-2.5 rounded-xl border border-[#2b3445] focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('form.cover_image_label')}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowImagePresets(!showImagePresets)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('form.choose_preset_btn')}</span>
              </button>
            </div>

            {/* Presets Grid */}
            {showImagePresets && (
              <div className="p-3 bg-[#191e28] rounded-2xl border border-[#293243] animate-in fade-in">
                <p className="text-[11px] text-gray-400 mb-2">
                  {t('form.presets_guide')}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {FOOD_PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(img.url);
                        setShowImagePresets(false);
                      }}
                      className="group relative h-16 rounded-xl overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all"
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-end p-1">
                        <span className="text-[9px] text-white font-medium truncate drop-shadow">
                          {img.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t('form.image_url_placeholder')}
                className="flex-1 text-xs bg-[#191e28] text-white px-3.5 py-2.5 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
              />

              <label className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-[#222938] hover:bg-[#2c3548] text-gray-200 rounded-xl cursor-pointer border border-[#333d52] transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('form.upload_btn')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {imageUrl && (
              <div className="relative h-28 rounded-xl overflow-hidden border border-[#2b3445] mt-2 w-full max-w-xs">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Recipe Times & Servings (Only for Full Recipes) */}
          {!isShortcut && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  {t('form.prep_time_label')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g. 15"
                  className="w-full text-xs bg-[#191e28] text-white px-3 py-2 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  {t('form.cook_time_label')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g. 25"
                  className="w-full text-xs bg-[#191e28] text-white px-3 py-2 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  {t('form.servings_label')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g. 4"
                  className="w-full text-xs bg-[#191e28] text-white px-3 py-2 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Ingredients Section (Only for Full Recipes) */}
          {!isShortcut && (
            <div className="space-y-3 pt-3 border-t border-[#252c3c]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{t('form.ingredients_section_title')}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkPaste(!showBulkPaste)}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <ListPlus className="w-3 h-3 text-emerald-400" />
                    <span>{t('form.paste_bulk_btn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('form.add_item_btn')}</span>
                  </button>
                </div>
              </div>

              {/* Bulk paste textarea */}
              {showBulkPaste && (
                <div className="p-3 bg-[#191e28] rounded-xl border border-emerald-500/40 space-y-2">
                  <p className="text-[11px] text-gray-400">
                    {t('form.paste_bulk_guide')}
                  </p>
                  <textarea
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={t('form.paste_bulk_placeholder')}
                    className="w-full text-xs bg-[#11141c] text-white p-2.5 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkPaste(false)}
                      className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                    >
                      {t('form.cancel_btn')}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBulkIngredients}
                      className="px-3 py-1 text-xs bg-emerald-500 text-black font-semibold rounded-lg"
                    >
                      {t('form.insert_lines_btn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Ingredients List */}
              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={ing.id || idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500 w-5 text-center">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={ing.text}
                      onChange={(e) => handleUpdateIngredient(idx, e.target.value)}
                      placeholder={`e.g. ${idx === 0 ? '2 tbsp extra-virgin olive oil' : 'ingredient'}`}
                      className="flex-1 text-xs bg-[#191e28] text-white px-3 py-2 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
                    />

                    {/* Move up/down & remove */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveIngredient(idx, 'up')}
                      className="p-1.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 rounded"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === ingredients.length - 1}
                      onClick={() => handleMoveIngredient(idx, 'down')}
                      className="p-1.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 rounded"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Section (Only for Full Recipes) */}
          {!isShortcut && (
            <div className="space-y-3 pt-3 border-t border-[#252c3c]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>{t('form.steps_section_title')}</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('form.add_step_btn')}</span>
                </button>
              </div>

              <div className="space-y-2">
                {steps.map((st, idx) => (
                  <div key={st.id || idx} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#252e3e] text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      {idx + 1}
                    </div>
                    <textarea
                      rows={2}
                      value={st.text}
                      onChange={(e) => handleUpdateStep(idx, e.target.value)}
                      placeholder={t('form.step_placeholder', { number: idx + 1 })}
                      className="flex-1 text-xs bg-[#191e28] text-white p-2.5 rounded-xl border border-[#2b3445] focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 rounded mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-1.5 pt-3 border-t border-[#252c3c]">
            <label className="block text-xs font-semibold text-gray-300">
              {t('form.notes_label')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('form.notes_placeholder')}
              className="w-full text-xs bg-[#191e28] text-white p-3 rounded-xl border border-[#2b3445] focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#252c3c] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl"
            >
              {t('form.cancel_btn')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {recipeToEdit ? t('form.save_changes_btn') : t('form.create_recipe_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
