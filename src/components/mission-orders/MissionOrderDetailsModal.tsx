import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MissionOrder } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { WorkflowStepper } from '../common/WorkflowStepper';
import { 
  Compass, 
  X, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Receipt, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Users,
  Plane,
  Car,
  Building2
} from 'lucide-react';

interface MissionOrderDetailsModalProps {
  mission: MissionOrder;
  onClose: () => void;
  onOpenPrint: () => void;
  onNavigateToExpense?: (expenseId: string) => void;
}

export const MissionOrderDetailsModal: React.FC<MissionOrderDetailsModalProps> = ({
  mission,
  onClose,
  onOpenPrint,
  onNavigateToExpense
}) => {
  const { 
    language, 
    t, 
    userRole, 
    currentEmployee, 
    getEmployeeById, 
    companySettings,
    approveMissionByManager,
    validateMissionByHR,
    rejectMission,
    generateExpenseClaimFromMission,
    expenseClaims,
    setActiveTab
  } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const employee = getEmployeeById(mission.employeeId);
  const employeeName = language === 'ar' && employee?.firstNameAr
    ? `${employee.firstNameAr} ${employee.lastNameAr}`
    : `${employee?.firstName} ${employee?.lastName}`;

  const isMale = employee?.civility !== 'Madame';
  const isAbroad = mission.destinationType === 'a_letranger';

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const linkedExpense = mission.linkedExpenseClaimId 
    ? expenseClaims.find(e => e.id === mission.linkedExpenseClaimId) 
    : undefined;

  const handleGenerateExpense = () => {
    const claim = generateExpenseClaimFromMission(mission.id);
    if (claim) {
      if (onNavigateToExpense) {
        onNavigateToExpense(claim.id);
      } else {
        setActiveTab('expenses');
        onClose();
      }
    }
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    rejectMission(mission.id, rejectReason);
    setShowRejectInput(false);
    onClose();
  };

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
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base text-slate-900">
                  ORDRE DE MISSION N°{mission.orderNumber}
                </h2>
                <StatusBadge status={mission.status} />
              </div>
              <p className="text-xs text-slate-500">Institut Mauritanien de Recherches Océanographiques et des Pêches</p>
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

        {/* Workflow Visual Stepper */}
        <WorkflowStepper
          status={mission.status}
          requesterName={employeeName}
          createdAt={mission.createdAt}
          managerApprovedBy={mission.managerApprovedBy}
          managerApprovedAt={mission.managerApprovedAt}
          hrValidatedBy={mission.hrValidatedBy}
          hrValidatedAt={mission.hrValidatedAt}
          rejectionReason={mission.rejectionReason}
        />

        {/* Mission Details Cards matching IMROP Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Agent Missionné */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Agent missionné
            </span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded">
                {isMale ? 'Monsieur' : 'Madame'}
              </span>
              <span>{employeeName}</span>
            </div>
            <div className="text-slate-600 font-medium">{employee?.position} • {employee?.department}</div>
            <div className="text-[11px] text-sky-800 font-mono">
              Matricule: {employee?.matricule} • NNI: {employee?.nni || '1489201934'}
            </div>
          </div>

          {/* Se rend & Précisions */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Destination & Lieu
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[11px] font-semibold">
                {isAbroad ? 'à l’étranger' : 'en Mauritanie'}
              </span>
              <span className="truncate">{mission.destinationPrecisions || mission.destination}</span>
            </div>
            <div className="text-slate-600 flex items-center gap-1.5">
              {mission.transportSelection === 'avion' || mission.transportMode === 'avion' ? (
                <Plane className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Car className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Transport : {mission.transportSelection === 'avion' ? 'Avion' : 'Voiture'} {mission.transportDetails ? `(${mission.transportDetails})` : ''}</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Du {mission.departureDate} au {mission.returnDate}
            </div>
          </div>

          {/* Motif de la mission */}
          <div className="col-span-1 sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Motif de la mission
            </span>
            <p className="text-slate-900 font-medium leading-relaxed">{mission.purpose}</p>
          </div>

          {/* Autres Membres de la mission */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" />
              <span>Autres Membres de la mission</span>
            </span>
            <p className="text-slate-800 font-medium">{mission.otherMembers || 'Néant'}</p>
          </div>

          {/* Imputation Budgétaire */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              <span>Imputation Budgétaire</span>
            </span>
            <p className="text-slate-900 font-bold">
              {mission.budgetImputation === 'IMROP' || !mission.budgetImputation ? 'IMROP (Budget de fonctionnement)' : `Autre : ${mission.budgetImputationOther || 'Projet externe'}`}
            </p>
          </div>

          {/* DÉCOMPTE FINANCIER DE LA MISSION (Jours x Taux + Transport Saisi Manuel) */}
          <div className="col-span-1 sm:col-span-2 p-4 bg-linear-to-br from-indigo-50/70 via-sky-50/50 to-emerald-50/50 border-2 border-indigo-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  MRU
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">
                    {language === 'ar' ? 'التفاصيل المالية للمهمة (المعادلة المعتمدة)' : 'Décompte Financier de la Mission'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ({mission.daysCount || 1} jours × {mission.dailyRate || 2500} {isAbroad ? '€' : 'MRU'}) + {mission.transportCost || 0} MRU Transport = {(mission.totalMissionFees || mission.estimatedBudget || 0).toLocaleString()} MRU
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'ar' ? 'نظام موريتاني' : 'Norme RIM'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/90 p-2 rounded-xl border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'ar' ? 'المدة المحسوبة :' : 'Durée mission :'}
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {mission.daysCount || 1} {language === 'ar' ? 'يوم' : 'jour(s)'}
                </span>
              </div>

              <div className="bg-white/90 p-2 rounded-xl border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'ar' ? 'التعويض اليومي :' : 'Taux journalier :'}
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {(mission.dailyRate || 2500).toLocaleString()} {isAbroad ? '€/j' : 'MRU/j'}
                </span>
              </div>

              <div className="bg-white/90 p-2 rounded-xl border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'ar' ? 'النقل (سخّره يدوي) :' : 'Transport manuel :'}
                </span>
                <span className="font-bold text-sky-800 font-mono">
                  {(mission.transportCost || 0).toLocaleString()} MRU
                </span>
              </div>

              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
                <span className="text-[10px] text-indigo-200 block font-bold uppercase">
                  {language === 'ar' ? 'المجموع الكلي :' : 'Total Frais OM :'}
                </span>
                <span className="font-black text-sm font-mono text-emerald-200">
                  {(mission.totalMissionFees || mission.estimatedBudget || 0).toLocaleString()} MRU
                </span>
              </div>
            </div>

            {/* Advance details if requested */}
            {mission.advanceRequested && (
              <div className="p-2 bg-white/90 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] text-slate-700">
                <span>
                  {language === 'ar' ? 'السلفة المسلمة للموظف (تسبيق) :' : 'Avance demandée sur la mission :'} 
                  <strong className="text-amber-700 font-mono ms-1">{mission.advanceAmount?.toLocaleString() || 0} MRU</strong>
                </span>
                <span>
                  {language === 'ar' ? 'الباقي عند تصفية المهمة :' : 'Reliquat à décompter au retour :'} 
                  <strong className="text-emerald-700 font-mono ms-1">
                    {Math.max(0, (mission.totalMissionFees || mission.estimatedBudget || 0) - (mission.advanceAmount || 0)).toLocaleString()} MRU
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Module 2 Expense Claim Connection (if validated) */}
          {mission.status === 'validated_hr' && (
            <div className="col-span-1 sm:col-span-2 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">État des Frais de Mission (IMROP)</span>
                  <span className="text-[11px] text-emerald-700">Décompte officiel des indemnités de déplacement</span>
                </div>
              </div>

              <div>
                {linkedExpense ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('alreadyLinked')} (N°{linkedExpense.claimNumber})</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateExpense}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Générer l'État de Frais (Décompte)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reject input prompt */}
        {showRejectInput && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('rejectionReasonPrompt')}</span>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none"
              placeholder="Précisez la raison..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg disabled:opacity-50"
              >
                {t('btnReject')}
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
          <button
            onClick={onOpenPrint}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-sky-700" />
            <span>Imprimer Ordre de Mission (PDF)</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Manager approval button */}
            {userRole === 'manager' && mission.status === 'pending_manager' && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => {
                    approveMissionByManager(mission.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('btnApprove')}</span>
                </button>
              </>
            )}

            {/* HR Final validation button */}
            {userRole === 'hr_admin' && (mission.status === 'approved_manager' || mission.status === 'pending_manager') && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => {
                    validateMissionByHR(mission.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider Ordre de Mission</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('btnClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
