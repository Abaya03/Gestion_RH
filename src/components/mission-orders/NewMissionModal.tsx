import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TransportMode } from '../../types';
import { 
  Compass, 
  X, 
  Check, 
  AlertCircle, 
  Building, 
  Calendar, 
  Users, 
  Plane, 
  Car,
  Search,
  UserCheck,
  CreditCard,
  Mail,
  Phone,
  Shield,
  Layers,
  ChevronDown,
  CheckCircle2,
  Calculator,
  Coins,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  FileCheck2,
  Banknote,
  DollarSign
} from 'lucide-react';

interface NewMissionModalProps {
  onClose: () => void;
  preselectedEmployeeId?: string;
}

// Mauritanian official Wilayas & major poles
const MAURITANIAN_DESTINATIONS = [
  { fr: 'Nouakchott (Siège ministériel & Institutions)', ar: 'نواكشوط (المقرات الوزارية والمؤسسات)' },
  { fr: 'Nouadhibou (Siège IMROP & Zone Franche)', ar: 'نواذيبو (مقر المعهد والمنطقة الحرة)' },
  { fr: 'Banc d\'Arguin / Iwik (Station PNBA)', ar: 'حوض آرغين / إيويك (محطة الحظيرة)' },
  { fr: 'Zouerate (Tiris Zemmour)', ar: 'ازويرات (تيرس زمور)' },
  { fr: 'Akjoujt (Inchiri)', ar: 'أكجوجت (إينشيري)' },
  { fr: 'Rosso (Trarza)', ar: 'روصو (اترارزة)' },
  { fr: 'Boghé / Kaédi (Brakna - Gorgol)', ar: 'بوغي / كيهيدي (لبراكنة - غورغول)' },
  { fr: 'Sélibaby (Guidimagha)', ar: 'سيلبابي (غيديماغا)' },
  { fr: 'Kiffa (Assaba)', ar: 'كيفة (لعصابة)' },
  { fr: 'Aioun / Néma (Hodhs)', ar: 'لعيون / النعمة (الحوضين)' },
  { fr: 'Atar / Chinguetti (Adrar)', ar: 'أطار / شنقيط (آدرار)' },
  { fr: 'Tidjikja (Tagant)', ar: 'تجكجة (تكانت)' },
  { fr: 'En Mer (Campagne Océanographique N/R Al Awam)', ar: 'في البحر (حملة استكشافية سفينة العوام)' }
];

const INTERNATIONAL_DESTINATIONS = [
  { fr: 'Dakar, Sénégal (Commission Sous-Régionale des Pêches)', ar: 'دكار، السنغال (لجنة الصيد دون الإقليمية)' },
  { fr: 'Casablanca / Rabat, Maroc (INRH)', ar: 'الدار البيضاء / الرباط، المغرب (المعهد الوطني للصيد)' },
  { fr: 'Paris / Brest, France (Ifremer / IRD)', ar: 'باريس / بريست، فرنسا' },
  { fr: 'Las Palmas, Espagne (Canaries)', ar: 'لاس بالماس، إسبانيا' },
  { fr: 'Abidjan, Côte d\'Ivoire (ATLAFCO)', ar: 'أبيدجان، ساحل العاج' },
  { fr: 'Tunis, Tunisie (SIPAM / FAO)', ar: 'تونس، تونس' },
  { fr: 'Autre destination internationale', ar: 'وجهة دولية أخرى' }
];

