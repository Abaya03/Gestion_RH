import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { WorkflowStepper } from '../common/WorkflowStepper';
import { 
  Calendar, 
  X, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  Paperclip,
  FileText
} from 'lucide-react';

interface LeaveDetailsModalProps {
  leave: LeaveRequest;
  onClose: () => void;
  onOpenPrint: () => void;
}

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ leave, onClose, onOpenPrint }) => {
  const { 
    language, 
    t, 
    userRole, 
    getEmployeeById, 
    approveLeaveByManager, 
    validateLeaveByHR, 
    rejectLeave 
  } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const employee = getEmployeeById(leave.employeeId);
  const employeeName = language === 'ar' && employee?.firstNameAr
    ? `${employee.firstNameAr} ${employee.lastNameAr}`
    : `${employee?.firstName} ${employee?.lastName}`;

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    rejectLeave(leave.id, rejectReason);
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base text-slate-900">{leave.requestNumber}</h2>
                <StatusBadge status={leave.status} />
              </div>
              <p className="text-xs text-slate-500">{t('leaveTitle')}</p>
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
          status={leave.status}
          requesterName={employeeName}
          createdAt={leave.createdAt}
          managerApprovedBy={leave.managerApprovedBy}
          managerApprovedAt={leave.managerApprovedAt}
          hrValidatedBy={leave.hrValidatedBy}
          hrValidatedAt={leave.hrValidatedAt}
          rejectionReason={leave.rejectionReason}
        />

        {/* Beneficiary & Leave Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('beneficiary')}
            </span>
            <div className="font-bold text-slate-900 text-sm">{employeeName}</div>
            <div className="text-slate-600">{employee?.department} • {employee?.position}</div>
            <div className="text-[11px] text-slate-500">Matricule: {employee?.matricule}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('leaveType')}
            </span>
            <div className="font-extrabold text-emerald-800 text-sm">
              {t(`type_${leave.leaveType}` as any)}
            </div>
            <div className="text-slate-700 font-medium">
              Du {leave.startDate} au {leave.endDate}
            </div>
            <div className="text-[11px] font-bold text-indigo-700">
              Durée: {leave.totalDays} jour(s) ouvrable(s)
            </div>
          </div>

          {/* Solde situation */}
          <div className="col-span-1 sm:col-span-2 p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block mb-1">
              Impact sur le solde de congés
            </span>
            <div className="grid grid-cols-3 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] block">Droit annuel</span>
                <span className="font-bold">{employee?.totalLeaveDays} j</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Jours consommés</span>
                <span className="font-bold">{employee?.usedLeaveDays} j</span>
              </div>
              <div>
                <span className="text-emerald-700 text-[10px] block font-bold">Solde restant</span>
                <span className="font-extrabold text-emerald-600 text-sm">{employee?.remainingLeaveDays} jours</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('reason')}
            </span>
            <p className="text-slate-800">{leave.reason}</p>

            {leave.attachmentName && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">{leave.attachmentName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reject input */}
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
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{t('btnPrint')} Titre de Congé</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Manager approval button */}
            {userRole === 'manager' && leave.status === 'pending_manager' && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => {
                    approveLeaveByManager(leave.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('btnApprove')}</span>
                </button>
              </>
            )}

            {/* HR Final validation button */}
            {userRole === 'hr_admin' && (leave.status === 'approved_manager' || leave.status === 'pending_manager') && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={() => {
                    validateLeaveByHR(leave.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('btnValidate')}</span>
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
