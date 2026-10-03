import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  List,
  Check,
} from 'lucide-react';
import { FullRecipeData } from '../types/models';
import { useTranslation } from '../i18n/I18nContext';

interface CookModeModalProps {
  recipe: FullRecipeData;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  const { t, isRtl } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showIngredientsPanel, setShowIngredientsPanel] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Kitchen Timer
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const isAllComplete = Object.keys(completedSteps).length === steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0e12] text-gray-100 flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2430] bg-[#12151c]">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            {t('cook_mode.title')}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
            {recipe.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle ingredients panel */}
          <button
            onClick={() => setShowIngredientsPanel(!showIngredientsPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showIngredientsPanel
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#1a1f2b] text-gray-300 border-[#2b3343] hover:text-white'
            }`}
          >
            <List className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t('cook_mode.ingredients_btn')}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[10px]">
              {recipe.ingredients.length}
            </span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1f2b] hover:bg-[#252c3c] text-gray-400 hover:text-white border border-[#2b3343] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#181d28] h-1.5">
        <div
          className="bg-emerald-400 h-full transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-6 sm:p-10 gap-8 overflow-hidden items-center justify-center">
        {/* Step Display Card */}
        <div className="flex-1 w-full max-w-2xl bg-[#141822] border border-[#232a39] rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t('cook_mode.step_x_of_y', { current: currentStepIndex + 1, total: steps.length })}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {t('cook_mode.complete_percent', {
                  percent: Math.round(((currentStepIndex + 1) / steps.length) * 100),
                })}
              </span>
            </div>

            {/* Instruction Text */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-100 leading-relaxed sm:leading-loose">
              {currentStep ? currentStep.instructionText : t('cook_mode.bon_appetit')}
            </p>
          </div>

          {/* Completion status */}
          <div className="pt-6 border-t border-[#232a39] flex items-center justify-between text-xs text-gray-400">
            <span>
              {completedSteps[currentStepIndex] ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> {t('cook_mode.marked_completed')}
                </span>
              ) : (
                t('cook_mode.in_progress')
              )}
            </span>

            <button
              onClick={() =>
                setCompletedSteps((prev) => ({
                  ...prev,
                  [currentStepIndex]: !prev[currentStepIndex],
                }))
              }
              className="text-xs text-gray-400 hover:text-emerald-300 underline"
            >
              {t('cook_mode.toggle_completion')}
            </button>
          </div>
        </div>

        {/* Right Tool: Kitchen Timer & Ingredients Drawer */}
        <div className="w-full md:w-80 space-y-4">
          {/* Kitchen Timer Widget */}
          <div className="bg-[#141822] border border-[#232a39] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {t('cook_mode.kitchen_timer')}
              </span>
              {timerSeconds === 0 && (
                <span className="text-rose-400 font-bold animate-bounce">{t('cook_mode.times_up')}</span>
              )}
            </div>

            {/* Timer digits */}
            <div className="text-center py-2">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-widest">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            {/* Timer controls */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isTimerRunning
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-black'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />}
                <span>{isTimerRunning ? t('cook_mode.pause') : t('cook_mode.start')}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="p-2 rounded-xl bg-[#202735] hover:bg-[#2b3547] text-gray-300 transition-colors"
                title="Reset to 5m"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[1, 3, 5, 10, 15].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(m * 60);
                  }}
                  className="px-2 py-1 rounded-lg text-[10px] bg-[#1d232f] hover:bg-[#272f3f] text-gray-400 hover:text-white"
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Quick Ingredients Sheet */}
          {showIngredientsPanel && (
            <div className="bg-[#141822] border border-[#232a39] rounded-2xl p-4 shadow-lg max-h-60 overflow-y-auto space-y-2 animate-in fade-in">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t('cook_mode.ingredients_checklist')}
              </p>
              {recipe.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  onClick={() =>
                    setCheckedIngredients((prev) => ({
                      ...prev,
                      [ing.id]: !prev[ing.id],
                    }))
                  }
                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                    checkedIngredients[ing.id]
                      ? 'text-gray-500 line-through'
                      : 'text-gray-200 hover:bg-[#1e2432]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedIngredients[ing.id]}
                    onChange={() => {}}
                    className="accent-emerald-400 rounded"
                  />
                  <span>{ing.ingredientText}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between px-6 sm:px-12 py-5 border-t border-[#1f2430] bg-[#12151c]">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl bg-[#1c212e] hover:bg-[#252c3c] text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none font-semibold text-xs sm:text-sm border border-[#293245] transition-all"
        >
          {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          <span>{t('cook_mode.prev_step')}</span>
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <span>{t('cook_mode.next_step')}</span>
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        ) : (
          <button
            onClick={() => {
              setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
              alert(t('cook_mode.celebration_alert'));
              onClose();
            }}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>{t('cook_mode.finish_cooking')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
