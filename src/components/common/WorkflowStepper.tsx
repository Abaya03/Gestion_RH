import React from 'react';
import { useApp } from '../../context/AppContext';
import { MissionStatus, ExpenseClaimStatus, LeaveStatus } from '../../types';
import { Check, Clock, X, User, UserCheck, ShieldCheck } from 'lucide-react';

interface WorkflowStepperProps {
  status: MissionStatus | ExpenseClaimStatus | LeaveStatus;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  hrValidatedBy?: string;
  hrValidatedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  requesterName?: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  status,
  managerApprovedBy,
  managerApprovedAt,
  hrValidatedBy,
  hrValidatedAt,
  rejectionReason,
  createdAt,
  requesterName
}) => {
  const { language, t } = useApp();

  const isRejected = status === 'rejected';

  // Step 1: Requester (always done once created)
  // Step 2: Manager N+1
  const isStep2Done = status === 'approved_manager' || status === 'validated_hr' || status === 'paid';
  const isStep2Active = status === 'pending_manager' || status === 'submitted';

  // Step 3: HR validation
  const isStep3Done = status === 'validated_hr' || status === 'paid';
  const isStep3Active = status === 'approved_manager';

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {t('approvalWorkflow')}
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

        {/* STEP 1: Demandeur */}
        <div className="relative z-10 flex items-center md:flex-col md:items-center gap-3 md:gap-1 text-start md:text-center w-full md:w-1/3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 justify-start md:justify-center">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {t('workflowStep1')}
            </div>
            <div className="text-xs text-slate-500">
              {requesterName && <span className="font-medium text-slate-700">{requesterName}</span>}
              {createdAt && <span className="block text-[11px] text-slate-400">{formatDate(createdAt)}</span>}
            </div>
          </div>
        </div>

        {/* STEP 2: Manager N+1 */}
        <div className="relative z-10 flex items-center md:flex-col md:items-center gap-3 md:gap-1 text-start md:text-center w-full md:w-1/3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
              isStep2Done
                ? 'bg-emerald-500 text-white'
                : isRejected && !isStep2Done
                ? 'bg-rose-500 text-white'
                : isStep2Active
                ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-100'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isStep2Done ? (
              <Check className="w-5 h-5" />
            ) : isRejected && !isStep2Done ? (
              <X className="w-5 h-5" />
            ) : isStep2Active ? (
              <Clock className="w-5 h-5" />
            ) : (
              <span className="text-xs font-bold">2</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 justify-start md:justify-center">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              {t('workflowStep2')}
            </div>
            <div className="text-xs text-slate-500">
              {managerApprovedBy ? (
                <>
                  <span className="font-medium text-emerald-700">{managerApprovedBy}</span>
                  {managerApprovedAt && <span className="block text-[11px] text-slate-400">{formatDate(managerApprovedAt)}</span>}
                </>
              ) : isStep2Active ? (
                <span className="text-amber-600 font-medium">{t('status_pending_manager')}</span>
              ) : isRejected ? (
                <span className="text-rose-600 font-medium">{t('status_rejected')}</span>
              ) : (
                <span className="text-slate-400">En attente</span>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3: Direction RH */}
        <div className="relative z-10 flex items-center md:flex-col md:items-center gap-3 md:gap-1 text-start md:text-center w-full md:w-1/3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
              isStep3Done
                ? 'bg-emerald-600 text-white'
                : isRejected && isStep2Done
                ? 'bg-rose-500 text-white'
                : isStep3Active
                ? 'bg-blue-500 text-white animate-pulse ring-4 ring-blue-100'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isStep3Done ? (
              <Check className="w-5 h-5" />
            ) : isRejected && isStep2Done ? (
              <X className="w-5 h-5" />
            ) : isStep3Active ? (
              <Clock className="w-5 h-5" />
            ) : (
              <span className="text-xs font-bold">3</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 justify-start md:justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              {t('workflowStep3')}
            </div>
            <div className="text-xs text-slate-500">
              {hrValidatedBy ? (
                <>
                  <span className="font-medium text-emerald-700">{hrValidatedBy}</span>
                  {hrValidatedAt && <span className="block text-[11px] text-slate-400">{formatDate(hrValidatedAt)}</span>}
                </>
              ) : isStep3Active ? (
                <span className="text-blue-600 font-medium">Prêt pour visa RH</span>
              ) : (
                <span className="text-slate-400">En attente</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {rejectionReason && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
          <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{t('reason')}:</span> {rejectionReason}
          </div>
        </div>
      )}
    </div>
  );
};
