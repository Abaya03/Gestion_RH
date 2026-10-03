import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, LeaveType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { exportLeavesToExcel } from '../../utils/exportUtils';
import { 
  Calendar, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Users, 
  Clock, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface LeavesViewProps {
  onOpenNewLeave: () => void;
  onViewLeave: (id: string) => void;
  onPrintLeave: (leave: LeaveRequest) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  onOpenNewLeave,
  onViewLeave,
  onPrintLeave
}) => {
  const { 
    language, 
    t, 
    userRole, 
    currentEmployee, 
    employees, 
    leaveRequests 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredLeaves = leaveRequests.filter(leave => {
    const emp = employees.find(e => e.id === leave.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';
    const empNameAr = emp ? `${emp.firstNameAr} ${emp.lastNameAr}` : '';

    const matchSearch = 
      leave.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empNameAr.includes(searchTerm);

    const matchDept = selectedDept === 'ALL' || emp?.department === selectedDept;
    const matchType = selectedType === 'ALL' || leave.leaveType === selectedType;
    const matchStatus = selectedStatus === 'ALL' || leave.status === selectedStatus;

    return matchSearch && matchDept && matchType && matchStatus;
  });

  const handleExport = () => {
    exportLeavesToExcel(filteredLeaves, employees, language);
  };

  // Quick Calendar Generator (Current Month)
  const currentMonthDate = new Date();
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">{t('leaveTitle')}</h1>
              <p className="text-xs text-slate-500">{t('leaveSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'جدول الطلبات' : 'Tableau'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t('teamAbsenceCalendar')}</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('btnExportExcel')}</span>
          </button>

          <button
            onClick={onOpenNewLeave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newLeaveRequest')}</span>
          </button>
        </div>
      </div>

      {/* User Solde Card for Employee role */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider block">
              {t('leaveBalance')} • {currentEmployee.firstName} {currentEmployee.lastName}
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">
              {currentEmployee.remainingLeaveDays} <span className="text-sm font-normal text-slate-300">jours ouvrables disponibles</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div>
              <span className="text-slate-400 block">{t('totalAllowance')}</span>
              <span className="font-bold text-sm text-white">{currentEmployee.totalLeaveDays} j</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-slate-400 block">{t('takenDays')}</span>
              <span className="font-bold text-sm text-white">{currentEmployee.usedLeaveDays} j</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-slate-400 block">{t('remainingDays')}</span>
              <span className="font-bold text-sm text-emerald-300">{currentEmployee.remainingLeaveDays} j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">{t('filterDepartment')} ({t('filterAll')})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Tous les types de congés</option>
              <option value="conge_paye">{t('type_conge_paye')}</option>
              <option value="maladie">{t('type_maladie')}</option>
              <option value="maternite_paternite">{t('type_maternite_paternite')}</option>
              <option value="evenement_familial">{t('type_evenement_familial')}</option>
              <option value="sans_solde">{t('type_sans_solde')}</option>
              <option value="recuperation">{t('type_recuperation')}</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">{t('filterStatus')} ({t('filterAll')})</option>
              <option value="pending_manager">{t('status_pending_manager')}</option>
              <option value="approved_manager">{t('status_approved_manager')}</option>
              <option value="validated_hr">{t('status_validated_hr')}</option>
              <option value="rejected">{t('status_rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW: Table vs Calendar */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 text-start">{t('leaveNumber')}</th>
                  <th className="p-3.5 text-start">{t('beneficiary')}</th>
                  <th className="p-3.5 text-start">{t('leaveType')}</th>
                  <th className="p-3.5 text-start">{t('leaveStartDate')} & {t('leaveEndDate')}</th>
                  <th className="p-3.5 text-start">{t('duration')}</th>
                  <th className="p-3.5 text-start">{t('reason')}</th>
                  <th className="p-3.5 text-start">{t('filterStatus')}</th>
                  <th className="p-3.5 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      {t('tableEmpty')}
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const emp = employees.find(e => e.id === leave.employeeId);
                    const empName = language === 'ar' && emp?.firstNameAr
                      ? `${emp.firstNameAr} ${emp.lastNameAr}`
                      : `${emp?.firstName} ${emp?.lastName}`;

                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {leave.requestNumber}
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{empName}</div>
                          <div className="text-[11px] text-slate-400">{emp?.department}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-800">
                          {t(`type_${leave.leaveType}` as any)}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{leave.startDate}</div>
                          <div className="text-[11px] text-slate-400">au {leave.endDate}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {leave.totalDays} {t('leaveDaysCount')}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs truncate text-slate-600">
                          {leave.reason}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <StatusBadge status={leave.status} size="sm" />
                        </td>

                        <td className="p-3.5 text-end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewLeave(leave.id)}
                              title={t('btnViewDetails')}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPrintLeave(leave)}
                              title={t('btnPrint')}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>{t('showingRecords', { count: filteredLeaves.length })}</span>
            <span className="text-[11px] text-slate-400">
              Décompte en jours ouvrés conformément au Code du Travail
            </span>
          </div>
        </div>
      ) : (
        /* Team Calendar View */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Planning d'équipe & Absences prévisionnelles</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Mois en cours ({daysInMonth} jours)
            </span>
          </div>

          {/* Department Breakdown of Absences */}
          <div className="space-y-4">
            {departments.map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept);
              return (
                <div key={dept} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {dept}
                    </span>
                    <span className="text-xs text-slate-400">{deptEmployees.length} collaborateurs</span>
                  </div>

                  <div className="space-y-2">
                    {deptEmployees.map(emp => {
                      const empLeaves = leaveRequests.filter(l => l.employeeId === emp.id && (l.status === 'validated_hr' || l.status === 'approved_manager'));
                      return (
                        <div key={emp.id} className="p-2.5 bg-slate-50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"}
                              alt={emp.firstName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</span>
                              <span className="text-[11px] text-slate-500 block">{emp.position}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {empLeaves.length === 0 ? (
                              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                Présent au poste
                              </span>
                            ) : (
                              empLeaves.map(l => (
                                <span
                                  key={l.id}
                                  onClick={() => onViewLeave(l.id)}
                                  className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold border border-amber-200 cursor-pointer hover:bg-amber-200"
                                >
                                  {t(`type_${l.leaveType}` as any)} : {l.startDate} → {l.endDate} ({l.totalDays}j)
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
