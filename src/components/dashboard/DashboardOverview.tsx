import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Compass, 
  Receipt, 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Eye,
  Check,
  Scale,
  Calculator,
  Award
} from 'lucide-react';

interface DashboardOverviewProps {
  onOpenNewMission: () => void;
  onOpenNewExpense: () => void;
  onOpenNewMemo: () => void;
  onOpenNewLeave: () => void;
  onViewMission: (id: string) => void;
  onViewExpense: (id: string) => void;
  onViewMemo: (id: string) => void;
  onViewLeave: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenNewMission,
  onOpenNewExpense,
  onOpenNewMemo,
  onOpenNewLeave,
  onViewMission,
  onViewExpense,
  onViewMemo,
  onViewLeave
}) => {
  const { 
    language, 
    t, 
    userRole, 
    currentEmployee, 
    employees, 
    missionOrders, 
    expenseClaims, 
    internalMemos, 
    leaveRequests, 
    companySettings,
    approveMissionByManager,
    validateMissionByHR,
    rejectMission,
    approveExpenseByManager,
    validateExpenseByHR,
    rejectExpense,
    approveLeaveByManager,
    validateLeaveByHR,
    rejectLeave,
    acknowledgeMemo,
    setActiveTab
  } = useApp();

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Rejection modal prompt
  const [rejectingItem, setRejectingItem] = useState<{ type: 'mission' | 'expense' | 'leave'; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Compute KPIs
  const activeMissions = missionOrders.filter(m => m.status === 'validated_hr' || m.status === 'approved_manager');
  const pendingMissions = missionOrders.filter(m => m.status === 'pending_manager' || m.status === 'approved_manager');
  const pendingExpenses = expenseClaims.filter(e => e.status === 'submitted' || e.status === 'approved_manager');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending_manager' || l.status === 'approved_manager');
  const totalPending = pendingMissions.length + pendingExpenses.length + pendingLeaves.length;

  const totalExpenseAmount = expenseClaims.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);

  // Pending items requiring action by current user
  const actionableMissions = missionOrders.filter(m => {
    if (userRole === 'manager') return m.status === 'pending_manager';
    if (userRole === 'hr_admin') return m.status === 'approved_manager' || m.status === 'pending_manager';
    return false;
  });

  const actionableExpenses = expenseClaims.filter(e => {
    if (userRole === 'manager') return e.status === 'submitted';
    if (userRole === 'hr_admin') return e.status === 'approved_manager' || e.status === 'submitted';
    return false;
  });

  const actionableLeaves = leaveRequests.filter(l => {
    if (userRole === 'manager') return l.status === 'pending_manager';
    if (userRole === 'hr_admin') return l.status === 'approved_manager' || l.status === 'pending_manager';
    return false;
  });

  const hasUrgentActions = actionableMissions.length > 0 || actionableExpenses.length > 0 || actionableLeaves.length > 0;

  const handleConfirmReject = () => {
    if (!rejectingItem || !rejectReason.trim()) return;
    if (rejectingItem.type === 'mission') rejectMission(rejectingItem.id, rejectReason);
    if (rejectingItem.type === 'expense') rejectExpense(rejectingItem.id, rejectReason);
    if (rejectingItem.type === 'leave') rejectLeave(rejectingItem.id, rejectReason);
    setRejectingItem(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-500/30">
                {t(`role_${userRole}`)}
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {language === 'ar'
                ? `مرحباً بك، ${currentEmployee.firstNameAr || currentEmployee.firstName}`
                : `Bonjour, ${currentEmployee.firstName} ${currentEmployee.lastName}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {userRole === 'hr_admin'
                ? (language === 'ar' ? "لوحة القيادة الموحدة لمتابعة التنقلات، المصاريف، المذكرات، والإجازات." : "Supervision globale des ordres de mission, notes de service, congés et décomptes comptables.")
                : userRole === 'manager'
                ? (language === 'ar' ? "متابعة وتأكيد طلبات فريق العمل وجدول الغيابات." : "Gestion et validation des requêtes de vos collaborateurs et suivi du calendrier d'équipe.")
                : (language === 'ar' ? `رصيدك الحالي للإجازات: ${currentEmployee.remainingLeaveDays} يوم متبقٍ.` : `Votre solde de congés disponible est de ${currentEmployee.remainingLeaveDays} jours.`)}
            </p>
          </div>

          {/* Quick 3-Clicks Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>{t('newMissionQuick')}</span>
            </button>
            <button
              onClick={onOpenNewLeave}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('newLeaveQuick')}</span>
            </button>
            <button
              onClick={onOpenNewExpense}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('newExpenseQuick')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Missions */}
        <div 
          onClick={() => setActiveTab('missions')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t('kpiActiveMissions')}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeMissions.length}</div>
          <div className="text-[11px] text-indigo-600 flex items-center gap-1 mt-1 font-medium">
            <span>{missionOrders.length} {t('missionTitle')}</span>
            <ArrowIcon className="w-3 h-3" />
          </div>
        </div>

        {/* KPI 2: Pending Approvals */}
        <div 
          onClick={() => setActiveTab('missions')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t('kpiPendingApprovals')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{totalPending}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingMissions.length} OM • {pendingExpenses.length} Frais • {pendingLeaves.length} Congés
          </div>
        </div>

        {/* KPI 3: Leaves & Absences */}
        <div 
          onClick={() => setActiveTab('leaves')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t('kpiUpcomingLeaves')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {userRole === 'employee' ? `${currentEmployee.remainingLeaveDays} j` : `${leaveRequests.filter(l => l.status === 'validated_hr').length}`}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>{userRole === 'employee' ? t('leaveBalance') : t('teamAbsenceCalendar')}</span>
            <ArrowIcon className="w-3 h-3" />
          </div>
        </div>

        {/* KPI 4: Recent Memos */}
        <div 
          onClick={() => setActiveTab('memos')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t('kpiRecentMemos')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{internalMemos.length}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
            <span>{internalMemos.filter(m => m.isUrgent).length} {t('urgentMemo')}</span>
            <ArrowIcon className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Mauritanian HR Expertise Quick Access Banner */}
      <div 
        onClick={() => setActiveTab('mauritania_hr')}
        className="bg-linear-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-all cursor-pointer border border-sky-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-xs shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {language === 'ar' ? 'النظام الموريتاني' : 'Réglementation RIM'}
              </span>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'ar' ? 'مركز خبير الرواتب والوثائق الإدارية الرسمية' : 'Centre d\'Expertise RH & Paie Mauritanienne'}
              </h3>
            </div>
            <p className="text-xs text-sky-200/80 mt-0.5">
              {language === 'ar'
                ? 'حساب الرواتب، الاقتطاعات الاجتماعية CNSS و CNAM، ضريبة الأجور ITS، وتوليد شهادات العمل والراتب.'
                : 'Simulateur officiel de paie, cotisations CNSS & CNAM, barème ITS, attestations de travail et de salaire.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 flex items-center gap-1.5">
            <span>{language === 'ar' ? 'فتح المنظومة' : 'Accéder à l\'Espace'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Actionable Urgent Approvals Box (for Managers & HR Admin) */}
      {(userRole === 'manager' || userRole === 'hr_admin') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="font-bold text-sm text-slate-900">{t('sectionUrgentActions')}</h2>
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
                {actionableMissions.length + actionableExpenses.length + actionableLeaves.length}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {userRole === 'manager' ? "Visa hiérarchique N+1" : "Validation finale & Bon à payer RH"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {!hasUrgentActions ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-medium text-slate-600">{t('noPendingActions')}</p>
              </div>
            ) : (
              <>
                {/* Pending Missions */}
                {actionableMissions.map((mission) => {
                  const emp = employees.find(e => e.id === mission.employeeId);
                  const empName = language === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
                  return (
                    <div key={mission.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{mission.orderNumber}</span>
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {empName}
                            </span>
                            <StatusBadge status={mission.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-medium">{t('destination')}:</span> {mission.destination} • {mission.departureDate} au {mission.returnDate}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                            {mission.purpose}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onViewMission(mission.id)}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('btnViewDetails')}</span>
                        </button>
                        {userRole === 'manager' && mission.status === 'pending_manager' && (
                          <button
                            onClick={() => approveMissionByManager(mission.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnApprove')}</span>
                          </button>
                        )}
                        {userRole === 'hr_admin' && (
                          <button
                            onClick={() => validateMissionByHR(mission.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnValidate')}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setRejectingItem({ type: 'mission', id: mission.id })}
                          className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('btnReject')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pending Expenses */}
                {actionableExpenses.map((claim) => {
                  const emp = employees.find(e => e.id === claim.employeeId);
                  const empName = language === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
                  return (
                    <div key={claim.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{claim.claimNumber}</span>
                            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                              {empName}
                            </span>
                            <StatusBadge status={claim.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            {t('totalExpenses')}: {claim.totalExpenses} {companySettings.currency} • <span className="text-emerald-700">{t('netPayable')}: {claim.netPayable} {companySettings.currency}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onViewExpense(claim.id)}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('btnViewDetails')}</span>
                        </button>
                        {userRole === 'manager' && claim.status === 'submitted' && (
                          <button
                            onClick={() => approveExpenseByManager(claim.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnApprove')}</span>
                          </button>
                        )}
                        {userRole === 'hr_admin' && (
                          <button
                            onClick={() => validateExpenseByHR(claim.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnValidate')}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setRejectingItem({ type: 'expense', id: claim.id })}
                          className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('btnReject')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pending Leaves */}
                {actionableLeaves.map((leave) => {
                  const emp = employees.find(e => e.id === leave.employeeId);
                  const empName = language === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
                  return (
                    <div key={leave.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{leave.requestNumber}</span>
                            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {empName}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">({t(`type_${leave.leaveType}` as any)})</span>
                            <StatusBadge status={leave.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {leave.startDate} au {leave.endDate} • <span className="font-bold text-indigo-700">{leave.totalDays} {t('leaveDaysCount')}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t('reason')}: {leave.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onViewLeave(leave.id)}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('btnViewDetails')}</span>
                        </button>
                        {userRole === 'manager' && leave.status === 'pending_manager' && (
                          <button
                            onClick={() => approveLeaveByManager(leave.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnApprove')}</span>
                          </button>
                        )}
                        {userRole === 'hr_admin' && (
                          <button
                            onClick={() => validateLeaveByHR(leave.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnValidate')}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setRejectingItem({ type: 'leave', id: leave.id })}
                          className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('btnReject')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Two Columns: Recent Internal Memos & Team Calendar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 3: Latest Internal Memos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">{t('sectionRecentMemos')}</h3>
              </div>
              <button
                onClick={() => setActiveTab('memos')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewAll')}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {internalMemos.slice(0, 3).map((memo) => {
                const isRead = memo.readReceipts.some(r => r.employeeId === currentEmployee.id);
                return (
                  <div
                    key={memo.id}
                    className={`p-3 rounded-xl border transition-all ${
                      memo.isUrgent
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                            {memo.memoNumber}
                          </span>
                          {memo.isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              {t('urgentMemo')}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">{memo.publishedDate}</span>
                        </div>
                        <h4 
                          onClick={() => onViewMemo(memo.id)}
                          className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {language === 'ar' && memo.titleAr ? memo.titleAr : memo.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {language === 'ar' && memo.contentAr ? memo.contentAr : memo.content}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        {memo.readReceipts.length} {t('readReceiptsCount')}
                      </span>

                      {!isRead ? (
                        <button
                          onClick={() => acknowledgeMemo(memo.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t('btnAcknowledgeMemo')}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('statusRead')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Absences & Calendar Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">{t('sectionTeamCalendar')}</h3>
              </div>
              <button
                onClick={() => setActiveTab('leaves')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewAll')}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of active & upcoming approved leaves */}
            <div className="space-y-3">
              {leaveRequests.filter(l => l.status === 'validated_hr').slice(0, 4).map((leave) => {
                const emp = employees.find(e => e.id === leave.employeeId);
                const empName = language === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
                return (
                  <div key={leave.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"}
                        alt={emp?.firstName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-500">
                          {emp?.department} • {t(`type_${leave.leaveType}` as any)}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        {leave.startDate} → {leave.endDate}
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {leave.totalDays} {t('leaveDaysCount')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{employees.length} {t('kpiTotalEmployees')}</span>
            <button
              onClick={onOpenNewLeave}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newLeaveQuick')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">{t('btnReject')}</h3>
            </div>
            <p className="text-xs text-slate-600">
              {t('rejectionReasonPrompt')}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Période non compatible avec les impératifs du service..."
              rows={3}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('btnReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
