import React, { useState } from 'react';
import {
  X,
  Database,
  Table,
  Code2,
  Download,
  Copy,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileJson,
} from 'lucide-react';
import {
  exportDatabaseJson,
  generateSqlSchemaScript,
  getAllUsers,
} from '../services/db';
import { useTranslation } from '../i18n/I18nContext';

interface SqlSchemaModalProps {
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ onClose }) => {
  const { t, isRtl } = useTranslation();
  const [activeTab, setActiveTab] = useState<'ddl' | 'tables' | 'json'>('ddl');
  const [copied, setCopied] = useState(false);

  const sqlScript = generateSqlSchemaScript();
  const jsonDump = exportDatabaseJson();
  const parsedJson = JSON.parse(jsonDump);

  const [selectedTable, setSelectedTable] = useState<
    'users' | 'categories' | 'recipes' | 'ingredients' | 'steps' | 'permissions'
  >('recipes');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlScript], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velvet_kitchen_schema_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonDump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velvet_kitchen_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableRecordCounts = {
    users: parsedJson.users?.length || 0,
    categories: parsedJson.categories?.length || 0,
    recipes: parsedJson.recipes?.length || 0,
    ingredients: parsedJson.ingredients?.length || 0,
    steps: parsedJson.steps?.length || 0,
    permissions: parsedJson.permissions?.length || 0,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#13161f] border border-[#242c3d] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242c3d] flex items-center justify-between bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{t('sql.title')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                  {t('sql.entities_badge')}
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {t('sql.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="px-6 py-3 border-b border-[#242c3d] bg-[#141822] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ddl')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ddl'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{t('sql.tab_ddl')}</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'tables'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>{t('sql.tab_tables')}</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f2635]'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>{t('sql.tab_json')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeTab === 'json' ? jsonDump : sqlScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-[#1e2535] hover:bg-[#283247] rounded-xl border border-[#303c54] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('sql.copied') : t('sql.copy_output')}</span>
            </button>

            {activeTab === 'json' ? (
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('sql.export_json')}</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadSql}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('sql.export_sql')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'ddl' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 flex items-center justify-between">
                <span>{t('sql.ddl_guide')}</span>
                <span className="font-mono text-[11px] text-blue-300">{t('sql.ansi_badge')}</span>
              </div>
              <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]" dir="ltr">
                {sqlScript}
              </pre>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              {/* Entity Picker Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'users', label: 'users', count: tableRecordCounts.users },
                  { key: 'categories', label: 'categories', count: tableRecordCounts.categories },
                  { key: 'recipes', label: 'recipes', count: tableRecordCounts.recipes },
                  { key: 'ingredients', label: 'recipe_ingredients', count: tableRecordCounts.ingredients },
                  { key: 'steps', label: 'recipe_steps', count: tableRecordCounts.steps },
                  { key: 'permissions', label: 'recipe_permissions', count: tableRecordCounts.permissions },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedTable(item.key as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      selectedTable === item.key
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'bg-[#181d28] text-gray-400 hover:text-white border border-[#252e3f]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table Data View */}
              <div className="bg-[#0f121a] border border-[#222938] rounded-2xl overflow-x-auto" dir="ltr">
                <table className="w-full text-left text-xs text-gray-300 font-mono">
                  <thead className="bg-[#181e2b] text-gray-400 uppercase text-[10px] border-b border-[#252f42]">
                    <tr>
                      {selectedTable === 'users' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">name</th>
                          <th className="p-3">email</th>
                          <th className="p-3">created_at</th>
                        </>
                      )}
                      {selectedTable === 'categories' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">user_id</th>
                          <th className="p-3">name</th>
                          <th className="p-3">color</th>
                          <th className="p-3">created_at</th>
                        </>
                      )}
                      {selectedTable === 'recipes' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">user_id</th>
                          <th className="p-3">category_id</th>
                          <th className="p-3">title</th>
                          <th className="p-3">source</th>
                          <th className="p-3">is_shortcut</th>
                        </>
                      )}
                      {selectedTable === 'ingredients' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">recipe_id</th>
                          <th className="p-3">ingredient_text</th>
                          <th className="p-3">ingredient_order</th>
                        </>
                      )}
                      {selectedTable === 'steps' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">recipe_id</th>
                          <th className="p-3">instruction_text</th>
                          <th className="p-3">step_number</th>
                        </>
                      )}
                      {selectedTable === 'permissions' && (
                        <>
                          <th className="p-3">id</th>
                          <th className="p-3">recipe_id</th>
                          <th className="p-3">user_id</th>
                          <th className="p-3">access_level</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2535]">
                    {(parsedJson[selectedTable] || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                          {t('sql.no_records')}
                        </td>
                      </tr>
                    ) : (
                      (parsedJson[selectedTable] || []).map((row: any, idx: number) => (
                        <tr key={row.id || idx} className="hover:bg-[#161b26]">
                          {selectedTable === 'users' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-white font-sans">{row.name}</td>
                              <td className="p-3 text-gray-400">{row.email}</td>
                              <td className="p-3 text-gray-500">{row.createdAt}</td>
                            </>
                          )}
                          {selectedTable === 'categories' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-blue-400">{row.userId}</td>
                              <td className="p-3 text-white font-sans">{row.name}</td>
                              <td className="p-3">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle"
                                  style={{ backgroundColor: row.color }}
                                />
                                {row.color}
                              </td>
                              <td className="p-3 text-gray-500">{row.createdAt}</td>
                            </>
                          )}
                          {selectedTable === 'recipes' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-blue-400">{row.userId}</td>
                              <td className="p-3 text-amber-400">{row.categoryId}</td>
                              <td className="p-3 text-white font-sans font-medium">{row.title}</td>
                              <td className="p-3 text-gray-400">{row.source}</td>
                              <td className="p-3">{row.isShortcut ? 'TRUE' : 'FALSE'}</td>
                            </>
                          )}
                          {selectedTable === 'ingredients' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-amber-400">{row.recipeId}</td>
                              <td className="p-3 text-gray-200 font-sans">{row.ingredientText}</td>
                              <td className="p-3 text-blue-400">{row.order}</td>
                            </>
                          )}
                          {selectedTable === 'steps' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-amber-400">{row.recipeId}</td>
                              <td className="p-3 text-gray-200 font-sans">{row.instructionText}</td>
                              <td className="p-3 text-blue-400">{row.stepNumber}</td>
                            </>
                          )}
                          {selectedTable === 'permissions' && (
                            <>
                              <td className="p-3 text-emerald-400">{row.id}</td>
                              <td className="p-3 text-amber-400">{row.recipeId}</td>
                              <td className="p-3 text-blue-400">{row.userId}</td>
                              <td className="p-3 text-purple-400 uppercase font-semibold">
                                {row.accessLevel}
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
                <span>{t('sql.json_guide')}</span>
                <span className="font-mono text-[11px] text-emerald-400">{t('sql.snapshot_badge')}</span>
              </div>
              <pre className="p-4 bg-[#0d1017] border border-[#222938] rounded-2xl text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]" dir="ltr">
                {jsonDump}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
