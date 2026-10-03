import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseClaim } from '../../types';
import { Printer, X, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ImropLogo } from '../common/ImropLogo';
import { numberToWordsFR } from '../../utils/numberToWords';

interface ExpenseClaimPrintDocumentProps {
  claim: ExpenseClaim;
  onClose: () => void;
}

export const ExpenseClaimPrintDocument: React.FC<ExpenseClaimPrintDocumentProps> = ({ claim, onClose }) => {
  const { t, companySettings, getEmployeeById, missionOrders } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const employee = getEmployeeById(claim.employeeId);
  const mission = claim.missionOrderId ? missionOrders.find(m => m.id === claim.missionOrderId) : undefined;

  const handlePrint = () => {
    window.print();
  };

  const formatAmount = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('fr-FR');
  };

  const amountInWordsText = claim.amountInWords || numberToWordsFR(claim.netPayable || claim.totalExpenses, 'MRU');

  const startDateDisplay = claim.missionStartDate || (mission ? mission.departureDate.split('-').reverse().join('/') : '');
  const endDateDisplay = claim.missionEndDate || (mission ? (mission.returnDate.includes('-') ? mission.returnDate.split('-').reverse().join('/') : mission.returnDate) : '');

  const omNumberDisplay = claim.referenceOM || (mission ? (mission.orderNumber.length > 3 ? mission.orderNumber.slice(-3) : mission.orderNumber) : '014');

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 print:shadow-none print:p-0 print:border-none print:w-full cursor-default my-auto relative"
      >
        
        {/* Controls (Sticky so always visible when scrolling) */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-30 flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Modèle Officiel IMROP : État de Paiement N°{claim.claimNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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

        {/* PRINTABLE DOCUMENT AREA (Landscape / Broad format matching IMROP PDF) */}
        <div 
          id="imrop-etat-paiement-print" 
          className="bg-white p-4 sm:p-8 font-sans text-slate-900 max-w-5xl mx-auto border border-slate-300 print:border-none print:p-4 space-y-3 text-xs"
        >
          {/* OFFICIAL HEADER (Left: French, Center: IMROP Logo, Right: Arabic) */}
          <div className="grid grid-cols-12 items-center border-b border-slate-300 pb-3 gap-2">
            {/* French Header */}
            <div className="col-span-4 text-start space-y-0.5 text-[11px] leading-tight text-slate-700 font-serif">
              <p className="font-bold text-slate-900 text-[12px]">République Islamique de Mauritanie</p>
              <p className="text-[10px] text-slate-500 italic">Honneur • Fraternité • Justice</p>
              <p className="font-semibold text-slate-800 text-[11px]">Ministère des Pêches et de l'Economie Maritime</p>
              <p className="font-bold text-sky-950 text-[11px]">
                Institut Mauritanien de Recherches Océanographiques et des Pêches
              </p>
            </div>

            {/* IMROP Logo */}
            <div className="col-span-4 flex justify-center">
              <ImropLogo size={62} showText={false} />
            </div>

            {/* Arabic Header */}
            <div className="col-span-4 text-end space-y-0.5 text-[11px] leading-tight text-slate-700 font-cairo" dir="rtl">
              <p className="font-bold text-slate-900 text-[12px]">الجمهورية الإسلامية الموريتانية</p>
              <p className="text-[10px] text-slate-500">شرف - إخاء - عدالة</p>
              <p className="font-semibold text-slate-800 text-[11px]">وزارة الصيد والاقتصاد البحري</p>
              <p className="font-bold text-sky-950 text-[11px]">
                المعهد الموريتاني لبحوث المحيطات والصيد
              </p>
            </div>
          </div>

          {/* MAIN DOCUMENT TITLE BANNER */}
          <div className="bg-slate-200 border-2 border-slate-900 py-1.5 px-3 text-center">
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-slate-950">
              ETAT DE PAIEMENT N°{claim.claimNumber}
            </h1>
          </div>

          {/* METADATA FORM BOX (Référence, Date, Motif, Taux BCM) */}
          <table className="w-full border-2 border-slate-900 text-[11px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="w-40 font-bold p-1.5 bg-slate-50 border-r border-slate-900">
                  Référence
                </td>
                <td className="p-1.5 font-semibold text-slate-900">
                  {claim.referenceOM ? `Ordre de Mission N°${claim.referenceOM}` : 'Ordre de Mission'}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="font-bold p-1.5 bg-slate-50 border-r border-slate-900">
                  Date
                </td>
                <td className="p-1.5 font-semibold text-slate-900">
                  {claim.submissionDate}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="font-bold p-1.5 bg-slate-50 border-r border-slate-900">
                  Motif Paiement
                </td>
                <td className="p-1.5 font-bold text-slate-900">
                  {claim.paymentReason}
                </td>
              </tr>
              <tr>
                <td className="font-bold p-1.5 bg-slate-50 border-r border-slate-900">
                  Taux BCM du jour
                </td>
                <td className="p-1.5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">1 €</span>
                      <span className="bg-[#fef08a] px-3 py-0.5 font-black border border-slate-900 text-slate-950">
                        {claim.bcmRateEuro ? claim.bcmRateEuro.toString().replace('.', ',') : '37,14'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">1 $</span>
                      <span className="bg-slate-100 px-3 py-0.5 font-bold border border-slate-400 text-slate-900">
                        {claim.bcmRateDollar !== undefined ? claim.bcmRateDollar : '0'}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* MAIN DATA TABULAR BREAKDOWN (Exactly matching IMROP Columns) */}
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-slate-900 text-[10px] sm:text-[11px] border-collapse text-center">
              <thead className="bg-slate-100 border-b-2 border-slate-900 font-bold text-slate-900 uppercase">
                <tr>
                  <th className="p-1 border border-slate-900 text-start min-w-[120px]">Noms et Prénoms</th>
                  <th className="p-1 border border-slate-900 min-w-[70px]">NNI</th>
                  <th className="p-1 border border-slate-900 text-start min-w-[100px]">Fonction</th>
                  <th className="p-1 border border-slate-900 min-w-[36px]">OM</th>
                  <th className="p-1 border border-slate-900 min-w-[65px]">Début</th>
                  <th className="p-1 border border-slate-900 min-w-[65px]">Fin</th>
                  <th className="p-1 border border-slate-900 min-w-[28px]">Nb</th>
                  <th className="p-1 border border-slate-900 min-w-[50px]">Taux MRU/j</th>
                  <th className="p-1 border border-slate-900 min-w-[50px]">Transport</th>
                  <th className="p-1 border border-slate-900 min-w-[45px]">Taux $/j</th>
                  <th className="p-1 border border-slate-900 min-w-[45px]">Taux €/J</th>
                  <th className="p-1 border border-slate-900 min-w-[50px] bg-slate-200">TOT €</th>
                  <th className="p-1 border border-slate-900 min-w-[45px]">Bank</th>
                  <th className="p-1 border border-slate-900 min-w-[55px]">Compte</th>
                  <th className="p-1 border border-slate-900 min-w-[65px] bg-slate-200 font-black">TOTAL MRU</th>
                  <th className="p-1 border border-slate-900 min-w-[60px]">Imputation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                <tr className="font-semibold text-slate-900">
                  <td className="p-1.5 border border-slate-900 text-start font-bold">
                    {employee?.firstName} {employee?.lastName}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-mono">
                    {employee?.nni || '1489201934'}
                  </td>
                  <td className="p-1.5 border border-slate-900 text-start">
                    {employee?.position || 'Chercheur Biologiste'}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-bold">
                    {omNumberDisplay}
                  </td>
                  <td className="p-1.5 border border-slate-900 whitespace-nowrap">
                    {startDateDisplay}
                  </td>
                  <td className="p-1.5 border border-slate-900 whitespace-nowrap">
                    {endDateDisplay}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-bold">
                    {claim.daysCount || 6}
                  </td>
                  <td className="p-1.5 border border-slate-900">
                    {formatAmount(claim.perDiemDailyRateMru)}
                  </td>
                  <td className="p-1.5 border border-slate-900">
                    {formatAmount(claim.transportAmountMru)}
                  </td>
                  <td className="p-1.5 border border-slate-900">
                    {formatAmount(claim.perDiemDailyRateDollar)}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-bold text-sky-950">
                    {formatAmount(claim.perDiemDailyRateEuro || (claim.totalDevise && claim.daysCount ? Math.round(claim.totalDevise / claim.daysCount) : 150))}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-black bg-slate-100">
                    {formatAmount(claim.totalDevise || (claim.daysCount ? (claim.perDiemDailyRateEuro || 150) * claim.daysCount : 900))}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-bold">
                    {claim.bankName || employee?.bankName || 'BCI'}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-mono">
                    {claim.bankAccount || employee?.bankAccount || '8984'}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-black bg-slate-100 text-slate-950 text-xs">
                    {formatAmount(claim.totalExpenses || 33426)}
                  </td>
                  <td className="p-1.5 border border-slate-900 font-bold">
                    {claim.imputation || 'IMROP'}
                  </td>
                </tr>

                {/* NET A PERCEVOIR SUMMARY ROW */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td colSpan={14} className="p-1.5 border border-slate-900 text-end font-black uppercase text-[11px] pr-4">
                    NET A PERCEVOIR
                  </td>
                  <td className="p-1.5 border border-slate-900 font-black text-xs sm:text-sm text-slate-950 bg-slate-200">
                    {formatAmount(claim.netPayable || claim.totalExpenses || 33426)}
                  </td>
                  <td className="p-1.5 border border-slate-900"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ARRÊTÉ LE PRÉSENT ÉTAT BOX (Somme en toutes lettres) */}
          <div className="border-2 border-slate-900 p-2 text-xs sm:text-sm font-semibold bg-slate-50">
            <span className="font-bold">Arrêté le présent état à la somme de : </span>
            <span className="font-bold underline uppercase text-slate-950">
              {amountInWordsText}
            </span>
          </div>

          {/* SIGNATURES BLOCK (3 Columns: Le Chef SRH, Le Comptable, Le Directeur) */}
          <div className="pt-2">
            <table className="w-full border-2 border-slate-900 text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900">
                  <th className="w-1/3 p-2 text-start font-bold border-r border-slate-900 uppercase">
                    Le Chef SRH
                  </th>
                  <th className="w-1/3 p-2 text-start font-bold border-r border-slate-900 uppercase">
                    Le Comptable
                  </th>
                  <th className="w-1/3 p-2 text-start font-bold uppercase">
                    Le Directeur
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-28 align-top">
                  <td className="p-2 border-r border-slate-900 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-500 italic">Vérifié et conforme</span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {companySettings.chefSrhName || 'Mariem MINT CHEIKH'}
                    </span>
                  </td>
                  <td className="p-2 border-r border-slate-900 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-500 italic">Bon à payer</span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {companySettings.comptableName || 'Cheikh Tidjane BA'}
                    </span>
                  </td>
                  <td className="p-2 flex flex-col justify-between h-28">
                    <span className="text-[10px] text-slate-500 italic">Approuvé pour ordonnancement</span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {companySettings.hrDirectorName || 'Dr. Mohamed Mahmoud Ould TFEIL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER METADATA STAMP */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
            <span>Institut Mauritanien de Recherches Océanographiques et des Pêches - Système RH & Finances</span>
            <span className="font-mono font-bold">SRH, {new Date().toLocaleDateString('fr-FR')}</span>
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
