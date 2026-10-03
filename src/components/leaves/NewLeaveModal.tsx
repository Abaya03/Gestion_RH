import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType } from '../../types';
import { Calendar, X, AlertCircle, Check, AlertTriangle, Paperclip } from 'lucide-react';

interface NewLeaveModalProps {
  onClose: () => void;
}

export const NewLeaveModal: React.FC<NewLeaveModalProps> = ({ onClose }) => {
  const { language, t, employees, currentEmployeeId, createLeaveRequest, getEmployeeById } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [employeeId, setEmployeeId] = useState<string>(currentEmployeeId || employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('conge_paye');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  const selectedEmployee = getEmployeeById(employeeId);

  // Auto calculate duration in days
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 1;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculatedDays = calculateDays(startDate, endDate);
  const exceedsBalance = leaveType === 'conge_paye' && selectedEmployee && calculatedDays > selectedEmployee.remainingLeaveDays;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد سبب طلب الإجازة' : 'Veuillez préciser le motif de la demande.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(language === 'ar' ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'La date de fin doit être postérieure à la date de début.');
      return;
    }

    createLeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays: calculatedDays,
      reason,
      attachmentName: attachmentName || undefined
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default relative my-auto"
      >
        {/* Header */}
        <div className="sticky -top-6 -mt-6 pt-6 -mx-6 px-6 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">{t('newLeaveRequest')}</h2>
              <p className="text-xs text-slate-500">{t('leaveSubtitle')}</p>
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
          {/* Employee selection & Live Leave Balance */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('beneficiary')} *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.department})
                </option>
              ))}
            </select>

            {/* Live Balance Card */}
            {selectedEmployee && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('totalAllowance')}</span>
                    <span className="font-bold text-slate-800">{selectedEmployee.totalLeaveDays} j</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('takenDays')}</span>
                    <span className="font-bold text-slate-800">{selectedEmployee.usedLeaveDays} j</span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">{t('remainingDays')}</span>
                  <span className="font-extrabold text-base text-emerald-600">{selectedEmployee.remainingLeaveDays} jours</span>
                </div>
              </div>
            )}
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('leaveType')} *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="conge_paye">{t('type_conge_paye')}</option>
              <option value="maladie">{t('type_maladie')}</option>
              <option value="maternite_paternite">{t('type_maternite_paternite')}</option>
              <option value="evenement_familial">{t('type_evenement_familial')}</option>
              <option value="sans_solde">{t('type_sans_solde')}</option>
              <option value="recuperation">{t('type_recuperation')}</option>
            </select>
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t('leaveStartDate')} *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {t('leaveEndDate')} *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="text-center p-2 bg-white rounded-lg border border-emerald-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('duration')}</span>
              <span className="font-extrabold text-sm text-emerald-700">{calculatedDays} {t('leaveDaysCount')}</span>
            </div>
          </div>

          {exceedsBalance && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Attention : La durée demandée ({calculatedDays} j) est supérieure au solde restant ({selectedEmployee?.remainingLeaveDays} j).
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('reason')} *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Précisez la raison ou les détails de l'absence..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificatif / Certificat médical (optionnel)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Ex: Certificat_Medical_Dr_Mansouri.pdf"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('btnSubmit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
