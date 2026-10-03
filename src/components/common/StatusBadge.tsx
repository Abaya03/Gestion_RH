import React from 'react';
import { useApp } from '../../context/AppContext';
import { MissionStatus, ExpenseClaimStatus, LeaveStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, FileText, AlertCircle, CheckCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: MissionStatus | ExpenseClaimStatus | LeaveStatus | 'published' | 'draft';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const { t } = useApp();

  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: t('status_draft'),
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <FileText className="w-3.5 h-3.5" />
        };
      case 'pending_manager':
      case 'submitted':
        return {
          label: t('status_pending_manager'),
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        };
      case 'approved_manager':
        return {
          label: t('status_approved_manager'),
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        };
      case 'validated_hr':
        return {
          label: t('status_validated_hr'),
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'paid':
        return {
          label: t('status_paid'),
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
        };
      case 'published':
        return {
          label: t('status_published'),
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'rejected':
      case 'cancelled':
        return {
          label: t('status_rejected'),
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />
        };
      case 'completed':
        return {
          label: t('status_completed'),
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
    }
  };

  const config = getStatusConfig();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${padding} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
