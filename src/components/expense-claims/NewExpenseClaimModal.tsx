import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, ExpenseItem } from '../../types';
import { Receipt, X, Plus, Trash2, Calculator, AlertCircle, Check, DollarSign, Building2, Banknote } from 'lucide-react';
import { numberToWordsFR } from '../../utils/numberToWords';

interface NewExpenseClaimModalProps {
  onClose: () => void;
  preselectedMissionId?: string;
}

export const NewExpenseClaimModal: React.FC<NewExpenseClaimModalProps> = ({ onClose, preselectedMissionId }) => {
  const { 
    language, 
    t, 
    employees, 
    currentEmployeeId, 
    missionOrders, 
    createExpenseClaim, 
    companySettings, 
    getEmployeeById 
  } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [employeeId, setEmployeeId] = useState<string>(currentEmployeeId || employees[0]?.id || '');
  const [missionOrderId, setMissionOrderId] = useState<string>(preselectedMissionId || '');
  
  const [paymentReason, setPaymentReason] = useState('Régularisation frais de mission');
  const [referenceOM, setReferenceOM] = useState('');
  const [missionStartDate, setMissionStartDate] = useState('');
  const [missionEndDate, setMissionEndDate] = useState('');
  const [daysCount, setDaysCount] = useState<number>(6);
  
  // Rates & Financials
  const [currencyType, setCurrencyType] = useState<'EUR' | 'MRU' | 'USD'>('EUR');
  const [perDiemDailyRateEuro, setPerDiemDailyRateEuro] = useState<number>(150);
  const [perDiemDailyRateMru, setPerDiemDailyRateMru] = useState<number>(0);
  const [perDiemDailyRateDollar, setPerDiemDailyRateDollar] = useState<number>(0);
  const [transportAmountMru, setTransportAmountMru] = useState<number>(0);
  
  // BCM Rates
  const [bcmRateEuro, setBcmRateEuro] = useState<number>(37.14);
  const [bcmRateDollar, setBcmRateDollar] = useState<number>(0);
  
  // Banking & Imputation
  const [bankName, setBankName] = useState('BCI');
  const [bankAccount, setBankAccount] = useState('');
  const [imputation, setImputation] = useState('IMROP');
  
  const [advanceDeducted, setAdvanceDeducted] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedEmployee = getEmployeeById(employeeId);
  const userMissions = missionOrders.filter(m => m.employeeId === employeeId);

  // When employee changes, update bank details
  useEffect(() => {
    if (selectedEmployee) {
      if (selectedEmployee.bankName) setBankName(selectedEmployee.bankName);
      if (selectedEmployee.bankAccount) setBankAccount(selectedEmployee.bankAccount);
    }
  }, [employeeId, selectedEmployee]);

  // When mission changes or initialized, pre-fill info
  useEffect(() => {
    if (preselectedMissionId) {
      handleMissionSelect(preselectedMissionId);
    } else if (missionOrderId) {
      handleMissionSelect(missionOrderId);
    }
  }, [preselectedMissionId]);

  const handleMissionSelect = (omId: string) => {
    setMissionOrderId(omId);
    if (!omId) return;
    const mission = missionOrders.find(m => m.id === omId);
    if (mission) {
      setEmployeeId(mission.employeeId);
      setReferenceOM(mission.orderNumber.length > 3 ? mission.orderNumber.slice(-3) : mission.orderNumber);
      setMissionStartDate(mission.departureDate.split('-').reverse().join('/'));
      setMissionEndDate(mission.returnDate.includes('-') ? mission.returnDate.split('-').reverse().join('/') : mission.returnDate);
      setPaymentReason(`Régularisation frais de mission à ${mission.destinationPrecisions || mission.destination}`);
      
      if (mission.budgetImputation === 'IMROP' || !mission.budgetImputation) {
        setImputation('IMROP');
      } else {
        setImputation(mission.budgetImputationOther || 'Autre');
      }

      if (mission.advanceRequested) {
        setAdvanceDeducted(mission.advanceAmount);
      }

      if (mission.destinationType === 'a_letranger') {
        setCurrencyType('EUR');
        setPerDiemDailyRateEuro(150);
        setPerDiemDailyRateMru(0);
      } else {
        setCurrencyType('MRU');
        setPerDiemDailyRateMru(2000);
        setPerDiemDailyRateEuro(0);
      }
    }
  };

  // Calculations
  const totalEuro = currencyType === 'EUR' ? daysCount * (perDiemDailyRateEuro || 0) : 0;
  const totalDollar = currencyType === 'USD' ? daysCount * (perDiemDailyRateDollar || 0) : 0;
  
  let calculatedTotalMru = 0;
  if (currencyType === 'EUR') {
    calculatedTotalMru = Math.round(totalEuro * bcmRateEuro) + (transportAmountMru || 0);
  } else if (currencyType === 'USD') {
    calculatedTotalMru = Math.round(totalDollar * (bcmRateDollar || 35)) + (transportAmountMru || 0);
  } else {
    calculatedTotalMru = (daysCount * (perDiemDailyRateMru || 0)) + (transportAmountMru || 0);
  }

  const netPayable = Math.max(0, calculatedTotalMru - Number(advanceDeducted || 0));
  const amountInWords = numberToWordsFR(netPayable, 'MRU');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReason.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد سبب الدفع' : 'Veuillez renseigner le motif de paiement.');
      return;
    }
    if (calculatedTotalMru <= 0) {
      setError('Le montant total doit être supérieur à 0.');
      return;
    }

    const items: ExpenseItem[] = [
      {
        id: `item-${Date.now()}-1`,
        category: 'per_diem',
        description: `Indemnités journalières (${daysCount} jours ${currencyType === 'EUR' ? `@ ${perDiemDailyRateEuro} €/j` : `@ ${perDiemDailyRateMru} MRU/j`})`,
        date: new Date().toISOString().slice(0, 10),
        amount: calculatedTotalMru,
        quantity: daysCount,
        unitPrice: currencyType === 'EUR' ? perDiemDailyRateEuro : perDiemDailyRateMru
      }
    ];

    if (transportAmountMru > 0) {
      items.push({
        id: `item-${Date.now()}-2`,
        category: 'transport',
        description: 'Frais de transport / carburant / péage',
        date: new Date().toISOString().slice(0, 10),
        amount: transportAmountMru
      });
    }

    createExpenseClaim({
      employeeId,
      missionOrderId: missionOrderId || undefined,
      paymentReason,
      referenceOM: referenceOM || undefined,
      missionStartDate,
      missionEndDate,
      daysCount,
      perDiemDailyRateMru: perDiemDailyRateMru || 0,
      transportAmountMru: transportAmountMru || 0,
      perDiemDailyRateDollar: perDiemDailyRateDollar || 0,
      perDiemDailyRateEuro: perDiemDailyRateEuro || 0,
      totalDevise: currencyType === 'EUR' ? totalEuro : (currencyType === 'USD' ? totalDollar : undefined),
      bcmRateEuro,
      bcmRateDollar,
      bankName: bankName || selectedEmployee?.bankName || 'BCI',
      bankAccount: bankAccount || selectedEmployee?.bankAccount || '8984',
      imputation: imputation || 'IMROP',
      amountInWords,
      items,
      totalExpenses: calculatedTotalMru,
      advanceDeducted: Number(advanceDeducted) || 0,
      netPayable,
      notes: notes || undefined
    });

    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default relative my-auto"
      >
        {/* Header */}
        <div className="sticky -top-6 -mt-6 pt-6 -mx-6 px-6 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Nouvel État de Paiement (Décompte Frais de Mission)</h2>
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

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top selection: Beneficiary & Linked OM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bénéficiaire (Agent IMROP) *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.position} (NNI: {emp.nni || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ordre de Mission associé
              </label>
              <select
                value={missionOrderId}
                onChange={(e) => handleMissionSelect(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Sélectionner un Ordre de Mission --</option>
                {userMissions.map(m => (
                  <option key={m.id} value={m.id}>
                    OM N°{m.orderNumber} ({m.destinationPrecisions || m.destination})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motif & Référence OM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motif Paiement *
              </label>
              <input
                type="text"
                required
                value={paymentReason}
                onChange={(e) => setPaymentReason(e.target.value)}
                placeholder="Ex: Régularisation frais de mission à Dakar"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Réf OM (N°)
              </label>
              <input
                type="text"
                value={referenceOM}
                onChange={(e) => setReferenceOM(e.target.value)}
                placeholder="Ex: 014"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Dates & Durée */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Date Début (jj/mm/aaaa)
              </label>
              <input
                type="text"
                value={missionStartDate}
                onChange={(e) => setMissionStartDate(e.target.value)}
                placeholder="01/03/2023"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Date Fin (jj/mm/aaaa)
              </label>
              <input
                type="text"
                value={missionEndDate}
                onChange={(e) => setMissionEndDate(e.target.value)}
                placeholder="06/03/2023"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nb de Jours
              </label>
              <input
                type="number"
                min="1"
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value) || 1)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          {/* Taux & Barèmes IMROP */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Barème Indemnités journalières & Devises</span>
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="currType"
                    checked={currencyType === 'EUR'}
                    onChange={() => {
                      setCurrencyType('EUR');
                      setPerDiemDailyRateEuro(150);
                      setPerDiemDailyRateMru(0);
                    }}
                    className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>Étranger (Euro €)</span>
                </label>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="currType"
                    checked={currencyType === 'MRU'}
                    onChange={() => {
                      setCurrencyType('MRU');
                      setPerDiemDailyRateMru(2000);
                      setPerDiemDailyRateEuro(0);
                    }}
                    className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>Local (MRU)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currencyType === 'EUR' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Taux € / Jour
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={perDiemDailyRateEuro}
                      onChange={(e) => setPerDiemDailyRateEuro(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Total Euro (€)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${totalEuro} €`}
                      className="w-full text-xs p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Taux BCM du jour (1 €)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bcmRateEuro}
                      onChange={(e) => setBcmRateEuro(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#fef08a] border border-slate-900 rounded-lg font-black text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Transport (MRU)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={transportAmountMru}
                      onChange={(e) => setTransportAmountMru(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Taux MRU / Jour
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={perDiemDailyRateMru}
                      onChange={(e) => setPerDiemDailyRateMru(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Total Per Diem (MRU)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${(daysCount * perDiemDailyRateMru).toLocaleString()} MRU`}
                      className="w-full text-xs p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Frais Transport (MRU)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={transportAmountMru}
                      onChange={(e) => setTransportAmountMru(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Imputation
                    </label>
                    <input
                      type="text"
                      value={imputation}
                      onChange={(e) => setImputation(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Coordonnées Bancaires & Imputation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Banque (Bank)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: BCI, BMCI, BIM..."
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                N° de Compte
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Ex: 8984"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Imputation Budgétaire
              </label>
              <input
                type="text"
                value={imputation}
                onChange={(e) => setImputation(e.target.value)}
                placeholder="IMROP"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          {/* Advance & Net Summary Box with In-Words Text */}
          <div className="p-4 bg-slate-100 border-2 border-slate-900 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>TOTAL FRAIS CALCULÉ :</span>
              <span className="text-sm font-bold text-slate-900">
                {calculatedTotalMru.toLocaleString('fr-FR')} MRU
              </span>
            </div>

            {advanceDeducted > 0 && (
              <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
                <span>Déduction avance perçue :</span>
                <span>- {Number(advanceDeducted).toLocaleString('fr-FR')} MRU</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-sm font-extrabold text-slate-950">
              <span className="uppercase font-black text-xs sm:text-sm">NET A PERCEVOIR :</span>
              <span className="text-base sm:text-lg font-black text-emerald-800">
                {netPayable.toLocaleString('fr-FR')} MRU
              </span>
            </div>

            {/* Montant en toutes lettres */}
            <div className="pt-2 text-xs border-t border-slate-300 text-slate-800">
              <span className="font-bold">Arrêté le présent état à la somme de : </span>
              <span className="font-semibold underline uppercase text-slate-950">
                {amountInWords}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Créer et Imprimer l'État de Paiement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
