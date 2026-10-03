import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  Plus,
  Database,
  Github,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  ExternalLink,
  Lock,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewRecipe: () => void;
  onOpenSqlModal: () => void;
  onOpenDeployModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewRecipe,
  onOpenSqlModal,
  onOpenDeployModal,
  onOpenAuthModal,
}) => {
  const { currentUser, allUsers, switchUser, logout } = useAuth();
  const { t, language, setLanguage, isRtl } = useTranslation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#12151b]/95 backdrop-blur-md border-b border-[#222733] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold ring-1 ring-emerald-400/30">
            <ChefHat className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Velvet<span className="text-emerald-400">Kitchen</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t('app.pro_badge')}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Real-time Global Search */}
        <div className="flex-1 max-w-lg mx-1 sm:mx-2">
          <div className="relative group">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-400 transition-colors ${
                isRtl ? 'right-3.5' : 'left-3.5'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              className={`w-full py-2 text-sm bg-[#181c24] hover:bg-[#1c222c] focus:bg-[#181c24] text-gray-100 placeholder-gray-500 rounded-xl border border-[#29303d] focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner ${
                isRtl ? 'pr-10 pl-9' : 'pl-10 pr-9'
              }`}
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs px-1.5 py-0.5 rounded bg-gray-700/50 ${
                  isRtl ? 'left-3' : 'right-3'
                }`}
              >
                ✕
              </button>
            ) : (
              <kbd
                className={`hidden md:inline-block absolute top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-gray-400 bg-[#232936] rounded border border-gray-700 font-mono ${
                  isRtl ? 'left-3' : 'right-3'
                }`}
              >
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls & User Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Toggle (Hebrew / English) */}
          <div className="flex items-center p-1 bg-[#191e28] rounded-xl border border-[#2b3342] shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="English (LTR)"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('he')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'he'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="עברית (RTL)"
            >
              עב
            </button>
          </div>

          {/* SQL Architecture Explorer */}
          <button
            onClick={onOpenSqlModal}
            title={t('nav.sql_schema')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-[#191e28] hover:bg-[#222938] hover:text-white border border-[#2b3342] rounded-xl transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{t('nav.sql_schema')}</span>
          </button>

          {/* Deployment / GitHub */}
          <button
            onClick={onOpenDeployModal}
            title={t('nav.deploy')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-[#191e28] hover:bg-[#222938] hover:text-white border border-[#2b3342] rounded-xl transition-colors shadow-sm"
          >
            <Github className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{t('nav.deploy')}</span>
          </button>

          {/* New Recipe Button */}
          <button
            onClick={onOpenNewRecipe}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-lg shadow-emerald-500/20 transition-all ring-1 ring-emerald-300/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('nav.new_recipe')}</span>
          </button>

          {/* User Account / Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 px-2 rounded-xl bg-[#191e28] hover:bg-[#222938] border border-[#2b3342] text-gray-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="hidden lg:block text-start">
                <p className="text-xs font-semibold text-gray-200 truncate max-w-[100px]">
                  {currentUser?.name || 'Chef User'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400">{t('nav.data_isolation')}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div
                  className={`absolute mt-2 w-64 rounded-2xl bg-[#161a22] border border-[#2b3342] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="px-3 py-2.5 border-b border-[#252c3a] mb-1">
                    <p className="text-xs font-semibold text-gray-200">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {currentUser?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[11px] text-emerald-300">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>{t('nav.data_isolation')}</span>
                    </div>
                  </div>

                  {/* Multi-account switch */}
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {t('nav.switch_profile')}
                    </p>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          u.id === currentUser?.id
                            ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                            : 'text-gray-300 hover:bg-[#202735]'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        {u.id === currentUser?.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#252c3a] pt-1 mt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-[#202735] rounded-lg transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t('nav.sign_in_another')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.reset_default')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
