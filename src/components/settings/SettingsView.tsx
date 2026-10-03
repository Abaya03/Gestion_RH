import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerDiemRate, CompanySettings } from '../../types';
import { 
  Settings, 
  Building, 
  Calculator, 
  Activity, 
  RotateCcw, 
  Save, 
  Check, 
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    t, 
    companySettings, 
    updateCompanySettings, 
    perDiemRates, 
    updatePerDiemRates, 
    auditLogs, 
    resetToDemoData 
  } = useApp();

  const [settingsForm, setSettingsForm] = useState<CompanySettings>({ ...companySettings });
  const [ratesForm, setRatesForm] = useState<PerDiemRate[]>([...perDiemRates]);
  const [savedSettings, setSavedSettings] = useState(false);
  const [savedRates, setSavedRates] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...settingsForm };
    if (updated.currency === 'MRU') {
      updated.currencyAr = 'أوقية';
    } else if (updated.currency === 'EUR') {
      updated.currencyAr = 'يورو';
    } else if (updated.currency === 'USD') {
      updated.currencyAr = 'دولار';
    }
    updateCompanySettings(updated);
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const handleRateChange = (grade: string, field: 'dailyMealAllowance' | 'nightAccommodationAllowance', value: number) => {
    setRatesForm(prev => prev.map(rate => {
      if (rate.grade === grade) {
        return { ...rate, [field]: Number(value) || 0 };
      }
      return rate;
    }));
  };

  const handleSaveRates = () => {
    updatePerDiemRates(ratesForm);
    setSavedRates(true);
    setTimeout(() => setSavedRates(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900">{t('navSettings')}</h1>
            <p className="text-xs text-slate-500">Configuration de l'entreprise, barèmes kilométriques & audit</p>
          </div>
        </div>

        <button
          onClick={resetToDemoData}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto border border-slate-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser les données de démo</span>
        </button>
      </div>

      {/* Module 1: Company Profile Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-4 h-4 text-indigo-600" />
          <h2 className="font-extrabold text-sm text-slate-900">1. Identité de l'Entreprise & En-tête des Documents</h2>
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Raison Sociale (Français)</label>
              <input
                type="text"
                required
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الشركة (العربية)</label>
              <input
                type="text"
                value={settingsForm.nameAr || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, nameAr: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adresse Siège Social</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Contact RH</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registre de Commerce (RC)</label>
              <input
                type="text"
                value={settingsForm.rcNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, rcNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Identifiant Fiscal (IF / ICE)</label>
              <input
                type="text"
                value={settingsForm.taxNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, taxNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Devise officielle du système</label>
              <select
                value={settingsForm.currency}
                onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="MRU">MRU - الأوقية الموريتانية (Ouguiya Mauritanienne)</option>
                <option value="EUR">EUR (€) - Euro (Missions Internationales)</option>
                <option value="USD">USD ($) - Dollar US</option>
                <option value="XOF">XOF - Franc CFA</option>
                <option value="MAD">MAD - Dirham Marocain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Signataire Officiel / Directeur des RH</label>
            <input
              type="text"
              value={settingsForm.hrDirectorName}
              onChange={(e) => setSettingsForm({ ...settingsForm, hrDirectorName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl max-w-md"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {savedSettings ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSettings ? "Enregistré avec succès !" : "Sauvegarder les paramètres"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Module 2: Barèmes des Indemnités de Mission */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            <h2 className="font-extrabold text-sm text-slate-900">
              2. Barèmes Forfaitaires des Frais de Mission (Per Diem / الدرجات)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Montants appliqués au calcul automatique des décomptes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
              <tr>
                <th className="p-3 text-start">Grade / Catégorie du Personnel</th>
                <th className="p-3 text-start">Forfait Repas / Jour ({companySettings.currency})</th>
                <th className="p-3 text-start">Forfait Hébergement / Nuitée ({companySettings.currency})</th>
                <th className="p-3 text-end">Total Journalier ({companySettings.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ratesForm.map((rate) => (
                <tr key={rate.grade} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{rate.labelFr}</div>
                    <div className="text-[11px] text-slate-400 font-cairo">{rate.labelAr}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={rate.dailyMealAllowance}
                        onChange={(e) => handleRateChange(rate.grade, 'dailyMealAllowance', Number(e.target.value))}
                        className="w-28 p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                      />
                      <span className="text-slate-400 text-[11px]">{companySettings.currency}/j</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={rate.nightAccommodationAllowance}
                        onChange={(e) => handleRateChange(rate.grade, 'nightAccommodationAllowance', Number(e.target.value))}
                        className="w-28 p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                      />
                      <span className="text-slate-400 text-[11px]">{companySettings.currency}/nuit</span>
                    </div>
                  </td>
                  <td className="p-3 text-end font-extrabold text-indigo-700 text-sm">
                    {(Number(rate.dailyMealAllowance) + Number(rate.nightAccommodationAllowance))} {companySettings.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveRates}
            className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {savedRates ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedRates ? "Barèmes enregistrés !" : "Mettre à jour les barèmes"}</span>
          </button>
        </div>
      </div>

      {/* Module 3: System Audit & Activity Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h2 className="font-extrabold text-sm text-slate-900">3. Journal d'Audit & Historique des Opérations RH</h2>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-[11px]">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold uppercase">
                  {log.module}
                </span>
                <span className="text-slate-800 font-semibold">{log.details}</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                {log.performedBy} • {new Date(log.timestamp).toLocaleString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
