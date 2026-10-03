import React, { useState, useEffect } from 'react';
import { Department, Employee, OrgUnitType } from '../../types';
import { 
  Building, 
  X, 
  Check, 
  Shield, 
  MapPin, 
  Briefcase, 
  Layers, 
  UserCheck, 
  Hash, 
  AlignLeft,
  Sparkles
} from 'lucide-react';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
  onSave: (data: Omit<Department, 'id'> & { id?: string }) => void;
  employees: Employee[];
}

const ORG_UNIT_TYPES: { value: OrgUnitType; labelFr: string; labelAr: string }[] = [
  { value: 'direction', labelFr: 'Direction Générale / Centrale', labelAr: 'إدارة عامة / مركزية' },
  { value: 'service', labelFr: 'Service Administratif / Logistique / RH', labelAr: 'مصلحة إدارية / لوجستية / موارد بشرية' },
  { value: 'laboratoire', labelFr: 'Laboratoire de Recherche Scientifique', labelAr: 'مختبر بحوث علمية' },
  { value: 'centre', labelFr: 'Centre Régional', labelAr: 'مركز جهوي' },
  { value: 'station', labelFr: 'Station Côtière / Continentale', labelAr: 'محطة ساحلية / قارية' },
  { value: 'cellule', labelFr: 'Cellule / Unité Spécifique', labelAr: 'خلية / وحدة خاصة' },
  { value: 'autre', labelFr: 'Autre Structure Organique', labelAr: 'هيكل تنظيمي آخر' },
];

const BAP_OPTIONS = [
  { value: 'SCIEN', labelFr: 'Recherche Océanographique & Halieutique (SCIEN)', labelAr: 'البحوث وعلوم المحيطات' },
  { value: 'ADMIN', labelFr: 'Direction Générale, Administration & Finances (ADMIN)', labelAr: 'الإدارة العامة والمالية' },
  { value: 'NAVAL', labelFr: 'Flotte Océanographique & Moyens Maritimes (NAVAL)', labelAr: 'الأسطول والوسائل البحرية' },
  { value: 'TECH', labelFr: 'Maintenance, Logistique & Support Technique (TECH)', labelAr: 'الدعم الفني والصيانة' },
];

const SITE_OPTIONS = [
  { value: 'Nouadhibou', label: 'Nouadhibou (Siège Cansado / Port)' },
  { value: 'Nouakchott', label: 'Nouakchott (Centre de Nouakchott)' },
  { value: "Banc d'Arguin", label: "Banc d'Arguin (Station Iwik / PNBA)" },
  { value: 'Boghé', label: 'Boghé / Kaédi (Station Continentale)' },
  { value: 'En mer (N/R Al Awam)', label: 'En mer (N/R Al Awam / N/R Amrig)' },
];

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
  onSave,
  employees
}) => {
  const isEditing = Boolean(department);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [type, setType] = useState<OrgUnitType>('service');
  const [site, setSite] = useState('Nouadhibou');
  const [bap, setBap] = useState('ADMIN');
  const [headEmployeeId, setHeadEmployeeId] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [headSearch, setHeadSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setCode(department.code || '');
      setName(department.name || '');
      setNameAr(department.nameAr || '');
      setType(department.type || 'service');
      setSite(department.site || 'Nouadhibou');
      setBap(department.bap || 'ADMIN');
      setHeadEmployeeId(department.headEmployeeId || '');
      setDescription(department.description || '');
      setDescriptionAr(department.descriptionAr || '');
    } else {
      setCode('');
      setName('');
      setNameAr('');
      setType('service');
      setSite('Nouadhibou');
      setBap('ADMIN');
      setHeadEmployeeId('');
      setDescription('');
      setDescriptionAr('');
    }
    setHeadSearch('');
    setErrorMsg(null);
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Le nom officiel en français est requis.');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Le code / sigle de la structure est requis.');
      return;
    }

    onSave({
      id: department?.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      type,
      site,
      bap,
      headEmployeeId: headEmployeeId || undefined,
      description: description.trim(),
      descriptionAr: descriptionAr.trim(),
      positions: department?.positions || []
    });

    onClose();
  };

  const filteredEmployeesForHead = employees.filter(emp => {
    if (!headSearch.trim()) return true;
    const term = headSearch.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matricule = emp.matricule.toLowerCase();
    const pos = (emp.position || '').toLowerCase();
    return fullName.includes(term) || matricule.includes(term) || pos.includes(term);
  });

  const selectedHead = employees.find(e => e.id === headEmployeeId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Building className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {isEditing 
                  ? `Modifier la Structure : ${department?.code || department?.name}` 
                  : 'Créer une Direction ou un Service'}
              </h2>
              <p className="text-xs text-indigo-200">
                {isEditing ? 'تعديل بيانات الإدارة / المصلحة' : 'إضافة هيكل إداري / مصلحة جديدة في الهيكل التنظيمي'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Type de Structure / نوع الهيكل *</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OrgUnitType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {ORG_UNIT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.labelFr} ({t.labelAr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sigle / Code (Acronyme) *</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Ex: DSR, SRH, CN..."
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-indigo-900 tracking-wider uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Name FR & Name AR */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Nom Officiel (Français) *</span>
                <span className="text-[10px] text-slate-400 font-normal">Ex: Direction Scientifique et de la Recherche (DSR)</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Direction des Systèmes d'Information (DSI)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between" dir="rtl">
                <span>التسمية الرسمية (بالعربية)</span>
                <span className="text-[10px] text-slate-400 font-normal">مثال: الإدارة العلمية والبحوث</span>
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: مصلحة المصادر البشرية"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Site & BAP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Site d'affectation principal *</span>
              </label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {SITE_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Branche d'Activité (BAP) *</span>
              </label>
              <select
                value={bap}
                onChange={(e) => setBap(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {BAP_OPTIONS.map(b => (
                  <option key={b.value} value={b.value}>{b.labelFr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Head / Responsable */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Responsable / Chef désigné (Directeur / Chef de Service)</span>
              </label>
              {selectedHead && (
                <button
                  type="button"
                  onClick={() => setHeadEmployeeId('')}
                  className="text-[11px] text-rose-600 hover:underline font-bold"
                >
                  Désassigner
                </button>
              )}
            </div>

            {selectedHead ? (
              <div className="flex items-center justify-between p-2.5 bg-white border border-indigo-200 rounded-xl shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                    {selectedHead.firstName.charAt(0)}{selectedHead.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {selectedHead.firstName} {selectedHead.lastName} ({selectedHead.matricule})
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {selectedHead.position} • {selectedHead.department}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  Responsable Actuel
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Rechercher un agent par nom ou matricule..."
                  value={headSearch}
                  onChange={(e) => setHeadSearch(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <select
                  value={headEmployeeId}
                  onChange={(e) => setHeadEmployeeId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="">-- Aucun responsable désigné (ou choisir dans la liste) --</option>
                  {filteredEmployeesForHead.slice(0, 100).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.matricule}) - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description / Missions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Missions & Attributions principales (optionnel)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Description des missions, attributions et activités clés de cette direction ou de ce service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Cascading Notice for Edit */}
          {isEditing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Mise à jour en cascade :</strong> Si vous modifiez le nom ou le site de cette structure, l'ensemble des fiches des collaborateurs actuellement rattachés sera automatiquement mis à jour.
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les Modifications' : 'Créer la Structure'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
