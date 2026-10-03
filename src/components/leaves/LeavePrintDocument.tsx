import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';
import { Printer, X, ShieldCheck, ArrowLeft } from 'lucide-react';

interface LeavePrintDocumentProps {
  leave: LeaveRequest;
  onClose: () => void;
}

export const LeavePrintDocument: React.FC<LeavePrintDocumentProps> = ({ leave, onClose }) => {
  const { language, t, companySettings, getEmployeeById } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const employee = getEmployeeById(leave.employeeId);

  const handlePrint = () => {
    window.print();
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
        {/* Controls (Sticky so reachable) */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-30 flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              {t('leaveNumber')} : {leave.requestNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
        <div className="border border-slate-300 rounded-xl p-6 sm:p-8 space-y-6 text-slate-900 bg-white font-sans text-xs sm:text-sm">
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
                <p>{companySettings.address}</p>
                <p>Service Gestion du Personnel & Temps</p>
              </div>
            </div>
            <div className="text-end">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                {leave.requestNumber}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Fait le {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
            <h2 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-slate-900">
              TITRE DE CONGÉ & AUTORISATION D'ABSENCE
            </h2>
            <p className="text-xs font-semibold text-slate-600 font-cairo">
              رخصة عطلة وإذن بالغياب القانوني
            </p>
          </div>

          {/* Employee & Leave breakdown */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Nom & Prénom :</p>
                <p className="font-bold text-slate-900 text-sm">{employee?.firstName} {employee?.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Matricule & Grade :</p>
                <p className="font-semibold text-slate-800">{employee?.matricule} • {employee?.grade.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Département & Fonction :</p>
                <p className="font-semibold text-slate-800">{employee?.department} • {employee?.position}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nature du congé :</p>
                <p className="font-bold text-emerald-800 uppercase">{t(`type_${leave.leaveType}` as any)}</p>
              </div>
            </div>

            {/* Dates & duration */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xs text-emerald-800 font-semibold block">Date Début</span>
                <span className="font-bold text-sm text-slate-900">{leave.startDate}</span>
              </div>
              <div>
                <span className="text-xs text-emerald-800 font-semibold block">Date Fin</span>
                <span className="font-bold text-sm text-slate-900">{leave.endDate}</span>
              </div>
              <div>
                <span className="text-xs text-emerald-800 font-semibold block">Durée Totale</span>
                <span className="font-extrabold text-base text-emerald-700">{leave.totalDays} Jour(s) ouvrable(s)</span>
              </div>
            </div>

            {/* Solde situation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Situation des droits au congé :</span>
              <div className="grid grid-cols-3 gap-2 text-slate-600">
                <div>Droit annuel : <span className="font-bold">{employee?.totalLeaveDays} j</span></div>
                <div>Congés déjà pris : <span className="font-bold">{employee?.usedLeaveDays} j</span></div>
                <div>Solde restant : <span className="font-bold text-indigo-700">{employee?.remainingLeaveDays} j</span></div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-300">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 text-center mb-3">
              {t('docSignaturesSection')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-slate-300 rounded-lg p-3 h-28 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-700">{t('docSignatureBeneficiary')}</span>
                <div className="text-[11px] font-semibold text-slate-800 border-t border-slate-200 pt-1">
                  {employee?.firstName} {employee?.lastName}
                </div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 h-28 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-700">{t('docSignatureManager')}</span>
                <div className="text-[11px] font-semibold text-slate-800 border-t border-slate-200 pt-1">
                  {leave.managerApprovedBy || "Avis Responsable N+1"}
                </div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 h-28 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-700">{t('docSignatureHR')}</span>
                <div className="text-[11px] font-semibold text-slate-800 border-t border-slate-200 pt-1">
                  {companySettings.hrDirectorName}
                </div>
              </div>
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
