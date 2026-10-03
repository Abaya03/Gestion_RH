import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MissionOrder, MissionStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { exportMissionsToExcel } from '../../utils/exportUtils';
import { 
  Compass, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Receipt, 
  Calendar,
  Building,
  User,
  ArrowUpDown
} from 'lucide-react';

interface MissionOrdersViewProps {
  onOpenNewMission: () => void;
  onViewMission: (id: string) => void;
  onPrintMission: (mission: MissionOrder) => void;
  onNavigateToExpense?: (expenseId: string) => void;
}

export const MissionOrdersView: React.FC<MissionOrdersViewProps> = ({
  onOpenNewMission,
  onViewMission,
  onPrintMission,
  onNavigateToExpense
}) => {
  const { 
    language, 
    t, 
    userRole, 
    currentEmployee, 
    employees, 
    missionOrders, 
    companySettings,
    generateExpenseClaimFromMission,
    expenseClaims,
    setActiveTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const departments = Array.from(new Set(employees.map(e => e.department)));

  // Filter missions
  const filteredMissions = missionOrders.filter(mission => {
    const emp = employees.find(e => e.id === mission.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';
    const empNameAr = emp ? `${emp.firstNameAr} ${emp.lastNameAr}` : '';

    const matchSearch = 
      mission.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empNameAr.includes(searchTerm);

    const matchDept = selectedDept === 'ALL' || emp?.department === selectedDept;
    const matchStatus = selectedStatus === 'ALL' || mission.status === selectedStatus;

    return matchSearch && matchDept && matchStatus;
  });

  const handleExport = () => {
    exportMissionsToExcel(filteredMissions, employees, companySettings.currency, language);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">{t('missionTitle')}</h1>
              <p className="text-xs text-slate-500">{t('missionSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('btnExportExcel')}</span>
          </button>

          <button
            onClick={onOpenNewMission}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newMissionOrder')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">{t('filterDepartment')} ({t('filterAll')})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

      {/* Missions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 text-start">{t('omNumber')}</th>
                <th className="p-3.5 text-start">{t('beneficiary')}</th>
                <th className="p-3.5 text-start">{t('destination')}</th>
                <th className="p-3.5 text-start">{t('departure')} & {t('returnDate')}</th>
                <th className="p-3.5 text-start">{t('transport')}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الاعتماد المالي' : 'Imputation'}</th>
                <th className="p-3.5 text-start">{t('filterStatus')}</th>
                <th className="p-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    {t('tableEmpty')}
                  </td>
                </tr>
              ) : (
                filteredMissions.map((mission) => {
                  const emp = employees.find(e => e.id === mission.employeeId);
                  const empName = language === 'ar' && emp?.firstNameAr
                    ? `${emp.firstNameAr} ${emp.lastNameAr}`
                    : `${emp?.firstName} ${emp?.lastName}`;

                  const linkedExpense = mission.linkedExpenseClaimId 
                    ? expenseClaims.find(e => e.id === mission.linkedExpenseClaimId) 
                    : undefined;

                  return (
                    <tr key={mission.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* OM Number */}
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {mission.orderNumber}
                      </td>

                      {/* Beneficiary */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-400">{emp?.department}</div>
                      </td>

                      {/* Destination & Purpose */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-800 truncate">{mission.destination}</div>
                        <div className="text-[11px] text-slate-500 truncate">{mission.purpose}</div>
                      </td>

                      {/* Dates */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{mission.departureDate}</div>
                        <div className="text-[11px] text-slate-400">au {mission.returnDate}</div>
                      </td>

                      {/* Transport */}
                      <td className="p-3.5 whitespace-nowrap text-slate-700">
                        {t(`transport_${mission.transportMode}` as any)}
                      </td>

                      {/* Imputation Budgétaire */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {mission.budgetImputation === 'autre' && mission.budgetImputationOther 
                            ? mission.budgetImputationOther 
                            : 'IMROP'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={mission.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewMission(mission.id)}
                            title={t('btnViewDetails')}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintMission(mission)}
                            title={t('btnPrint')}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Link to Module 2 (Frais de mission) */}
                          {mission.status === 'validated_hr' && (
                            <button
                              onClick={() => {
                                const claim = generateExpenseClaimFromMission(mission.id);
                                if (claim && onNavigateToExpense) {
                                  onNavigateToExpense(claim.id);
                                } else {
                                  setActiveTab('expenses');
                                }
                              }}
                              title={linkedExpense ? "Consulter l'état de frais lié" : "Générer l'état de frais"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                linkedExpense
                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                              }`}
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>{t('showingRecords', { count: filteredMissions.length })}</span>
          <span className="text-[11px] text-slate-400">
            {t('linkedExpenseNotice')}
          </span>
        </div>
      </div>
    </div>
  );
};
