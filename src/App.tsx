import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MissionOrdersView } from './components/mission-orders/MissionOrdersView';
import { NewMissionModal } from './components/mission-orders/NewMissionModal';
import { MissionOrderDetailsModal } from './components/mission-orders/MissionOrderDetailsModal';
import { MissionOrderPrintDocument } from './components/mission-orders/MissionOrderPrintDocument';
import { ExpenseClaimsView } from './components/expense-claims/ExpenseClaimsView';
import { NewExpenseClaimModal } from './components/expense-claims/NewExpenseClaimModal';
import { ExpenseClaimDetailsModal } from './components/expense-claims/ExpenseClaimDetailsModal';
import { ExpenseClaimPrintDocument } from './components/expense-claims/ExpenseClaimPrintDocument';
import { MemosView } from './components/memos/MemosView';
import { NewMemoModal } from './components/memos/NewMemoModal';
import { MemoDetailsModal } from './components/memos/MemoDetailsModal';
import { MemoPrintDocument } from './components/memos/MemoPrintDocument';
import { LeavesView } from './components/leaves/LeavesView';
import { NewLeaveModal } from './components/leaves/NewLeaveModal';
import { LeaveDetailsModal } from './components/leaves/LeaveDetailsModal';
import { LeavePrintDocument } from './components/leaves/LeavePrintDocument';
import { PersonnelManagementView } from './components/personnel/PersonnelManagementView';
import { UsersRolesView } from './components/users-roles/UsersRolesView';
import { MauritanianHrHubView } from './components/mauritania-hr/MauritanianHrHubView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import { MissionOrder, ExpenseClaim, InternalMemo, LeaveRequest } from './types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AuthenticatedApp: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    userRole,
    language,
    missionOrders, 
    expenseClaims, 
    internalMemos, 
    leaveRequests 
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal States
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [preselectedEmployeeIdForMission, setPreselectedEmployeeIdForMission] = useState<string | undefined>(undefined);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [preselectedMissionId, setPreselectedMissionId] = useState<string | undefined>(undefined);
  const [showNewMemoModal, setShowNewMemoModal] = useState(false);
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);

  // Details Modal States
  const [viewingMissionId, setViewingMissionId] = useState<string | null>(null);
  const [viewingExpenseId, setViewingExpenseId] = useState<string | null>(null);
  const [viewingMemoId, setViewingMemoId] = useState<string | null>(null);
  const [viewingLeaveId, setViewingLeaveId] = useState<string | null>(null);

  // Print Document States
  const [printingMission, setPrintingMission] = useState<MissionOrder | null>(null);
  const [printingExpense, setPrintingExpense] = useState<ExpenseClaim | null>(null);
  const [printingMemo, setPrintingMemo] = useState<InternalMemo | null>(null);
  const [printingLeave, setPrintingLeave] = useState<LeaveRequest | null>(null);

  const selectedMission = viewingMissionId ? missionOrders.find(m => m.id === viewingMissionId) : null;
  const selectedExpense = viewingExpenseId ? expenseClaims.find(e => e.id === viewingExpenseId) : null;
  const selectedMemo = viewingMemoId ? internalMemos.find(m => m.id === viewingMemoId) : null;
  const selectedLeave = viewingLeaveId ? leaveRequests.find(l => l.id === viewingLeaveId) : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        onOpenNewMission={() => {
          setPreselectedEmployeeIdForMission(undefined);
          setShowNewMissionModal(true);
        }}
        onOpenNewExpense={() => {
          setPreselectedMissionId(undefined);
          setShowNewExpenseModal(true);
        }}
        onOpenNewMemo={() => setShowNewMemoModal(true)}
        onOpenNewLeave={() => setShowNewLeaveModal(true)}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left / Right Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                onOpenNewMission={() => {
                  setPreselectedEmployeeIdForMission(undefined);
                  setShowNewMissionModal(true);
                }}
                onOpenNewExpense={() => {
                  setPreselectedMissionId(undefined);
                  setShowNewExpenseModal(true);
                }}
                onOpenNewMemo={() => setShowNewMemoModal(true)}
                onOpenNewLeave={() => setShowNewLeaveModal(true)}
                onViewMission={(id) => setViewingMissionId(id)}
                onViewExpense={(id) => setViewingExpenseId(id)}
                onViewMemo={(id) => setViewingMemoId(id)}
                onViewLeave={(id) => setViewingLeaveId(id)}
              />
            )}

            {activeTab === 'personnel' && (
              <PersonnelManagementView 
                onOpenNewMissionWithEmployee={(empId) => {
                  setPreselectedEmployeeIdForMission(empId);
                  setShowNewMissionModal(true);
                }}
              />
            )}

            {activeTab === 'missions' && (
              <MissionOrdersView
                onOpenNewMission={() => {
                  setPreselectedEmployeeIdForMission(undefined);
                  setShowNewMissionModal(true);
                }}
                onViewMission={(id) => setViewingMissionId(id)}
                onPrintMission={(mission) => setPrintingMission(mission)}
                onNavigateToExpense={(expenseId) => setViewingExpenseId(expenseId)}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseClaimsView
                onOpenNewExpense={() => {
                  setPreselectedMissionId(undefined);
                  setShowNewExpenseModal(true);
                }}
                onViewExpense={(id) => setViewingExpenseId(id)}
                onPrintExpense={(claim) => setPrintingExpense(claim)}
              />
            )}

            {activeTab === 'memos' && (
              <MemosView
                onOpenNewMemo={() => setShowNewMemoModal(true)}
                onViewMemo={(id) => setViewingMemoId(id)}
                onPrintMemo={(memo) => setPrintingMemo(memo)}
              />
            )}

            {activeTab === 'leaves' && (
              <LeavesView
                onOpenNewLeave={() => setShowNewLeaveModal(true)}
                onViewLeave={(id) => setViewingLeaveId(id)}
                onPrintLeave={(leave) => setPrintingLeave(leave)}
              />
            )}

            {activeTab === 'mauritania_hr' && (
              <MauritanianHrHubView />
            )}

            {activeTab === 'users_roles' && (
              userRole === 'hr_admin' ? (
                <UsersRolesView />
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-black text-slate-900">
                      {language === 'ar' ? 'صلاحيات وصول مقيدة' : 'Accès Restreint — Droits Insuffisants'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      {language === 'ar'
                        ? 'قائمة المستخدمين وتعيين الأدوار مخصصة فقط للمستخدمين الذين لديهم صلاحيات إدارية (إدارة الموارد البشرية ومديرو النظام).'
                        : 'Le menu "Utilisateurs et rôles" est réservé exclusivement aux utilisateurs autorisés disposant du profil Administrateur RH ou Direction.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}</span>
                    </button>
                  </div>
                </div>
              )
            )}

            {activeTab === 'settings' && (
              userRole === 'hr_admin' ? (
                <SettingsView />
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-black text-slate-900">
                      {language === 'ar' ? 'إعدادات النظام العامة' : 'Paramètres Système Restreints'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      {language === 'ar'
                        ? 'إعدادات المنشأة والباريم العام مخصصة لمديري النظام.'
                        : 'La configuration des paramètres généraux et barèmes de frais est réservée aux administrateurs.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}

      {/* Module 1: Missions Modals */}
      {showNewMissionModal && (
        <NewMissionModal 
          preselectedEmployeeId={preselectedEmployeeIdForMission}
          onClose={() => {
            setShowNewMissionModal(false);
            setPreselectedEmployeeIdForMission(undefined);
          }} 
        />
      )}

      {selectedMission && (
        <MissionOrderDetailsModal
          mission={selectedMission}
          onClose={() => setViewingMissionId(null)}
          onOpenPrint={() => {
            setPrintingMission(selectedMission);
            setViewingMissionId(null);
          }}
          onNavigateToExpense={(expenseId) => {
            setViewingMissionId(null);
            setViewingExpenseId(expenseId);
          }}
        />
      )}

      {printingMission && (
        <MissionOrderPrintDocument
          mission={printingMission}
          onClose={() => setPrintingMission(null)}
        />
      )}

      {/* Module 2: Expenses Modals */}
      {showNewExpenseModal && (
        <NewExpenseClaimModal
          onClose={() => setShowNewExpenseModal(false)}
          preselectedMissionId={preselectedMissionId}
        />
      )}

      {selectedExpense && (
        <ExpenseClaimDetailsModal
          claim={selectedExpense}
          onClose={() => setViewingExpenseId(null)}
          onOpenPrint={() => {
            setPrintingExpense(selectedExpense);
            setViewingExpenseId(null);
          }}
        />
      )}

      {printingExpense && (
        <ExpenseClaimPrintDocument
          claim={printingExpense}
          onClose={() => setPrintingExpense(null)}
        />
      )}

      {/* Module 3: Memos Modals */}
      {showNewMemoModal && (
        <NewMemoModal onClose={() => setShowNewMemoModal(false)} />
      )}

      {selectedMemo && (
        <MemoDetailsModal
          memo={selectedMemo}
          onClose={() => setViewingMemoId(null)}
          onOpenPrint={() => {
            setPrintingMemo(selectedMemo);
            setViewingMemoId(null);
          }}
        />
      )}

      {printingMemo && (
        <MemoPrintDocument
          memo={printingMemo}
          onClose={() => setPrintingMemo(null)}
        />
      )}

      {/* Module 4: Leaves Modals */}
      {showNewLeaveModal && (
        <NewLeaveModal onClose={() => setShowNewLeaveModal(false)} />
      )}

      {selectedLeave && (
        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={() => setViewingLeaveId(null)}
          onOpenPrint={() => {
            setPrintingLeave(selectedLeave);
            setViewingLeaveId(null);
          }}
        />
      )}

      {printingLeave && (
        <LeavePrintDocument
          leave={printingLeave}
          onClose={() => setPrintingLeave(null)}
        />
      )}
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