export const NewMissionModal: React.FC<NewMissionModalProps> = ({ onClose, preselectedEmployeeId }) => {
  const { language, t, employees, currentEmployee, currentEmployeeId, createMissionOrder, companySettings, getEmployeeById, getPerDiemRateForGrade, perDiemRates } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [employeeId, setEmployeeId] = useState<string>(
    preselectedEmployeeId || currentEmployeeId || employees[0]?.id || ''
  );
  const [employeeSearch, setEmployeeSearch] = useState('');

  const [destinationType, setDestinationType] = useState<'en_mauritanie' | 'a_letranger'>('en_mauritanie');
  const [destinationPrecisions, setDestinationPrecisions] = useState('Nouakchott');
  const [destination, setDestination] = useState('Nouakchott, Mauritanie');
  const [destinationAr, setDestinationAr] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeAr, setPurposeAr] = useState('');
  const [otherMembers, setOtherMembers] = useState('Néant');
  
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('08:00');
  
  const [isEndFixed, setIsEndFixed] = useState(true);
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
  const [returnTime, setReturnTime] = useState('18:00');
  
  const [transportSelection, setTransportSelection] = useState<'voiture' | 'avion' | 'autre'>('voiture');
  const [transportMode, setTransportMode] = useState<TransportMode>('voiture_service');
  const [transportDetails, setTransportDetails] = useState('Véhicule de service IMROP 4x4');
  
  const [budgetImputation, setBudgetImputation] = useState<'IMROP' | 'autre'>('IMROP');
  const [budgetImputationOther, setBudgetImputationOther] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // --------------------------------------------------------------------------
  // FINANCIAL CONTROL: Days x Daily Rate + Manual Transport
  // --------------------------------------------------------------------------
  const selectedEmployee = employees.find(e => e.id === employeeId) || employees[0];
  const directManager = selectedEmployee?.managerId ? getEmployeeById(selectedEmployee.managerId) : undefined;

  // Grade default per diem
  const employeeBareme = selectedEmployee ? getPerDiemRateForGrade(selectedEmployee.grade) : undefined;
  
  // Suggested rate according to Mauritanian public institutions scale
  const defaultSuggestedRate = useMemo(() => {
    if (destinationType === 'a_letranger') {
      return 150; // EUR/j
    }
    if (employeeBareme?.nationalPerDiemMru) {
      return employeeBareme.nationalPerDiemMru;
    }
    const grade = selectedEmployee?.grade || 'cadre';
    if (grade.includes('cadre_sup')) return 3500;
    if (grade.includes('cadre')) return 3000;
    if (grade.includes('maitrise')) return 2200;
    return 1800;
  }, [destinationType, employeeBareme, selectedEmployee]);

  // Duration in days calculated from dates
  const calculatedDays = useMemo(() => {
    if (!departureDate || !returnDate || !isEndFixed) return 1;
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }, [departureDate, returnDate, isEndFixed]);

  // User-controlled daysCount state (initialized with calculatedDays)
  const [daysCount, setDaysCount] = useState<number>(calculatedDays);
  // User-controlled dailyRate state (initialized with suggested rate)
  const [dailyRate, setDailyRate] = useState<number>(defaultSuggestedRate);
  // User-controlled manual transport cost in MRU
  const [transportCost, setTransportCost] = useState<number>(transportSelection === 'avion' ? 6500 : 0);
  
  // Advance request
  const [advanceRequested, setAdvanceRequested] = useState<boolean>(true);
  const [advancePercentage, setAdvancePercentage] = useState<number>(80); // 80% is standard in Mauritanian administration
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState<number | null>(null);

  // Auto-generate linked expense claim
  const [autoGenerateExpenseClaim, setAutoGenerateExpenseClaim] = useState<boolean>(true);

  // Keep daysCount in sync when dates change, unless user manually overrode
  useEffect(() => {
    setDaysCount(calculatedDays);
  }, [calculatedDays]);

  // Keep dailyRate in sync when grade or destination type changes
  useEffect(() => {
    setDailyRate(defaultSuggestedRate);
  }, [defaultSuggestedRate]);

  // Calculations
  const bcmEuroRate = companySettings.defaultBcmEuroRate || 37.14;
  const isAbroad = destinationType === 'a_letranger';

  // Per diem subtotal in MRU
  const perDiemSubtotalMru = useMemo(() => {
    if (isAbroad) {
      // dailyRate is in EUR -> convert with BCM rate
      return Math.round(daysCount * dailyRate * bcmEuroRate);
    }
    return Math.round(daysCount * dailyRate);
  }, [daysCount, dailyRate, isAbroad, bcmEuroRate]);

  // Total mission fees: (daysCount * dailyRate) + manual transport
  const totalMissionFees = useMemo(() => {
    return Math.max(0, perDiemSubtotalMru + Number(transportCost || 0));
  }, [perDiemSubtotalMru, transportCost]);

  // Advance amount
  const advanceAmount = useMemo(() => {
    if (!advanceRequested) return 0;
    if (customAdvanceAmount !== null) return Math.min(totalMissionFees, customAdvanceAmount);
    return Math.round(totalMissionFees * (advancePercentage / 100));
  }, [advanceRequested, customAdvanceAmount, totalMissionFees, advancePercentage]);

  // Net remainder payable upon mission return / liquidation
  const netLiquidationPayable = useMemo(() => {
    return Math.max(0, totalMissionFees - advanceAmount);
  }, [totalMissionFees, advanceAmount]);

  // Grade badge formatting
  const gradeLabels: Record<string, { label: string; color: string }> = {
    cadre_superieur: { label: 'Cadre Supérieur (A)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    cadre_sup: { label: 'Cadre Supérieur (A)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    cadre: { label: 'Cadre / Chercheur (B)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    maitrise: { label: 'Maîtrise / Technicien (C)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    agent_maitrise: { label: 'Agent de Maîtrise (C)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    employe: { label: 'Employé / Appui (D)', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  const filteredEmployeesForSelect = employees.filter(emp => {
    if (!employeeSearch.trim()) return true;
    const q = employeeSearch.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const arabicName = `${emp.firstNameAr || ''} ${emp.lastNameAr || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      arabicName.includes(q) ||
      (emp.matricule && emp.matricule.toLowerCase().includes(q)) ||
      (emp.nni && emp.nni.includes(q)) ||
      (emp.position && emp.position.toLowerCase().includes(q)) ||
      (emp.department && emp.department.toLowerCase().includes(q))
    );
  });

  const handleDestinationTypeChange = (type: 'en_mauritanie' | 'a_letranger') => {
    setDestinationType(type);
    if (type === 'en_mauritanie') {
      setDestinationPrecisions('Nouakchott');
      setDestination('Nouakchott, Mauritanie');
      setTransportSelection('voiture');
      setTransportMode('voiture_service');
      setTransportDetails('Véhicule de service IMROP 4x4');
      setTransportCost(0);
    } else {
      setDestinationPrecisions('Dakar, Sénégal');
      setDestination('Dakar, Sénégal');
      setTransportSelection('avion');
      setTransportMode('avion');
      setTransportDetails('Vol Air Mauritanie Nouakchott - Dakar A/R');
      setTransportCost(14000); // billet d'avion international
    }
  };

  const handlePresetDestination = (dest: { fr: string; ar: string }) => {
    setDestinationPrecisions(dest.fr);
    setDestination(dest.fr);
    setDestinationAr(dest.ar);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationPrecisions.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد مكان ووجهة المهمة' : 'Veuillez préciser le lieu/destination de la mission.');
      return;
    }
    if (!purpose.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد سبب وموضوع المهمة' : 'Veuillez préciser le motif de la mission.');
      return;
    }
    if (isEndFixed && new Date(returnDate) < new Date(departureDate)) {
      setError(language === 'ar' ? 'تاريخ العودة يجب أن يكون بعد تاريخ الانطلاق' : 'La date de retour doit être postérieure à la date de départ.');
      return;
    }

    createMissionOrder({
      employeeId,
      destinationType,
      destinationPrecisions,
      destination: destination || destinationPrecisions,
      destinationAr: destinationAr || undefined,
      purpose,
      purposeAr: purposeAr || undefined,
      otherMembers: otherMembers.trim() || 'Néant',
      departureDate,
      departureTime,
      returnDate: isEndFixed ? returnDate : 'Fin de mission',
      returnTime: isEndFixed ? returnTime : undefined,
      isEndFixed,
      transportMode,
      transportSelection,
      transportDetails: transportDetails || undefined,
      budgetImputation,
      budgetImputationOther: budgetImputation === 'autre' ? budgetImputationOther : undefined,
      daysCount,
      dailyRate,
      transportCost: Number(transportCost || 0),
      totalMissionFees,
      estimatedBudget: totalMissionFees,
      advanceRequested,
      advancePercentage: advanceRequested ? advancePercentage : 0,
      advanceAmount,
      autoGenerateExpenseClaim,
      currency: isAbroad ? 'EUR/MRU' : 'MRU',
      notes: notes || undefined,
      createdBy: currentEmployee.id
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
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto cursor-default relative my-auto border border-slate-100"
      >
        {/* Modal Header */}
        <div className="sticky -top-6 -mt-6 pt-6 -mx-6 px-6 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-slate-900">
                  {language === 'ar' ? 'إنشاء أمر مهمة رسمي ونظام المصاريف' : 'Nouvel Ordre de Mission Officiel'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {language === 'ar' ? 'النظام الموريتاني' : 'Réglementation RIM'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {companySettings.name} ({companySettings.acronym || 'IMROP'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer (Échap)"
            className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t('btnClose')}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* SECTION 1: BENEFICIARY SELECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-700" />
                <span>{language === 'ar' ? 'الموظف / الوكيل المعني بالمهمة *' : 'Agent missionné (Répertoire du Personnel) *'}</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {employees.length} {language === 'ar' ? 'موظف مسجل' : 'collaborateurs'}
              </span>
            </div>

            {/* Quick Search & Select Bar */}
            <div className="space-y-1.5">
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium text-slate-900 shadow-xs cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.civility === 'Madame' ? 'Mme.' : 'M.'} {emp.firstName} {emp.lastName} {emp.firstNameAr ? `(${emp.firstNameAr} ${emp.lastNameAr || ''})` : ''} — {emp.matricule} • {emp.position} ({emp.department})
                  </option>
                ))}
              </select>

              {/* Quick filter input if list is long */}
              {employees.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder={language === 'ar' ? 'تصفية سريعة بالاسم، الرقم الوطني NNI، رقم التأجير...' : 'Filtrer rapidement la liste (Nom, NNI, Matricule, Poste)...'}
                    className="w-full text-[11px] ps-8 pe-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  {employeeSearch && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearch('')}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {employeeSearch && filteredEmployeesForSelect.length > 0 && (
                <div className="max-h-36 overflow-y-auto border border-sky-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 text-xs z-20">
                  {filteredEmployeesForSelect.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setEmployeeId(emp.id);
                        setEmployeeSearch('');
                      }}
                      className={`w-full text-start p-2 hover:bg-sky-50 flex items-center justify-between transition-colors cursor-pointer ${emp.id === employeeId ? 'bg-sky-50/80 font-bold text-sky-900' : 'text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'} 
                          alt="" 
                          className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                        />
                        <div>
                          <span>{emp.civility === 'Madame' ? 'Mme.' : 'M.'} {emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] text-slate-500 block font-normal">{emp.position} • {emp.department}</span>
                        </div>
                      </div>
                      <div className="text-end text-[10px]">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{emp.matricule}</span>
                        <span className="text-slate-400 block">NNI: {emp.nni || 'N/A'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Personnel Profile Card with Mauritanian regulatory tags */}
            {selectedEmployee && (
              <div className="p-3 bg-linear-to-br from-sky-50/70 via-slate-50 to-indigo-50/40 border border-sky-200/80 rounded-2xl space-y-2 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={selectedEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'} 
                      alt="" 
                      className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-xs shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-sky-900 bg-white px-1.5 py-0.5 rounded border border-sky-200">
                          {selectedEmployee.civility || 'Monsieur'}
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </span>
                        {selectedEmployee.firstNameAr && (
                          <span className="text-[11px] font-semibold text-slate-500">
                            ({selectedEmployee.firstNameAr} {selectedEmployee.lastNameAr || ''})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                        {selectedEmployee.position} • <span className="text-slate-500">{selectedEmployee.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md border border-sky-200 block font-mono">
                      {selectedEmployee.matricule}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      NNI: <strong>{selectedEmployee.nni || '1489201934'}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sky-200/60 text-[11px]">
                  <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">{language === 'ar' ? 'الدرجة / الصنف :' : 'Grade / Catégorie :'}</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {gradeLabels[selectedEmployee.grade]?.label || selectedEmployee.grade}
                    </span>
                  </div>

                  <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">{language === 'ar' ? 'البنك والحساب :' : 'Banque & Compte :'}</span>
                    <span className="font-bold text-slate-800 font-mono truncate block">
                      {selectedEmployee.bankName || 'BCI'} ({selectedEmployee.bankAccount || '8984'})
                    </span>
                  </div>

                  <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">{language === 'ar' ? 'تعويض اليوم المرجعي :' : 'Taux barème suggéré :'}</span>
                    <span className="font-bold text-emerald-700">
                      {defaultSuggestedRate} {destinationType === 'a_letranger' ? '€/j' : 'MRU/j'}
                    </span>
                  </div>

                  <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">{language === 'ar' ? 'رصيد الإجازة المتبقي :' : 'Solde Congés :'}</span>
                    <span className="font-bold text-indigo-700">
                      {selectedEmployee.remainingLeaveDays} j
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: DESTINATION (Mauritanie vs Etranger & Presets) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-700" />
                <span>{language === 'ar' ? 'وجهة ومكان المهمة *' : 'Lieu / Destination de la mission *'}</span>
              </label>
              
              <div className="flex items-center gap-4 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="destinationType"
                    checked={destinationType === 'en_mauritanie'}
                    onChange={() => handleDestinationTypeChange('en_mauritanie')}
                    className="text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{language === 'ar' ? 'داخل موريتانيا' : 'En Mauritanie'}</span>
                </label>

                <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="destinationType"
                    checked={destinationType === 'a_letranger'}
                    onChange={() => handleDestinationTypeChange('a_letranger')}
                    className="text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{language === 'ar' ? 'إلى الخارج' : 'À l’étranger'}</span>
                </label>
              </div>
            </div>

            {/* Quick destination presets buttons */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'ar' ? 'وجهات شائعة وسريعة الاختيار :' : 'Destinations courantes :'}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                {(destinationType === 'en_mauritanie' ? MAURITANIAN_DESTINATIONS : INTERNATIONAL_DESTINATIONS).map((dest, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetDestination(dest)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-800 text-slate-700 border border-slate-200 hover:border-sky-200 transition-colors font-medium cursor-pointer"
                  >
                    {language === 'ar' ? dest.ar : dest.fr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'تحديد المكان (بالفرنسية) *' : 'Précisions du lieu (Français) *'}
                </label>
                <input
                  type="text"
                  required
                  value={destinationPrecisions}
                  onChange={(e) => {
                    setDestinationPrecisions(e.target.value);
                    setDestination(e.target.value);
                  }}
                  placeholder="Ex: Nouakchott, Nouadhibou, Dakar..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'تحديد المكان (بالعربية)' : 'Précisions du lieu (Arabe)'}
                </label>
                <input
                  type="text"
                  value={destinationAr}
                  onChange={(e) => setDestinationAr(e.target.value)}
                  placeholder="مثال: نواكشوط، داخلت نواذيبو، السنغال..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MOTIF DE LA MISSION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'سبب وموضوع المهمة (فرنسي) *' : 'Motif de la mission (Français) *'}
              </label>
              <textarea
                required
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ex: Participation aux réunions du comité de pilotage des pêches..."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'سبب وموضوع المهمة (عربي)' : 'Motif de la mission (Arabe)'}
              </label>
              <textarea
                rows={2}
                value={purposeAr}
                onChange={(e) => setPurposeAr(e.target.value)}
                placeholder="مثال: المشاركة في اجتماعات تقييم الثروة السمكية والبيئة البحرية..."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Autres Membres */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'ar' ? 'أعضاء الوفد / المشاركون الآخرون (أو لا يوجد)' : 'Autres Membres de la mission (ou Néant)'}</span>
            </label>
            <input
              type="text"
              value={otherMembers}
              onChange={(e) => setOtherMembers(e.target.value)}
              placeholder="Ex: Dr. Ahmedou OULD SIDI, Aissata DIALLO (ou Néant)"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* SECTION 4: DATES DE MISSION */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-700" />
                <span>{language === 'ar' ? 'فترة وتواريخ المهمة' : 'Période et dates de déplacement'}</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                {language === 'ar' ? `المدة المحسوبة: ${daysCount} يوم` : `Durée calculée : ${daysCount} jour(s)`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'تاريخ وساعة الانطلاق *' : 'Date et heure de début de mission *'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-24 text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    {language === 'ar' ? 'تاريخ وساعة العودة' : 'Date et heure de fin de mission'}
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-sky-800 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={!isEndFixed}
                      onChange={(e) => setIsEndFixed(!e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>"Fin de mission"</span>
                  </label>
                </div>
                {isEndFixed ? (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-24 text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="Fin de mission"
                    className="w-full text-xs p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: FINANCIAL MISSION CALCULATION (DAYS X RATE + MANUAL TRANSPORT) */}
          {/* ========================================================================= */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-sky-50/60 to-emerald-50/40 rounded-3xl border-2 border-indigo-200/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">
                    {language === 'ar' ? 'احتساب مصاريف المهمة الرسمية (تحكم يدوي كامل)' : 'Calculateur Officiel des Frais de Mission'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' 
                      ? 'المعادلة: (أيام المهمة × التعويض اليومي) + النقل المدخل يدوياً' 
                      : 'Formule : (Jours de mission × Taux du jour) + Transport saisi manuel'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {companySettings.currency}
              </span>
            </div>

            {/* Inputs Grid: Days count | Daily Rate | Manual Transport */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* 1. Days Count with Direct Hand & Plus/Minus */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  {language === 'ar' ? '1. عدد أيام المهمة :' : '1. Jours de mission :'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDaysCount(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={daysCount}
                    onChange={(e) => setDaysCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full text-center font-black text-sm p-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDaysCount(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block text-center">
                  {language === 'ar' ? 'تعديل يدوي حر' : 'Contrôle manuel libre'}
                </span>
              </div>

              {/* 2. Daily Rate with Direct Hand */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  {language === 'ar' ? '2. التعويض اليومي (Taux) :' : '2. Taux du jour (Per Diem) :'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value) || 0)}
                    className="w-full font-black text-sm p-1.5 pe-12 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <span className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    {isAbroad ? '€/j' : 'MRU/j'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">{language === 'ar' ? 'المقترح :' : 'Suggéré :'} {defaultSuggestedRate}</span>
                  <button
                    type="button"
                    onClick={() => setDailyRate(defaultSuggestedRate)}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'استعادة' : 'Rétablir'}
                  </button>
                </div>
              </div>

              {/* 3. Transport Cost (Saisie Manuelle) */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-2xs space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>{language === 'ar' ? '3. النقل (إدخال يدوي) *' : '3. Transport (Saisie manuel) :'}</span>
                  <span className="text-[10px] text-indigo-600 font-bold font-mono">MRU</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
                    placeholder="Ex: 6500"
                    className="w-full font-black text-sm p-1.5 pe-10 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 text-center text-emerald-800"
                  />
                  <span className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    MRU
                  </span>
                </div>

                {/* Quick transport estimate presets */}
                <div className="flex items-center justify-between gap-1 text-[9px]">
                  <button
                    type="button"
                    onClick={() => setTransportCost(0)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    0 (Service)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportCost(1500)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    1 500 (Route)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportCost(6500)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    6 500 (Avion)
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE DETAILED FORMULA RESULT CARD */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2">
                <span className="font-medium">
                  {language === 'ar' ? 'تفاصيل المعادلة الحسابية المعتمدة :' : 'Décomposition du décompte :'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {daysCount} j × {dailyRate} {isAbroad ? '€' : 'MRU'} {isAbroad ? `(x ${bcmEuroRate} BCM)` : ''} + {transportCost.toLocaleString()} MRU
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'التعويضات اليومية :' : 'Sous-total Per Diem :'}</span>
                  <span className="font-bold text-slate-100 font-mono text-xs sm:text-sm">
                    {perDiemSubtotalMru.toLocaleString()} MRU
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'النقل اليدوي :' : 'Transport Saisi :'}</span>
                  <span className="font-bold text-sky-300 font-mono text-xs sm:text-sm">
                    {Number(transportCost || 0).toLocaleString()} MRU
                  </span>
                </div>

                <div className="col-span-2 bg-slate-800/90 p-2 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                      {language === 'ar' ? 'المجموع الكلي للمهمة :' : 'TOTAL FRAIS MISSION :'}
                    </span>
                    <span className="font-black text-base sm:text-lg text-emerald-300 font-mono">
                      {totalMissionFees.toLocaleString()} MRU
                    </span>
                  </div>
                  <Coins className="w-6 h-6 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Advance and Net liquidation breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{language === 'ar' ? 'السلفة المطلوبة :' : 'Avance sur frais demandée :'}</span>
                  <strong className="text-amber-300 font-mono">{advanceAmount.toLocaleString()} MRU ({advanceRequested ? `${advancePercentage}%` : '0%'})</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>{language === 'ar' ? 'الباقي عند تصفية المهمة :' : 'Reliquat à la liquidation :'}</span>
                  <strong className="text-white font-mono">{netLiquidationPayable.toLocaleString()} MRU</strong>
                </div>
              </div>
            </div>

            {/* Advance Settings & Auto-Expense Claim Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Advance toggle & percentage */}
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advanceRequested}
                      onChange={(e) => setAdvanceRequested(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{language === 'ar' ? 'طلب تسبيق / سلفة على المهمة' : 'Demande d\'avance sur mission'}</span>
                  </label>
                  {advanceRequested && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {advanceAmount.toLocaleString()} MRU
                    </span>
                  )}
                </div>

                {advanceRequested && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[50, 75, 80, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setAdvancePercentage(pct);
                          setCustomAdvanceAmount(null);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${advancePercentage === pct && customAdvanceAmount === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Automatic Expense Claim Generation */}
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateExpenseClaim}
                    onChange={(e) => setAutoGenerateExpenseClaim(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="block">{language === 'ar' ? 'توليد كشف تصفية المصاريف تلقائياً' : 'Générer l\'état de frais automatiquement'}</span>
                    <span className="text-[10px] font-normal text-slate-500 block">
                      {language === 'ar' ? 'ربط فوري لأمر المهمة مع كشف التصفية والتسوية' : 'Liaison directe avec l\'état de liquidation'}
                    </span>
                  </div>
                </label>
                <FileCheck2 className={`w-5 h-5 shrink-0 ${autoGenerateExpenseClaim ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>

          {/* SECTION 6: TRANSPORT DETAILS & BUDGET IMPUTATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Moyen de transport */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {language === 'ar' ? 'وسيلة النقل المستخدمة :' : 'Moyen de transport :'}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="transportSel"
                    checked={transportSelection === 'voiture'}
                    onChange={() => {
                      setTransportSelection('voiture');
                      setTransportMode('voiture_service');
                      setTransportDetails('Véhicule de service IMROP 4x4');
                    }}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <Car className="w-3.5 h-3.5 text-slate-600" />
                  <span>{language === 'ar' ? 'سيارة' : 'Voiture'}</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="transportSel"
                    checked={transportSelection === 'avion'}
                    onChange={() => {
                      setTransportSelection('avion');
                      setTransportMode('avion');
                      setTransportDetails('Vol régulier A/R');
                      if (transportCost === 0) setTransportCost(6500);
                    }}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <Plane className="w-3.5 h-3.5 text-slate-600" />
                  <span>{language === 'ar' ? 'طائرة' : 'Avion'}</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="transportSel"
                    checked={transportSelection === 'autre'}
                    onChange={() => {
                      setTransportSelection('autre');
                      setTransportMode('autre');
                      setTransportDetails('Bateau / Navire de recherche Al Awam');
                    }}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span>{language === 'ar' ? 'أخرى' : 'Autre'}</span>
                </label>
              </div>
              <input
                type="text"
                value={transportDetails}
                onChange={(e) => setTransportDetails(e.target.value)}
                placeholder="Détails (ex: Véhicule IMROP 4x4, Vol Mauritania Airlines...)"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            {/* Imputation budgétaire */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {language === 'ar' ? 'التحميل المالي / الميزانية :' : 'Imputation budgétaire :'}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="budgetImp"
                    checked={budgetImputation === 'IMROP'}
                    onChange={() => setBudgetImputation('IMROP')}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span>IMROP</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="budgetImp"
                    checked={budgetImputation === 'autre'}
                    onChange={() => setBudgetImputation('autre')}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span>{language === 'ar' ? 'مشروع آخر' : 'Autre (Projet)'}</span>
                </label>
              </div>
              {budgetImputation === 'autre' ? (
                <input
                  type="text"
                  required
                  value={budgetImputationOther}
                  onChange={(e) => setBudgetImputationOther(e.target.value)}
                  placeholder="Préciser le projet (ex: Projet FAO, PRCM, Banc d'Arguin...)"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              ) : (
                <div className="text-[11px] text-slate-500 pt-1">
                  {language === 'ar' ? 'ميزانية التسيير العادية للمعهد IMROP' : 'Prise en charge directe sur le budget de fonctionnement IMROP.'}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ar' ? 'تأكيد وإنشاء أمر المهمة' : 'Créer l\'Ordre de Mission Officiel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
