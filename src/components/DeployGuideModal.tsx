import React, { useState } from 'react';
import {
  X,
  Github,
  Globe,
  Terminal,
  Check,
  Copy,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

interface DeployGuideModalProps {
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'github' | 'firebase' | 'vercel'>('github');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const githubCommands = `# 1. Initialize local git repository
git init
git add .
git commit -m "feat: initial commit for VelvetKitchen dark recipe manager"

# 2. Add your GitHub repository remote
git remote add origin https://github.com/YOUR_USERNAME/velvet-kitchen.git
git branch -M main

# 3. Push code to GitHub
git push -u origin main`;

  const githubActionsWorkflow = `# .github/workflows/deploy.yml
name: Deploy Web App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to GitHub Pages (or Firebase / Vercel)
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`;

  const firebaseCommands = `# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in this directory
firebase init hosting
# -> Select "Use an existing project"
# -> Specify "dist" as your public directory
# -> Configure as single-page app (SPA): Yes

# 4. Build and Deploy
npm run build
firebase deploy --only hosting`;

  const vercelCommands = `# Deploy with zero configuration via Vercel CLI
npx vercel

# For production deployment:
npx vercel --prod`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#13161f] border border-[#242c3d] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242c3d] flex items-center justify-between bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{t('deploy.title')}</span>
              </h2>
              <p className="text-xs text-gray-400">
                {t('deploy.subtitle')}
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

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-[#242c3d] bg-[#141822] flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTab('github')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'github'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>{t('deploy.tab_github')}</span>
          </button>

          <button
            onClick={() => setTab('firebase')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'firebase'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{t('deploy.tab_firebase')}</span>
          </button>

          <button
            onClick={() => setTab('vercel')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'vercel'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t('deploy.tab_vercel')}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {tab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                {t('deploy.github_guide')}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>{t('deploy.terminal_commands')}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(githubCommands, 1)}
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? t('deploy.copied') : t('deploy.copy')}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
                  {githubCommands}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{t('deploy.ci_workflow_title')}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(githubActionsWorkflow, 2)}
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 2 ? t('deploy.copied') : t('deploy.copy')}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
                  {githubActionsWorkflow}
                </pre>
              </div>
            </div>
          )}

          {tab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
                {t('deploy.firebase_guide')}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>{t('deploy.firebase_commands')}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(firebaseCommands, 3)}
                    className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? t('deploy.copied') : t('deploy.copy')}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-amber-100 overflow-x-auto leading-relaxed">
                  {firebaseCommands}
                </pre>
              </div>

              <div className="p-4 bg-[#181d28] rounded-2xl border border-[#252f41] space-y-2 text-xs text-gray-300">
                <p className="font-semibold text-white">{t('deploy.included_title')}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 font-mono text-[11px]">
                  <li>{t('deploy.firebase_item_1')}</li>
                  <li>{t('deploy.firebase_item_2')}</li>
                  <li>{t('deploy.firebase_item_3')}</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200">
                {t('deploy.vercel_guide')}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>{t('deploy.vercel_commands')}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(vercelCommands, 4)}
                    className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? t('deploy.copied') : t('deploy.copy')}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {vercelCommands}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
