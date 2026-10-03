import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ChefHat,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { t, isRtl } = useTranslation();
  const { loginWithEmail, registerWithEmail, loginWithGoogle, switchUser, allUsers } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(t('auth.error_email'));
      return;
    }

    try {
      if (isRegister) {
        await registerWithEmail(name, email);
      } else {
        await loginWithEmail(email, name);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google Auth error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141720] border border-[#252c3c] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 text-white mb-3">
            <ChefHat className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isRegister ? t('auth.create_account_title') : t('auth.welcome_title')}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister
              ? t('auth.create_account_desc')
              : t('auth.welcome_desc')}
          </p>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#1b212c] hover:bg-[#222a38] text-white text-xs font-semibold rounded-xl border border-[#2d3748] transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.continue_google')}</span>
        </button>

        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-[#232b3b] w-full" />
          <span className="bg-[#141720] px-3 text-[10px] font-mono uppercase text-gray-500">
            {t('auth.or_email')}
          </span>
          <div className="border-t border-[#232b3b] w-full" />
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {t('auth.name_label')}
              </label>
              <div className="relative">
                <UserIcon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className={`w-full text-xs py-2.5 bg-[#191e28] text-white rounded-xl border border-[#2c3548] focus:border-emerald-500 focus:outline-none ${
                    isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className={`w-full text-xs py-2.5 bg-[#191e28] text-white rounded-xl border border-[#2c3548] focus:border-emerald-500 focus:outline-none ${
                  isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full text-xs py-2.5 bg-[#191e28] text-white rounded-xl border border-[#2c3548] focus:border-emerald-500 focus:outline-none ${
                  isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{isRegister ? t('auth.btn_create') : t('auth.btn_sign_in')}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {/* Toggle Register/Login */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
          >
            {isRegister
              ? t('auth.have_account')
              : t('auth.dont_have_account')}
          </button>
        </div>

        {/* Demo Fast Switcher */}
        <div className="mt-6 pt-4 border-t border-[#232b3b]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {t('auth.demo_users_title')}
          </p>
          <div className="flex gap-2">
            {allUsers.slice(0, 2).map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  onClose();
                }}
                className="flex-1 p-2 rounded-xl bg-[#191e28] hover:bg-[#202735] text-start border border-[#2a3344] transition-colors"
              >
                <p className="text-xs font-semibold text-gray-200">{u.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
