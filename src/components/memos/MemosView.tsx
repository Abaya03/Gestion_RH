import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InternalMemo } from '../../types';
import { exportMemosToExcel } from '../../utils/exportUtils';
import { 
  FileText, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Users, 
  AlertCircle,
  Paperclip,
  Check
} from 'lucide-react';

interface MemosViewProps {
  onOpenNewMemo: () => void;
  onViewMemo: (id: string) => void;
  onPrintMemo: (memo: InternalMemo) => void;
}

export const MemosView: React.FC<MemosViewProps> = ({
  onOpenNewMemo,
  onViewMemo,
  onPrintMemo
}) => {
  const { 
    language, 
    t, 
    currentEmployee, 
    employees, 
    internalMemos, 
    acknowledgeMemo 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const filteredMemos = internalMemos.filter(memo => {
    const matchSearch = 
      memo.memoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (memo.titleAr && memo.titleAr.includes(searchTerm)) ||
      memo.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || memo.category === selectedCategory;
    const matchUrgent = !onlyUrgent || memo.isUrgent;

    return matchSearch && matchCategory && matchUrgent;
  });

  const handleExport = () => {
    exportMemosToExcel(filteredMemos, employees.length, language);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">{t('memoTitle')}</h1>
              <p className="text-xs text-slate-500">{t('memoSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('btnExportExcel')}</span>
          </button>

          <button
            onClick={onOpenNewMemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newMemo')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="administrative">{t('cat_administrative')}</option>
              <option value="technical">{t('cat_technical')}</option>
              <option value="security">{t('cat_security')}</option>
              <option value="hr">{t('cat_hr')}</option>
              <option value="event">{t('cat_event')}</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUrgent}
                onChange={(e) => setOnlyUrgent(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span>{language === 'ar' ? 'المذكرات العاجلة فقط' : 'Uniquement notes urgentes'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Memos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemos.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            {t('tableEmpty')}
          </div>
        ) : (
          filteredMemos.map((memo) => {
            const isRead = memo.readReceipts.some(r => r.employeeId === currentEmployee.id);
            const audienceCount = memo.targetAudience === 'all' 
              ? employees.length 
              : memo.targetAudience === 'department' 
              ? employees.filter(e => e.department === memo.targetDepartment).length
              : employees.filter(e => e.role === 'manager' || e.role === 'hr_admin').length;

            const readPct = Math.round((memo.readReceipts.length / (audienceCount || 1)) * 100);

            return (
              <div
                key={memo.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  memo.isUrgent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                      {memo.memoNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {memo.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {t('urgentMemo')}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">{memo.publishedDate}</span>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <h3 
                    onClick={() => onViewMemo(memo.id)}
                    className="font-extrabold text-sm text-slate-900 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {language === 'ar' && memo.titleAr ? memo.titleAr : memo.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {language === 'ar' && memo.contentAr ? memo.contentAr : memo.content}
                  </p>

                  {memo.attachmentName && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                      <span className="truncate">{memo.attachmentName}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Emargement bar & action */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{memo.readReceipts.length} / {audienceCount} {t('readReceiptsCount')}</span>
                      </span>
                      <span className="font-bold text-purple-700">{readPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${readPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* User read status / 1-click button */}
                    {!isRead ? (
                      <button
                        onClick={() => acknowledgeMemo(memo.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('btnAcknowledgeMemo')}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('statusRead')}</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewMemo(memo.id)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title={t('btnViewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPrintMemo(memo)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title={t('btnPrint')}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
