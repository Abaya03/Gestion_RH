import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseClaim } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { WorkflowStepper } from '../common/WorkflowStepper';
import { 
  Receipt, 
  X, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  AlertTriangle,
  Building,
  DollarSign,
  Landmark,
  Calendar
} from 'lucide-react';
import { numberToWordsFR } from '../../utils/numberToWords';

interface ExpenseClaimDetailsModalProps {
  claim: ExpenseClaim;
  onClose: () => void;
  onOpenPrint: () => void;
}

export const ExpenseClaimDetailsModal: React.FC<ExpenseClaimDetailsModalProps> = ({
  claim,
  onClose,
  onOpenPrint
}) => {
  const { 
    language, 
    t, 
    userRole, 
    getEmployeeById, 
    companySettings, 
    approveExpenseByManager, 
    validateExpenseByHR, 
    rejectExpense,
    missionOrders 
  } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const employee = getEmployeeById(claim.employeeId);
  const employeeName = language === 'ar' && employee?.firstNameAr
    ? `${employee.firstNameAr} ${employee.lastNameAr}`
    : `${employee?.firstName} ${employee?.lastName}`;

  const mission = claim.missionOrderId ? missionOrders.find(m => m.id === claim.missionOrderId) : undefined;

  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'virement' | 'cheque' | 'especes'>('virement');
  const [paymentRef, setPaymentRef] = useState(`VIR-BCI-${Date.now().toString().slice(-4)}`);

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const amountInWords = claim.amountInWords || numberToWordsFR(claim.netPayable || claim.totalExpenses, 'MRU');

  const handleConfirmPayment = () => {
    validateExpenseByHR(claim.id, { method: paymentMethod, ref: paymentRef });
    setShowPaymentInput(false);
    onClose();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    rejectExpense(claim.id, rejectReason);
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base text-slate-900">
                  ÉTAT DE PAIEMENT N°{claim.claimNumber}
                </h2>
                <StatusBadge status={claim.status} />
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

        {/* Workflow Stepper */}
        <WorkflowStepper
          status={claim.status}
          requesterName={employeeName}
          createdAt={claim.submissionDate}
          managerApprovedBy={claim.managerApprovedBy}
          managerApprovedAt={claim.managerApprovedAt}
          hrValidatedBy={claim.hrValidatedBy}
          hrValidatedAt={claim.hrValidatedAt}
          rejectionReason={claim.rejectionReason}
        />

        {/* Beneficiary and Mission info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Bénéficiaire
            </span>
            <div className="font-bold text-slate-900 text-sm">{employeeName}</div>
            <div className="text-slate-600">{employee?.position} • {employee?.department}</div>
            <div className="text-[11px] text-emerald-800 font-mono">
              NNI: {employee?.nni || '1489201934'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Banque & Imputation
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>{claim.bankName || employee?.bankName || 'BCI'}</span>
              <span className="text-slate-400 font-mono text-[11px]">Compte: {claim.bankAccount || employee?.bankAccount || '8984'}</span>
            </div>
            <div className="text-slate-700 font-medium">Imputation : <strong>{claim.imputation || 'IMROP'}</strong></div>
            <div className="text-[11px] text-slate-500">
              Réf OM : <strong>{claim.referenceOM || (mission ? mission.orderNumber : '014')}</strong>
            </div>
          </div>
        </div>

        {/* Motif & Period Details */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Motif de Paiement
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{claim.paymentReason}</p>
            </div>
            <div className="text-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Durée
              </span>
              <span className="font-bold text-slate-900">{claim.daysCount || 6} Jours</span>
              <div className="text-[11px] text-slate-500">
                {claim.missionStartDate || (mission ? mission.departureDate : '')} au {claim.missionEndDate || (mission ? mission.returnDate : '')}
              </div>
            </div>
          </div>

          {/* Rates breakdown */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {claim.perDiemDailyRateEuro ? (
              <>
                <div>
                  <span className="text-slate-500 block">Taux Journalier :</span>
                  <span className="font-bold text-slate-900">{claim.perDiemDailyRateEuro} € / j</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Devises :</span>
                  <span className="font-bold text-slate-900">{claim.totalDevise || (claim.daysCount ? claim.daysCount * claim.perDiemDailyRateEuro : 900)} €</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Taux BCM appliqué :</span>
                  <span className="font-bold bg-[#fef08a] px-1.5 py-0.5 border border-slate-700 text-slate-950">
                    1 € = {claim.bcmRateEuro || 37.14} MRU
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transport :</span>
                  <span className="font-bold text-slate-900">{claim.transportAmountMru || 0} MRU</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-slate-500 block">Taux Journalier :</span>
                  <span className="font-bold text-slate-900">{claim.perDiemDailyRateMru || 2000} MRU / j</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transport :</span>
                  <span className="font-bold text-slate-900">{claim.transportAmountMru || 0} MRU</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Imputation :</span>
                  <span className="font-bold text-slate-900">{claim.imputation || 'IMROP'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Recap and In-Words Statement */}
        <div className="p-4 bg-slate-100 border-2 border-slate-900 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>TOTAL FRAIS CALCULÉ :</span>
            <span className="text-sm font-bold text-slate-900">
              {(claim.totalExpenses || 33426).toLocaleString('fr-FR')} MRU
            </span>
          </div>

          {claim.advanceDeducted > 0 && (
            <div className="flex items-center justify-between text-rose-700 font-semibold">
              <span>Déduction avance :</span>
              <span>- {claim.advanceDeducted.toLocaleString('fr-FR')} MRU</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-sm font-black text-slate-950">
            <span className="uppercase">NET A PERCEVOIR :</span>
            <span className="text-base font-black text-emerald-800">
              {(claim.netPayable || claim.totalExpenses || 33426).toLocaleString('fr-FR')} MRU
            </span>
          </div>

          <div className="pt-2 text-xs border-t border-slate-300 text-slate-800">
            <span className="font-bold">Arrêté le présent état à la somme de : </span>
            <span className="font-bold underline uppercase text-slate-950">
              {amountInWords}
            </span>
          </div>
        </div>

        {/* If paid already */}
        {claim.paymentDate && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Règlement décaissé & clôturé :</span>
              <span className="block text-[11px]">Mode: {claim.paymentMethod?.toUpperCase()} • Réf: {claim.paymentReference} ({claim.paymentDate})</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-bold text-[10px]">
              {t('status_paid')}
            </span>
          </div>
        )}

        {/* HR Disbursement input modal */}
        {showPaymentInput && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-emerald-950">
              Ordonnancement et Bon à Payer (SRH / Comptabilité)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mode de règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="virement">Virement bancaire (BCI)</option>
                  <option value="cheque">Chèque bancaire</option>
                  <option value="especes">Espèces / Caisse régie</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Référence / Numéro bordereau</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowPaymentInput(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer"
              >
                Confirmer l'ordonnancement ({claim.netPayable || claim.totalExpenses} MRU)
              </button>
            </div>
          </div>
        )}

        {/* Rejection input */}
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
              placeholder="Précisez le motif du refus..."
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
            className="px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimer État de Paiement (Modèle IMROP)</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Manager approval button */}
            {userRole === 'manager' && claim.status === 'submitted' && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => {
                    approveExpenseByManager(claim.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('btnApprove')}</span>
                </button>
              </>
            )}

            {/* HR Validate & Pay button */}
            {userRole === 'hr_admin' && (claim.status === 'approved_manager' || claim.status === 'submitted') && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => setShowPaymentInput(true)}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Ordonnancer Paiement</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t('btnClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
