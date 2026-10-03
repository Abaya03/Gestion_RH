import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { 
  Calculator, 
  FileText, 
  BookOpen, 
  Printer, 
  UserCheck, 
  Coins, 
  ShieldCheck, 
  Award, 
  Building, 
  Download, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  DollarSign, 
  Landmark, 
  Scale, 
  FileCheck, 
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ImropLogo } from '../common/ImropLogo';
import { numberToWordsFR } from '../../utils/numberToWords';

export const MauritanianHrHubView: React.FC = () => {
  const { language, t, employees, companySettings, userRole } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'documents' | 'legal'>('payroll');

  // Selected Employee for Payroll & Document simulation
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  // -------------------------------------------------------------------------
  // 1. PAYROLL SIMULATOR STATE (CNSS, CNAM, ITS MAURITANIE)
  // -------------------------------------------------------------------------
  const [baseSalary, setBaseSalary] = useState<number>(selectedEmp?.baseSalary || 28000);
  const [transportAllowance, setTransportAllowance] = useState<number>(selectedEmp?.transportAllowance || 4000);
  const [housingAllowance, setHousingAllowance] = useState<number>(selectedEmp?.housingAllowance || 8000);
  const [seniorityAllowance, setSeniorityAllowance] = useState<number>(3500); // Prime d'ancienneté
  const [responsibilityAllowance, setResponsibilityAllowance] = useState<number>(5000); // Prime de fonction

  // When selected employee changes, update defaults
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const gradeBase = emp.grade.includes('cadre_sup') ? 45000 :
                        emp.grade.includes('cadre') ? 32000 :
                        emp.grade.includes('maitrise') ? 22000 : 16000;
      setBaseSalary(emp.baseSalary || gradeBase);
      setTransportAllowance(emp.transportAllowance || 4000);
      setHousingAllowance(emp.housingAllowance || (gradeBase * 0.25));
      setSeniorityAllowance(3000);
      setResponsibilityAllowance(emp.grade.includes('cadre') ? 6000 : 2000);
    }
  };

  // Calculations according to Mauritanian Labor & Tax Code
  const grossSalary = baseSalary + transportAllowance + housingAllowance + seniorityAllowance + responsibilityAllowance;
  
  // CNSS (Caisse Nationale de Sécurité Sociale - Mauritanie)
  // Plafond CNSS mensuel en Mauritanie = 7 000 MRU
  // Part salariale: 1% plafonnée à 7 000 MRU (max 70 MRU)
  const cnssCeiling = 7000;
  const cnssBase = Math.min(grossSalary, cnssCeiling);
  const cnssEmployee = Math.round(cnssBase * 0.01);
  // Part patronale CNSS: 15% (Prestations familiales 8%, Risques prof. 4%, Vieillesse/Invalidité 3%)
  const cnssEmployer = Math.round(cnssBase * 0.15);

  // CNAM (Caisse Nationale d'Assurance Maladie - Mauritanie)
  // Part salariale: 4% du salaire brut
  // Part patronale: 5% du salaire brut (Total 9%)
  const cnamEmployee = Math.round(grossSalary * 0.04);
  const cnamEmployer = Math.round(grossSalary * 0.05);

  // ITS (Impôt sur les Traitements et Salaires - Barème Général Mauritanie)
  // Exonération de transport (jusqu'à 3 000 MRU)
  const taxableTransport = Math.max(0, transportAllowance - 3000);
  const taxableBase = baseSalary + taxableTransport + housingAllowance + seniorityAllowance + responsibilityAllowance - cnssEmployee - cnamEmployee;

  // Calcul progressif ITS Mauritanie
  let itsAmount = 0;
  if (taxableBase <= 9000) {
    itsAmount = 0;
  } else if (taxableBase <= 21000) {
    itsAmount = (taxableBase - 9000) * 0.15;
  } else if (taxableBase <= 40000) {
    itsAmount = (12000 * 0.15) + ((taxableBase - 21000) * 0.25);
  } else {
    itsAmount = (12000 * 0.15) + (19000 * 0.25) + ((taxableBase - 40000) * 0.40);
  }
  itsAmount = Math.max(0, Math.round(itsAmount));

  // Total retenues salariales & Net à Payer
  const totalDeductions = cnssEmployee + cnamEmployee + itsAmount;
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  const totalEmployerCharges = cnssEmployer + cnamEmployer;
  const totalCostCompany = grossSalary + totalEmployerCharges;

  // Print state for Payslip or Attestation
  const [printDocType, setPrintDocType] = useState<'payslip' | 'attestation_travail' | 'attestation_salaire' | 'titre_conge' | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -end-10 -bottom-10 opacity-10 pointer-events-none">
          <Scale className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {language === 'ar' ? 'الجمهورية الإسلامية الموريتانية' : 'République Islamique de Mauritanie'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
                {language === 'ar' ? 'قانون العمل رقم 2004-017' : 'Code du Travail 2004-017'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {language === 'ar' ? 'مركز خبير المصادر البشرية والنظام الموريتاني' : 'Espace Expertise RH & Réglementation Mauritanienne'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/80 max-w-2xl">
              {language === 'ar'
                ? 'محاكاة الرواتب والاقتطاعات القانونية (CNSS, CNAM, ITS)، توليد الوثائق الإدارية الرسمية، ودليل قانون العمل الموريتاني.'
                : 'Simulateur officiel de paie, cotisations sociales CNSS & CNAM, barème ITS, générateur d\'attestations et référentiel juridique.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('payroll')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'payroll' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <Calculator className="w-4 h-4" />
              <span>{language === 'ar' ? 'الرواتب والاقتطاعات' : 'Paie & Cotisations'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('documents')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'documents' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ar' ? 'الوثائق الإدارية' : 'Attestations RH'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('legal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'legal' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'ar' ? 'دليل قانون العمل' : 'Code du Travail'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: MAURITANIAN PAYROLL & SOCIAL CHARGES (CNSS / CNAM / ITS) */}
      {/* ===================================================================== */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Employee selector bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <UserCheck className="w-4 h-4 text-sky-700 shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                {language === 'ar' ? 'اختر الموظف للمحاكاة :' : 'Collaborateur cible :'}
              </span>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 w-full sm:w-80 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.matricule} • {emp.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>NNI: <strong className="text-slate-800">{selectedEmp.nni || '1489201934'}</strong></span>
              <span>•</span>
              <span>CNSS: <strong className="text-slate-800">{selectedEmp.cnss || '09843-CNSS'}</strong></span>
              <span>•</span>
              <span>Banque: <strong className="text-slate-800">{selectedEmp.bankName || 'BCI'}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Salary Components Input */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {language === 'ar' ? 'عناصر الراتب الشهري (الأوقية MRU)' : 'Composantes de la Rémunération'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  {companySettings.currency}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-800">{language === 'ar' ? 'الراتب الأساسي (Salaire de Base) *' : 'Salaire de Base Mensuel *'}</label>
                    <span className="font-mono text-slate-500">{baseSalary.toLocaleString()} MRU</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={120000}
                    step={1000}
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{language === 'ar' ? 'علاوة النقل (Indemnité Transport)' : 'Indemnité de Transport'}</label>
                    <input
                      type="number"
                      value={transportAllowance}
                      onChange={(e) => setTransportAllowance(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Exonération: 3 000 MRU</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{language === 'ar' ? 'علاوة السكن (Indemnité Logement)' : 'Indemnité de Logement'}</label>
                    <input
                      type="number"
                      value={housingAllowance}
                      onChange={(e) => setHousingAllowance(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{language === 'ar' ? 'علاوة الأقدمية (Ancienneté)' : 'Prime d\'Ancienneté'}</label>
                    <input
                      type="number"
                      value={seniorityAllowance}
                      onChange={(e) => setSeniorityAllowance(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{language === 'ar' ? 'علاوة المسؤولية / الوظيفة' : 'Prime de Fonction / Responsabilité'}</label>
                    <input
                      type="number"
                      value={responsibilityAllowance}
                      onChange={(e) => setResponsibilityAllowance(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-slate-800">{language === 'ar' ? 'مجموع الراتب الإجمالي الخام (Salaire Brut) :' : 'Total Salaire Brut :' }</span>
                  <span className="font-black text-sm text-slate-900 font-mono">{grossSalary.toLocaleString()} MRU</span>
                </div>
              </div>
            </div>

            {/* Right Column: Legal Mauritanian Deductions & Net Result */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'ar' ? 'الاقتطاعات الاجتماعية والضريبية الموريتانية' : 'Cotisations Sociales & Fiscales RIM'}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Barème Officiel CGI</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* CNSS */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">CNSS (Caisse Nationale de Sécurité Sociale)</span>
                      <span className="text-[10px] text-slate-500">Part salariale 1% (Plafond mensuel: 7 000 MRU)</span>
                    </div>
                    <div className="text-end">
                      <span className="font-bold text-rose-600 font-mono">-{cnssEmployee.toLocaleString()} MRU</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Patronale: {cnssEmployer.toLocaleString()} MRU (15%)</span>
                    </div>
                  </div>

                  {/* CNAM */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">CNAM (Assurance Maladie Obligatoire)</span>
                      <span className="text-[10px] text-slate-500">Part salariale 4% sur salaire brut imposable</span>
                    </div>
                    <div className="text-end">
                      <span className="font-bold text-rose-600 font-mono">-{cnamEmployee.toLocaleString()} MRU</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Patronale: {cnamEmployer.toLocaleString()} MRU (5%)</span>
                    </div>
                  </div>

                  {/* ITS */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">ITS (Impôt sur les Traitements et Salaires)</span>
                      <span className="text-[10px] text-slate-500">Barème progressif Direction Générale des Impôts (DGI)</span>
                    </div>
                    <div className="text-end">
                      <span className="font-bold text-rose-600 font-mono">-{itsAmount.toLocaleString()} MRU</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Base imposable: {taxableBase.toLocaleString()} MRU</span>
                    </div>
                  </div>
                </div>

                {/* Total Deductions Bar */}
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-rose-900">{language === 'ar' ? 'مجموع الاقتطاعات من الراتب :' : 'Total Retenues Salariales :'}</span>
                  <span className="font-black text-sm text-rose-700 font-mono">-{totalDeductions.toLocaleString()} MRU</span>
                </div>
              </div>

              {/* NET SALARY CARD */}
              <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">
                      {language === 'ar' ? 'الصافي للدفع للموظف' : 'SALAIRE NET À PAYER (NET À PERCEVOIR)'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono mt-0.5">
                      {netSalary.toLocaleString()} {companySettings.currency}
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs font-bold">
                    <DollarSign className="w-7 h-7 text-emerald-100" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 text-xs text-emerald-100">
                  <span className="text-[10px] text-emerald-200 block">{language === 'ar' ? 'المبلغ بالأحرف :' : 'Montant en toutes lettres :'}</span>
                  <p className="font-serif italic font-bold">
                    {numberToWordsFR(netSalary, 'MRU')}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-100 border-t border-white/20">
                  <span>Coût global employeur : <strong>{totalCostCompany.toLocaleString()} MRU</strong></span>
                  <button
                    onClick={() => setPrintDocType('payslip')}
                    className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'طباعة كشف الراتب' : 'Imprimer Bulletin de Paie'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: OFFICIAL MAURITANIAN HR DOCUMENTS GENERATOR */}
      {/* ===================================================================== */}
      {activeSubTab === 'documents' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-700" />
              <span className="text-xs font-bold text-slate-700">
                {language === 'ar' ? 'الموظف المعني بالشهادة الإدارية :' : 'Collaborateur concerné :'}
              </span>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.matricule}) — {emp.position}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Génération certifiée conforme aux modèles administratifs mauritaniens
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Document 1: Attestation de Travail */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'شهادة عمل رسمية' : 'Attestation de Travail'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ar'
                    ? 'شهادة تثبت انخراط الموظف في المعهد مع بيان تاريخ الاكتتاب والرقم الوظيفي NNI.'
                    : 'Certificat officiel attestant de l\'emploi de l\'agent, son matricule, NNI et date de recrutement.'}
                </p>
              </div>
              <button
                onClick={() => setPrintDocType('attestation_travail')}
                className="w-full py-2.5 px-3 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معاينة وطباعة الشهادة' : 'Éditer et Imprimer'}</span>
              </button>
            </div>

            {/* Document 2: Attestation de Salaire & Domiciliation */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'شهادة راتب وتوطين بنكي' : 'Attestation de Salaire & Prise en Charge'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ar'
                    ? 'شهادة تثبت راتب الموظف موجهة للبنوك الموريتانية (BCI, BNM, BMCI, BPM) لمنح التسهيلات.'
                    : 'Document officiel certifiant la rémunération mensuelle nette pour les dossiers de crédit bancaire.'}
                </p>
              </div>
              <button
                onClick={() => setPrintDocType('attestation_salaire')}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معاينة وطباعة الشهادة' : 'Éditer et Imprimer'}</span>
              </button>
            </div>

            {/* Document 3: Titre de Congé Réglementaire */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'قرار منح رخصة إجازة رسمية' : 'Titre de Congé Réglementaire'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ar'
                    ? 'مقرر إداري رسمي بمنح إجازة سنوية مدفوعة الأجر وفق المادة 165 من قانون العمل.'
                    : 'Décision formelle d\'octroi de congés légaux payés conforme à l\'article 165 du Code du Travail.'}
                </p>
              </div>
              <button
                onClick={() => setPrintDocType('titre_conge')}
                className="w-full py-2.5 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معاينة وطباعة القرار' : 'Éditer et Imprimer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: LEGAL GUIDE & MAURITANIAN LABOR LAW CODE SUMMARY */}
      {/* ===================================================================== */}
      {activeSubTab === 'legal' && (
        <div className="space-y-4 animate-in fade-in duration-200 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Article 1: Congés Annuels Payés */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[11px]">
                  165
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'العطلة السنوية المدفوعة الأجر (المادة 165 وما بعدها)' : 'Congés Annuels Payés (Art. 165)'}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'يستحق العامل إجازة سنوية مدفوعة الأجر تحسب على أساس يومين ونصف (2.5) يوم عن كل شهر خدمة فعلية، أي ما يعادل ثلاثين (30) يوماً تقويمياً عن كل سنة كاملة من العمل. تزاد هذه المدة بالنسبة لأقدمية الخدمة في المؤسسة.'
                  : 'Le travailleur acquiert droit au congé payé à raison de deux jours et demi (2,5) par mois de service effectif, soit 30 jours calendaires par année complète de travail. Des majorations sont accordées au titre de l\'ancienneté.'}
              </p>
            </div>

            {/* Article 2: Permissions Exceptionnelles */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  178
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'الرخص الاستثنائية مدفوعة الأجر (المادة 178)' : 'Permissions Exceptionnelles Payées (Art. 178)'}
                </h3>
              </div>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                <li>{language === 'ar' ? 'زواج العامل : 3 أيام عمل' : 'Mariage du travailleur : 3 jours'}</li>
                <li>{language === 'ar' ? 'وفاة الزوج أو الأب أو الأم أو أحد الأبناء : 3 أيام عمل' : 'Décès conjoint, père, mère, enfant : 3 jours'}</li>
                <li>{language === 'ar' ? 'ولادة طفل في بيت العامل : 3 أيام عمل' : 'Naissance d\'un enfant au foyer : 3 jours'}</li>
                <li>{language === 'ar' ? 'زواج أحد الأبناء : يوم واحد' : 'Mariage d\'un enfant : 1 jour'}</li>
                <li>{language === 'ar' ? 'إجازة الحج إلى مكة المكرمة : 30 يوماً مرة واحدة' : 'Pèlerinage à La Mecque : 30 jours (une fois)'}</li>
              </ul>
            </div>

            {/* Article 3: Protection Sociale (CNSS & CNAM) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[11px]">
                  SS
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'الضمان الاجتماعي والتأمين الصحي (CNSS & CNAM)' : 'Régime Social (CNSS & CNAM)'}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'التسجيل في الصندوق الوطني للضمان الاجتماعي إلزامي لكافة العمال والموظفين (اقتطاع 1% مع سقف 7,000 أوقية شهرياً، ومساهمة مشغل 15%). التأمين الصحي CNAM إلزامي بنسبة 4% على العامل و 5% على المشغل.'
                  : 'L\'immatriculation à la CNSS est obligatoire (1% retenue salariale plafonnée à 7 000 MRU/mois, 15% cotisation patronale). La CNAM prélève 4% part salariale et 5% part patronale sur l\'ensemble du salaire brut imposable.'}
              </p>
            </div>

            {/* Article 4: Missions & Déplacements */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">
                  OM
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'نظام أوامر المهمة والتعويضات اليومية' : 'Régime des Ordres de Mission & Per Diem'}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'تصرف تعويضات المهمة وفق المعادلة الرسمية: (أيام المهمة × تعويض اليوم حسب الصنف الإداري) + مصاريف النقل المسجلة يدوياً. يستفيد الوكيل من تسبيق مالي بنسبة تصل إلى 80%، وتتم التسوية الإلزامية خلال 15 يوماً من العودة.'
                  : 'Les frais de mission couvrent les indemnités journalières et le transport direct. Une avance réglementaire de 80% est ordonnancée avant le départ, suivie d\'une régularisation sur état de liquidation dans les 15 jours suivant le retour.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PRINT MODAL VIEW (PAYSLIP OR OFFICIAL ATTESTATION) */}
      {/* ===================================================================== */}
      {printDocType && (
        <div 
          onClick={() => setPrintDocType(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto cursor-default relative my-auto"
          >
            {/* Header with Print & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-700" />
                <h2 className="font-bold text-sm text-slate-900">
                  {printDocType === 'payslip' ? 'Bulletin de Paie Officiel' : 'Document Administratif Officiel'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => setPrintDocType(null)}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 cursor-pointer text-xs font-bold"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* PRINT AREA */}
            <div className="p-6 font-serif text-slate-900 bg-white border border-slate-200 print:border-none print:p-0 space-y-6">
              
              {/* Official Header */}
              <div className="grid grid-cols-12 items-center border-b-2 border-slate-900 pb-3 gap-2">
                <div className="col-span-5 text-start text-[11px] leading-tight text-slate-800">
                  <p className="font-bold text-[12px]">RÉPUBLIQUE ISLAMIQUE DE MAURITANIE</p>
                  <p className="italic text-[10px] text-slate-600">Honneur • Fraternité • Justice</p>
                  <p className="font-semibold text-slate-700">Ministère des Pêches et de l'Economie Maritime</p>
                  <p className="font-bold text-sky-950">
                    Institut Mauritanien de Recherches Océanographiques et des Pêches
                  </p>
                </div>

                <div className="col-span-2 flex justify-center">
                  <ImropLogo size={55} showText={false} />
                </div>

                <div className="col-span-5 text-end text-[11px] leading-tight text-slate-800" dir="rtl">
                  <p className="font-bold text-[12px]">الجمهورية الإسلامية الموريتانية</p>
                  <p className="italic text-[10px] text-slate-600">شرف • إخاء • عدالة</p>
                  <p className="font-semibold text-slate-700">وزارة الصيد والاقتصاد البحري</p>
                  <p className="font-bold text-sky-950">
                    المعهد الموريتاني لبحوث المحيطات والصيد
                  </p>
                </div>
              </div>

              {/* 1. PAYSLIP PRINT PREVIEW */}
              {printDocType === 'payslip' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="text-center py-2 border-b border-slate-300">
                    <h2 className="font-black text-base uppercase tracking-wider text-slate-900">BULLETIN DE SALAIRE & DÉCOMPTE MENSUEL</h2>
                    <p className="text-[11px] text-slate-500">Période : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-300 text-[11px]">
                    <div>
                      <p>Agent : <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong></p>
                      <p>Matricule de Solde : <strong>{selectedEmp.matricule}</strong></p>
                      <p>NNI : <strong>{selectedEmp.nni || '1489201934'}</strong></p>
                      <p>Emploi : <strong>{selectedEmp.position}</strong></p>
                    </div>
                    <div className="text-end">
                      <p>Département : <strong>{selectedEmp.department}</strong></p>
                      <p>Banque : <strong>{selectedEmp.bankName || 'BCI'} ({selectedEmp.bankAccount || '8984'})</strong></p>
                      <p>N° CNSS : <strong>{selectedEmp.cnss || '09843-CNSS'}</strong></p>
                      <p>Catégorie : <strong>{selectedEmp.grade}</strong></p>
                    </div>
                  </div>

                  <table className="w-full text-start border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-start">Libellé des éléments</th>
                        <th className="border border-slate-300 p-2 text-end">Gains (MRU)</th>
                        <th className="border border-slate-300 p-2 text-end">Retenues (MRU)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border border-slate-300 font-medium">Salaire de Base</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{baseSalary.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-300 font-medium">Indemnité de Transport (Exonérée 3 000 MRU)</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{transportAllowance.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-300 font-medium">Indemnité de Logement</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{housingAllowance.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-300 font-medium">Prime d'Ancienneté</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{seniorityAllowance.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-300 font-medium">Prime de Fonction / Responsabilité</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{responsibilityAllowance.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                      </tr>
                      <tr className="bg-rose-50/50">
                        <td className="p-2 border border-slate-300 font-medium text-rose-800">Cotisation CNSS Ouvrière (1% - Plafond 7 000 MRU)</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                        <td className="p-2 border border-slate-300 text-end font-mono text-rose-700">{cnssEmployee.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-rose-50/50">
                        <td className="p-2 border border-slate-300 font-medium text-rose-800">Cotisation CNAM Ouvrière (4%)</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                        <td className="p-2 border border-slate-300 text-end font-mono text-rose-700">{cnamEmployee.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-rose-50/50">
                        <td className="p-2 border border-slate-300 font-medium text-rose-800">Impôt sur les Traitements et Salaires (ITS)</td>
                        <td className="p-2 border border-slate-300 text-end"></td>
                        <td className="p-2 border border-slate-300 text-end font-mono text-rose-700">{itsAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-2 border border-slate-300">TOTAL BRUT / TOTAL RETENUES</td>
                        <td className="p-2 border border-slate-300 text-end font-mono">{grossSalary.toLocaleString()} MRU</td>
                        <td className="p-2 border border-slate-300 text-end font-mono text-rose-700">{totalDeductions.toLocaleString()} MRU</td>
                      </tr>
                      <tr className="bg-emerald-100/70 font-black text-sm">
                        <td className="p-2.5 border border-slate-300 text-emerald-950 uppercase">NET À PAYER (VIREMENT BANCAIRE)</td>
                        <td colSpan={2} className="p-2.5 border border-slate-300 text-end font-mono text-emerald-900 text-base">
                          {netSalary.toLocaleString()} MRU
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="pt-2 text-[11px] italic text-slate-700">
                    Arrêté le présent bulletin à la somme nette de : <strong>{numberToWordsFR(netSalary, 'MRU')}</strong>
                  </div>

                  <div className="grid grid-cols-2 pt-8 text-center text-xs">
                    <div>
                      <p className="font-bold underline">L'Agent Bénéficiaire</p>
                      <p className="text-[10px] text-slate-400 mt-8">(Signature pour acquit)</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Le Directeur des Ressources Humaines</p>
                      <p className="text-[10px] text-slate-700 mt-6 font-bold">{companySettings.hrDirectorName || 'Direction RH IMROP'}</p>
                      <p className="text-[9px] text-slate-400">Visa & Cachet Officiel</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ATTESTATION DE TRAVAIL PREVIEW */}
              {printDocType === 'attestation_travail' && (
                <div className="space-y-6 text-sm leading-relaxed">
                  <div className="text-center py-4 border-y border-slate-300">
                    <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900">
                      ATTESTATION DE TRAVAIL
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">N° RH/IMROP/{new Date().getFullYear()}/048</p>
                  </div>

                  <div className="space-y-4 text-justify">
                    <p>
                      Le Directeur des Ressources Humaines de l'<strong>Institut Mauritanien de Recherches Océanographiques et des Pêches (IMROP)</strong>, soussigné, certifie par la présente que :
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-1 font-sans text-xs">
                      <p>{selectedEmp.civility === 'Madame' ? 'Madame' : 'Monsieur'} : <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong> {selectedEmp.firstNameAr ? `(${selectedEmp.firstNameAr} ${selectedEmp.lastNameAr || ''})` : ''}</p>
                      <p>Numéro National d'Identification (NNI) : <strong>{selectedEmp.nni || '1489201934'}</strong></p>
                      <p>Matricule de Solde : <strong>{selectedEmp.matricule}</strong></p>
                      <p>Numéro CNSS : <strong>{selectedEmp.cnss || '09843-CNSS'}</strong></p>
                      <p>Fonction actuelle : <strong>{selectedEmp.position}</strong></p>
                      <p>Département / Service : <strong>{selectedEmp.department}</strong></p>
                    </div>

                    <p>
                      Est employé(e) au sein de notre établissement public en qualité de <strong>{selectedEmp.grade}</strong> depuis le <strong>{selectedEmp.hireDate || '01/01/2018'}</strong> et continue d'exercer ses fonctions à ce jour avec assiduité et compétence.
                    </p>

                    <p>
                      La présente attestation lui est délivrée sur sa demande pour servir et valoir ce que de droit.
                    </p>
                  </div>

                  <div className="pt-8 flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                      Fait à Nouadhibou, le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-center">
                      <p className="font-bold underline text-xs">Le Directeur des Ressources Humaines</p>
                      <p className="font-bold text-xs mt-6">{companySettings.hrDirectorName || 'Direction RH IMROP'}</p>
                      <p className="text-[10px] text-slate-400">Cachet & Signature de l'IMROP</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ATTESTATION DE SALAIRE PREVIEW */}
              {printDocType === 'attestation_salaire' && (
                <div className="space-y-6 text-sm leading-relaxed">
                  <div className="text-center py-4 border-y border-slate-300">
                    <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900">
                      ATTESTATION DE SALAIRE ET DE DOMICILIATION
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">Pour les banques et établissements financiers</p>
                  </div>

                  <div className="space-y-4 text-justify">
                    <p>
                      La Direction de l'<strong>Institut Mauritanien de Recherches Océanographiques et des Pêches (IMROP)</strong> atteste que {selectedEmp.civility === 'Madame' ? 'Madame' : 'Monsieur'} <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong>, titulaire du NNI N°<strong>{selectedEmp.nni || '1489201934'}</strong> et du Matricule N°<strong>{selectedEmp.matricule}</strong>, perçoit une rémunération mensuelle nette comme suit :
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-1 font-sans text-xs">
                      <p>Salaire Brut Mensuel : <strong>{grossSalary.toLocaleString()} MRU</strong></p>
                      <p>Total des Déductions Sociales et Fiscales : <strong>{totalDeductions.toLocaleString()} MRU</strong></p>
                      <p className="text-emerald-800 text-sm font-black pt-1">
                        Salaire Net Mensuel à Payer : {netSalary.toLocaleString()} MRU
                      </p>
                      <p className="text-[11px] italic text-slate-600">({numberToWordsFR(netSalary, 'MRU')})</p>
                    </div>

                    <p>
                      Son salaire est régulièrement domicilié auprès de l'agence bancaire : <strong>{selectedEmp.bankName || 'BCI'}</strong> sous le compte N°<strong>{selectedEmp.bankAccount || '8984'}</strong>.
                    </p>

                    <p>
                      En foi de quoi, cette attestation est délivrée à l'intéressé(e) pour faire valoir ses droits auprès des tiers.
                    </p>
                  </div>

                  <div className="pt-8 flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                      Fait à Nouadhibou, le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-center">
                      <p className="font-bold underline text-xs">Le Directeur Administratif et Financier</p>
                      <p className="font-bold text-xs mt-6">{companySettings.directorName || 'Directeur Général IMROP'}</p>
                      <p className="text-[10px] text-slate-400">Signature & Sceau officiel</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TITRE DE CONGE PREVIEW */}
              {printDocType === 'titre_conge' && (
                <div className="space-y-6 text-sm leading-relaxed">
                  <div className="text-center py-4 border-y border-slate-300">
                    <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900">
                      TITRE OFFICIEL DE CONGÉ PAYÉ
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">Réglementation Code du Travail Mauritanien (Loi n° 2004-017)</p>
                  </div>

                  <div className="space-y-4 text-justify">
                    <p>
                      Vu le Code du Travail mauritanien et notamment ses articles 165 à 178 portant réglementation des congés et absences ;
                    </p>
                    <p>
                      Il est accordé à {selectedEmp.civility === 'Madame' ? 'Madame' : 'Monsieur'} <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong>, Matricule <strong>{selectedEmp.matricule}</strong>, occupant le poste de <strong>{selectedEmp.position}</strong> :
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-1 font-sans text-xs">
                      <p>Nature du Congé : <strong>Congé Annuel Réglementaire Payé</strong></p>
                      <p>Durée accordée : <strong>30 jours calendaires</strong></p>
                      <p>Exercice de référence : <strong>{new Date().getFullYear()}</strong></p>
                      <p>Lieu de séjour pendant le congé : <strong>Nouakchott / Nouadhibou (Mauritanie)</strong></p>
                      <p>Date de reprise effective de service : <strong>Au terme des 30 jours calendaires</strong></p>
                    </div>

                    <p>
                      L'agent conserve l'intégralité de sa rémunération principale durant toute la durée de cette période de congé.
                    </p>
                  </div>

                  <div className="pt-8 flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                      Fait à Nouadhibou, le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-center">
                      <p className="font-bold underline text-xs">Le Directeur Général de l'IMROP</p>
                      <p className="font-bold text-xs mt-6">{companySettings.directorName || 'Dr. Directeur IMROP'}</p>
                      <p className="text-[10px] text-slate-400">Pour visa et exécution</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
