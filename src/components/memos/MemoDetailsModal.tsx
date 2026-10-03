import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InternalMemo } from '../../types';
import { 
  FileText, 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Users, 
  Check, 
  Download, 
  AlertCircle,
  Paperclip
} from 'lucide-react';

interface MemoDetailsModalProps {
  memo: InternalMemo;
  onClose: () => void;
  onOpenPrint: () => void;
}

export const MemoDetailsModal: React.FC<MemoDetailsModalProps> = ({ memo, onClose, onOpenPrint }) => {
  const { 
    language, 
    t, 
    currentEmployee, 
    employees, 
    acknowledgeMemo 
  } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isUserRead = memo.readReceipts.some(r => r.employeeId === currentEmployee.id);
  const userReceipt = memo.readReceipts.find(r => r.employeeId === currentEmployee.id);

  // Audience list
  const targetedEmployees = employees.filter(emp => {
    if (memo.targetAudience === 'all') return true;
    if (memo.targetAudience === 'department') return emp.department === memo.targetDepartment;
    if (memo.targetAudience === 'managers') return emp.role === 'manager' || emp.role === 'hr_admin';
    return true;
  });

  const readCount = memo.readReceipts.length;
  const targetTotal = targetedEmployees.length;
  const readPercentage = Math.round((readCount / (targetTotal || 1)) * 100);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default relative my-auto"
      >
        {/* Header */}
        <div className="sticky -top-6 -mt-6 pt-6 -mx-6 px-6 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base text-slate-900">{memo.memoNumber}</h2>
                {memo.isUrgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {t('urgentMemo')}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium">{memo.publishedDate}</span>
              </div>
              <p className="text-xs text-slate-500">{t('memoTitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer (Échap)"
            className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Fermer</span>
          </button>
        </div>

        {/* User Read Acknowledgment Bar */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isUserRead 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-purple-50/70 border-purple-200 text-purple-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {isUserRead ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-purple-600 shrink-0 animate-bounce" />
            )}
            <div>
              <div className="font-bold text-xs">
                {isUserRead ? "Accusé de réception électronique enregistré" : "Émargement numérique requis"}
              </div>
              <div className="text-[11px] text-slate-600">
                {isUserRead 
                  ? `Vous avez pris connaissance de cette note le ${new Date(userReceipt?.readAt || '').toLocaleDateString('fr-FR')} à ${new Date(userReceipt?.readAt || '').toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : "Veuillez confirmer que vous avez lu et pris note des directives ci-dessous."}
              </div>
            </div>
          </div>

          {!isUserRead && (
            <button
              onClick={() => acknowledgeMemo(memo.id)}
              className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('btnAcknowledgeMemo')}</span>
            </button>
          )}
        </div>

        {/* Titles and Content */}
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h3 className="font-extrabold text-sm text-slate-900">
              {memo.title}
            </h3>
            {memo.titleAr && (
              <h4 className="font-bold text-sm text-slate-700 font-cairo text-end">
                {memo.titleAr}
              </h4>
            )}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Auteur: {memo.authorName} ({memo.authorRole})</span>
              <span>•</span>
              <span>Cible: {memo.targetAudience === 'all' ? 'Tout le personnel' : memo.targetDepartment}</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl max-h-60 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {memo.content}
            </div>

            {memo.contentAr && (
              <div className="pt-3 border-t border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-cairo text-end" dir="rtl">
                {memo.contentAr}
              </div>
            )}
          </div>

          {memo.attachmentName && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Paperclip className="w-4 h-4 text-purple-600" />
                <span>{memo.attachmentName}</span>
              </div>
              <span className="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer">
                Consulter
              </span>
            </div>
          )}
        </div>

        {/* Live Read Receipts Emargement list */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>{t('readReceiptsCount')} ({readCount} / {targetTotal})</span>
            </span>
            <span className="text-purple-700">{readPercentage}% {t('readReceiptsPercentage')}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${readPercentage}%` }}
            />
          </div>

          {/* Collapsible/compact list of signatures */}
          <div className="pt-2 max-h-28 overflow-y-auto space-y-1">
            {memo.readReceipts.map(receipt => (
              <div key={receipt.id} className="text-[11px] flex items-center justify-between py-1 border-b border-slate-200/50">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="font-medium">{receipt.employeeName}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">
                  {new Date(receipt.readAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onOpenPrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-purple-600" />
            <span>{t('btnPrint')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            {t('btnClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
