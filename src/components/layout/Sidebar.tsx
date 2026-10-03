import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';
import { 
  LayoutDashboard, 
  Compass, 
  Receipt, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  ShieldCheck,
  Building,
  Scale,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { 
    t, 
    activeTab, 
    setActiveTab, 
    missionOrders, 
    expenseClaims, 
    leaveRequests, 
    internalMemos, 
    companySettings,
    userRole,
    currentEmployee,
    logout
  } = useApp();

  // Escape key closes mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  // Calculate pending badges depending on role
  const pendingMissionsCount = missionOrders.filter(m => 
    userRole === 'manager' ? m.status === 'pending_manager' :
    userRole === 'hr_admin' ? (m.status === 'pending_manager' || m.status === 'approved_manager') :
    false
  ).length;

  const pendingExpensesCount = expenseClaims.filter(e => 
    userRole === 'manager' ? e.status === 'submitted' :
    userRole === 'hr_admin' ? (e.status === 'submitted' || e.status === 'approved_manager') :
    false
  ).length;

  const pendingLeavesCount = leaveRequests.filter(l => 
    userRole === 'manager' ? l.status === 'pending_manager' :
    userRole === 'hr_admin' ? (l.status === 'pending_manager' || l.status === 'approved_manager') :
    false
  ).length;

  // Unread memos count for current user
  const unreadMemosCount = internalMemos.filter(m => 
    !m.readReceipts.some(r => r.employeeId === currentEmployee.id)
  ).length;

  const allNavItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: 0,
      adminOnly: false
    },
    {
      id: 'personnel',
      label: t('navPersonnel'),
      icon: Users,
      badge: 0,
      adminOnly: false
    },
    {
      id: 'missions',
      label: t('navMissions'),
      icon: Compass,
      badge: pendingMissionsCount,
      adminOnly: false
    },
    {
      id: 'expenses',
      label: t('navExpenses'),
      icon: Receipt,
      badge: pendingExpensesCount,
      adminOnly: false
    },
    {
      id: 'memos',
      label: t('navMemos'),
      icon: FileText,
      badge: unreadMemosCount,
      adminOnly: false
    },
    {
      id: 'leaves',
      label: t('navLeaves'),
      icon: Calendar,
      badge: pendingLeavesCount,
      adminOnly: false
    },
    {
      id: 'mauritania_hr',
      label: t('navMauritaniaHr'),
      icon: Scale,
      badge: 0,
      adminOnly: false
    },
    {
      id: 'users_roles',
      label: t('navUsersRoles'),
      icon: ShieldCheck,
      badge: 0,
      adminOnly: true // Restreint uniquement aux utilisateurs autorisés / Administrateurs
    },
    {
      id: 'settings',
      label: t('navSettings'),
      icon: Settings,
      badge: 0,
      adminOnly: true // Restreint aux administrateurs
    }
  ];

  // Filtrer les onglets selon les droits d'accès de l'utilisateur connecté
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) {
      return userRole === 'hr_admin';
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 start-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between border-e border-slate-800 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Branding in Sidebar */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CompanyLogo size="sm" />
              <div className="leading-tight">
                <span className="font-extrabold text-white text-base block tracking-tight">
                  {companySettings.acronym || 'IMROP'}
                </span>
                <span className="text-[10px] text-cyan-400 font-medium">Portail RH & Missions</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info: Company & System Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('language') === 'العربية' ? 'Se déconnecter' : 'تسجيل الخروج'}</span>
            </div>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate font-medium text-slate-300">{companySettings.name}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Système synchronisé</span>
            </div>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              {companySettings.currency}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
