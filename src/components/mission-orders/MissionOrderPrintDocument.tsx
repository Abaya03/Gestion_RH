import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MissionOrder } from '../../types';
import { Printer, X, ShieldCheck, CheckSquare, Square, Building2, ArrowLeft } from 'lucide-react';
import { ImropLogo } from '../common/ImropLogo';

interface MissionOrderPrintDocumentProps {
  mission: MissionOrder;
  onClose: () => void;
}

export const MissionOrderPrintDocument: React.FC<MissionOrderPrintDocumentProps> = ({ mission, onClose }) => {
  const { language, t, companySettings, getEmployeeById } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const employee = getEmployeeById(mission.employeeId);
  const isMale = employee?.civility !== 'Madame';
  const isAbroad = mission.destinationType === 'a_letranger';
  const isCar = mission.transportSelection === 'voiture' || mission.transportMode?.includes('voiture');
  const isPlane = mission.transportSelection === 'avion' || mission.transportMode === 'avion';
  const isImropBudget = mission.budgetImputation === 'IMROP' || !mission.budgetImputation;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.toLowerCase().includes('fin')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 space-y-4 print:shadow-none print:p-0 print:border-none print:w-full cursor-default my-auto relative"
      >
        
        {/* Modal Header & Controls (Sticky so always reachable when scrolled) */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-30 flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Modèle Officiel IMROP : Ordre de Mission N°{mission.orderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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

        {/* PRINTABLE PAGE (Conforming precisely to official IMROP document) */}
        <div 
          id="imrop-mission-order-print" 
          className="bg-white p-6 sm:p-10 font-serif text-slate-900 max-w-[800px] mx-auto border border-slate-200 print:border-none print:p-8 space-y-7 leading-relaxed"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          {/* Top subtle agency watermark / logo (small) */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-100 pb-2 print:border-none">
            <div className="flex items-center gap-2">
              <ImropLogo size={28} showText={false} />
              <span className="font-sans font-semibold tracking-wider text-slate-500 uppercase text-[9px]">
                {companySettings.name} ({companySettings.acronym || 'IMROP'})
              </span>
            </div>
            <span className="font-sans text-[9px] text-slate-400">
              Nouadhibou, République Islamique de Mauritanie
            </span>
          </div>

          {/* MAIN DOCUMENT TITLE BOX */}
          <div className="border-2 border-slate-900 py-2.5 px-4 text-center">
            <h1 className="text-base sm:text-xl font-bold tracking-wide uppercase">
              ORDRE DE MISSION N°<u>{mission.orderNumber}</u>
            </h1>
          </div>

          {/* SECTION 1: AGENT MISSIONNÉ */}
          <div className="space-y-2 text-sm sm:text-base">
            <div className="font-bold text-slate-900">
              Agent missionné :
            </div>
            <div className="flex items-center gap-8 pl-2 sm:pl-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Monsieur</span>
                <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                  {isMale ? '☒' : '☐'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Madame</span>
                <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                  {!isMale ? '☒' : '☐'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 pl-2 sm:pl-4 pt-1">
              <div>
                <span className="font-bold">Nom & Prénom : </span>
                <span className="font-medium text-slate-900 uppercase">
                  {employee?.firstName} {employee?.lastName}
                </span>
              </div>
              <div>
                <span className="font-bold">Fonction : </span>
                <span className="font-medium text-slate-800">
                  {employee?.position || 'Chercheur'}, {employee?.department || 'IMROP'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: DESTINATION */}
          <div className="space-y-2 text-sm sm:text-base">
            <div className="flex items-center gap-8">
              <span className="font-bold">Se rend :</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                  {!isAbroad ? '☒' : '☐'}
                </span>
                <span>en Mauritanie</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                  {isAbroad ? '☒' : '☐'}
                </span>
                <span>à l’étranger</span>
              </div>
            </div>

            <div className="pl-2 sm:pl-4">
              <span className="font-bold">Précisions : </span>
              <span className="font-medium text-slate-900">
                {mission.destinationPrecisions || mission.destination}
              </span>
            </div>
          </div>

          {/* SECTION 3: MOTIF DE LA MISSION */}
          <div className="space-y-1 text-sm sm:text-base">
            <div className="font-bold">Motif de la mission :</div>
            <div className="min-h-[44px] bg-slate-50/50 p-2 border-b border-slate-300 font-medium text-slate-900">
              {mission.purpose}
            </div>
          </div>

          {/* SECTION 4: AUTRES MEMBRES DE LA MISSION */}
          <div className="space-y-1 text-sm sm:text-base">
            <div className="font-bold">Autres Membres de la mission :</div>
            <div className="min-h-[32px] bg-slate-50/50 p-2 border-b border-slate-300 font-medium text-slate-900">
              {mission.otherMembers || 'Néant'}
            </div>
          </div>

          {/* SECTION 5: DATES DE MISSION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base pt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">Date de début de mission :</span>
              <span className="font-medium text-slate-900 underline">
                {formatDateDisplay(mission.departureDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Date de fin de mission :</span>
              <span className="font-medium text-slate-900 underline">
                {formatDateDisplay(mission.returnDate)}
              </span>
            </div>
          </div>

          {/* SECTION 6: MOYEN DE TRANSPORT */}
          <div className="flex items-center gap-8 text-sm sm:text-base">
            <span className="font-bold">Moyen de transport :</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                {isCar ? '☒' : '☐'}
              </span>
              <span>Voiture</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                {isPlane ? '☒' : '☐'}
              </span>
              <span>Avion</span>
            </div>
            {!isCar && !isPlane && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                  ☒
                </span>
                <span>Autre ({mission.transportMode})</span>
              </div>
            )}
          </div>

          {/* SECTION 7: IMPUTATION BUDGÉTAIRE */}
          <div className="flex items-center gap-8 text-sm sm:text-base">
            <span className="font-bold">Imputation budgétaire :</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                {isImropBudget ? '☒' : '☐'}
              </span>
              <span>IMROP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 border border-slate-900 text-xs font-bold font-sans">
                {!isImropBudget ? '☒' : '☐'}
              </span>
              <span>Autre : {mission.budgetImputationOther || '..................'}</span>
            </div>
          </div>

          {/* BOTTOM SIGNATURE TABLE */}
          <div className="pt-6">
            <table className="w-full border-t-2 border-b-2 border-slate-900 text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="w-1/2 p-3 text-start font-bold border-r border-slate-900 uppercase">
                    Directeur
                  </th>
                  <th className="w-1/2 p-3 text-start font-bold uppercase">
                    Attestation de participation
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-36 align-top">
                  <td className="p-3 border-r border-slate-900 text-slate-700 flex flex-col justify-between h-36">
                    <span className="italic text-[11px] text-slate-500">
                      Vu et approuvé pour exécution
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-xs">
                        {companySettings.hrDirectorName || 'Dr. Mohamed Mahmoud Ould TFEIL'}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {companySettings.hrDirectorTitle || 'Directeur Général IMROP'}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600 flex flex-col justify-between h-36">
                    <p className="text-[11px] leading-snug">
                      Cachet organisme d’accueil, de la Police des frontières, des structures décentralisées de l’IMROP
                    </p>
                    <div className="border border-dashed border-slate-300 rounded p-2 text-center text-[10px] text-slate-400">
                      [ Emplacement Cachet & Visa d'arrivée / départ ]
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le document</span>
          </button>
        </div>

      </div>
    </div>
  );
};
