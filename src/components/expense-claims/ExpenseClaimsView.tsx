import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseClaim } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { exportExpensesToExcel } from '../../utils/exportUtils';
import { 
  Receipt, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  CheckCircle2, 
  CreditCard,
  Building,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface ExpenseClaimsViewProps {
  onOpenNewExpense: () => void;
  onViewExpense: (id: string) => void;
  onPrintExpense: (claim: ExpenseClaim) => void;
}

export const ExpenseClaimsView: React.FC<ExpenseClaimsViewProps> = ({
  onOpenNewExpense,
  onViewExpense,
  onPrintExpense
}) => {
  const { 
    language, 
    t, 
    userRole, 
    employees, 
    expenseClaims, 
    companySettings,
    missionOrders
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredClaims = expenseClaims.filter(claim => {
    const emp = employees.find(e => e.id === claim.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';
    const empNameAr = emp ? `${emp.firstNameAr} ${emp.lastNameAr}` : '';

    const matchSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empNameAr.includes(searchTerm);

    const matchDept = selectedDept === 'ALL' || emp?.department === selectedDept;
    const matchStatus = selectedStatus === 'ALL' || claim.status === selectedStatus;

    return matchSearch && matchDept && matchStatus;
  });

  const handleExport = () => {
    exportExpensesToExcel(filteredClaims, employees, companySettings.currency, language);
  };

  const totalDisbursed = expenseClaims
    .filter(c => c.status === 'paid' || c.status === 'validated_hr')
    .reduce((sum, c) => sum + c.netPayable, 0);

  const totalPending = expenseClaims
    .filter(c => c.status === 'submitted' || c.status === 'approved_manager')
    .reduce((sum, c) => sum + c.netPayable, 0);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">{t('expenseTitle')}</h1>
              <p className="text-xs text-slate-500">{t('expenseSubtitle')}</p>
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
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newExpenseClaim')}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'ar' ? 'إجمالي المبالغ المدفوعة' : 'Total Décaissé & Réglé'}
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {totalDisbursed.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {companySettings.currency}
          </div>
          <span className="text-[11px] text-slate-400">
            {expenseClaims.filter(c => c.status === 'paid').length} {language === 'ar' ? 'كشوفات مسددة' : 'états payés'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'ar' ? 'كشوفات في انتظار الصرف' : 'En Attente de Règlement'}
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {totalPending.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {companySettings.currency}
          </div>
          <span className="text-[11px] text-slate-400">
            {expenseClaims.filter(c => c.status === 'submitted' || c.status === 'approved_manager').length} {language === 'ar' ? 'قيد المعالجة' : 'en cours'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'ar' ? 'الربط التلقائي بأوامر المهمة' : 'Taux d\'intégration OM'}
          </span>
          <div className="text-xl font-bold text-indigo-600 mt-1">
            {Math.round((expenseClaims.filter(c => c.missionOrderId).length / (expenseClaims.length || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400">
            {expenseClaims.filter(c => c.missionOrderId).length} {language === 'ar' ? 'كشف مرتبط بأمر مهمة' : 'avec OM lié'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">{t('filterDepartment')} ({t('filterAll')})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">{t('filterStatus')} ({t('filterAll')})</option>
              <option value="submitted">{t('status_submitted')}</option>
              <option value="approved_manager">{t('status_approved_manager')}</option>
              <option value="paid">{t('status_paid')}</option>
              <option value="rejected">{t('status_rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 text-start">{t('claimNumber')}</th>
                <th className="p-3.5 text-start">{t('beneficiary')}</th>
                <th className="p-3.5 text-start">{t('linkedOm')}</th>
                <th className="p-3.5 text-start">{t('dateSubmission')}</th>
                <th className="p-3.5 text-end">{t('totalExpenses')}</th>
                <th className="p-3.5 text-end">{t('advanceDeducted')}</th>
                <th className="p-3.5 text-end">{t('netPayable')}</th>
                <th className="p-3.5 text-start">{t('filterStatus')}</th>
                <th className="p-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    {t('tableEmpty')}
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const emp = employees.find(e => e.id === claim.employeeId);
                  const empName = language === 'ar' && emp?.firstNameAr
                    ? `${emp.firstNameAr} ${emp.lastNameAr}`
                    : `${emp?.firstName} ${emp?.lastName}`;

                  const mission = claim.missionOrderId 
                    ? missionOrders.find(m => m.id === claim.missionOrderId) 
                    : undefined;

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {claim.claimNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{empName}</div>
                        <div className="text-[11px] text-slate-400">{emp?.department}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {mission ? (
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            {mission.orderNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {claim.submissionDate}
                      </td>

                      <td className="p-3.5 text-end font-semibold text-slate-800 whitespace-nowrap">
                        {claim.totalExpenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {companySettings.currency}
                      </td>

                      <td className="p-3.5 text-end text-rose-600 whitespace-nowrap">
                        {claim.advanceDeducted > 0 ? `- ${claim.advanceDeducted.toLocaleString('fr-FR')} ${companySettings.currency}` : '0'}
                      </td>

                      <td className="p-3.5 text-end font-extrabold text-indigo-900 text-sm whitespace-nowrap">
                        {claim.netPayable.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {companySettings.currency}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={claim.status} size="sm" />
                      </td>

                      <td className="p-3.5 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewExpense(claim.id)}
                            title={t('btnViewDetails')}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintExpense(claim)}
                            title={t('btnPrint')}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
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
          <span>{t('showingRecords', { count: filteredClaims.length })}</span>
          <span className="text-[11px] text-slate-400">
            Paiements vérifiés et archivés selon normes comptables
          </span>
        </div>
      </div>
    </div>
  );
};
