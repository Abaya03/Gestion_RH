import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InternalMemo } from '../../types';
import { Printer, X, ShieldCheck, ArrowLeft } from 'lucide-react';

interface MemoPrintDocumentProps {
  memo: InternalMemo;
  onClose: () => void;
}

export const MemoPrintDocument: React.FC<MemoPrintDocumentProps> = ({ memo, onClose }) => {
  const { language, t, companySettings, employees } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const getTargetText = () => {
    if (memo.targetAudience === 'all') return "L'ensemble du personnel de l'entreprise";
    if (memo.targetAudience === 'department') return `Personnel du département : ${memo.targetDepartment}`;
    return "Cadres & Responsables hiérarchiques";
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 print:shadow-none print:p-4 print:border-none print:w-full cursor-default relative my-auto"
      >
        {/* Controls */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-30 flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-base text-slate-900">
              {memo.memoNumber} - {t('navMemos')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btnPrint')}</span>
            </button>
            <button
              onClick={onClose}
              title="Fermer la fenêtre (Échap)"
              className="p-2 text-slate-600 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Fermer</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT */}
        <div className="border-2 border-slate-900 rounded-xl p-6 sm:p-8 space-y-6 text-slate-900 bg-white font-sans text-xs sm:text-sm">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="font-black text-base sm:text-lg uppercase tracking-tight text-slate-900">
                {companySettings.name}
              </h1>
              {companySettings.nameAr && (
                <p className="text-xs font-semibold text-slate-600 font-cairo">
                  {companySettings.nameAr}
                </p>
              )}
              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <p>Direction des Ressources Humaines & Affaires Générales</p>
                <p>{companySettings.address}</p>
              </div>
            </div>
            <div className="text-end">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                {memo.memoNumber}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Fait à Casablanca, le {memo.publishedDate}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-3 bg-purple-50/60 rounded-lg border border-purple-200">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block mb-1">
              COMMUNICATION INTERNE OFFICIELLE
            </span>
            <h2 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-slate-900">
              NOTE DE SERVICE N° {memo.memoNumber}
            </h2>
            <p className="text-xs font-bold text-purple-900 font-cairo mt-0.5">
              مذكرة إدارية داخلية
            </p>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500">De la part de :</span>{' '}
              <span className="font-bold text-slate-900">{companySettings.hrDirectorName} (Direction RH)</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Date d'effet :</span>{' '}
              <span className="font-semibold text-slate-800">{memo.effectiveDate || memo.publishedDate}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-500">Destinataires :</span>{' '}
              <span className="font-bold text-indigo-700">{getTargetText()}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-500">Objet :</span>{' '}
              <span className="font-extrabold text-slate-900 text-sm">{memo.title}</span>
            </div>
            {memo.titleAr && (
              <div className="col-span-2 text-end font-cairo font-bold text-slate-800">
                <span className="font-normal text-slate-500">الموضوع : </span>
                {memo.titleAr}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="space-y-4 py-2">
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {memo.content}
            </div>

            {memo.contentAr && (
              <div className="pt-4 border-t border-slate-200 text-end font-cairo text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm" dir="rtl">
                {memo.contentAr}
              </div>
            )}
          </div>

          {/* Legal Posting Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold">Affichage obligatoire :</span> Cette note de service est diffusée par voie électronique à tous les intéressés et affichée sur le tableau officiel des communications de l'entreprise.
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Système d'émargement électronique RH Pro • {memo.readReceipts.length} accusé(s) de lecture
            </div>
            <div className="text-center w-56 border border-slate-300 rounded-lg p-3">
              <span className="text-[11px] font-bold text-slate-700 block">La Direction des Ressources Humaines</span>
              <div className="my-2 text-[10px] text-indigo-700 font-bold bg-indigo-50 py-1 rounded">
                ★ CACHET DIRECTION GÉNÉRALE
              </div>
              <span className="text-xs font-semibold text-slate-900">{companySettings.hrDirectorName}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden when printing) */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Fermer l'aperçu d'impression</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
