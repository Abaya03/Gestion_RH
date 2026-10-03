import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';
import { UserRole } from '../../types';
import { 
  Bell, 
  Languages, 
  User, 
  Plus, 
  Check, 
  Compass, 
  Receipt, 
  FileText, 
  Calendar,
  CheckCheck,
  ChevronDown,
  Building2,
  Briefcase,
  ShieldAlert,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onOpenNewMission: () => void;
  onOpenNewExpense: () => void;
  onOpenNewMemo: () => void;
  onOpenNewLeave: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewMission,
  onOpenNewExpense,
  onOpenNewMemo,
  onOpenNewLeave,
  onToggleSidebar
}) => {
  const { 
    language, 
    setLanguage, 
    t, 
    userRole, 
    setUserRole, 
    currentEmployeeId, 
    setCurrentEmployeeId, 
    currentEmployee, 
    employees, 
    companySettings,
    logout,
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setActiveTab 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowQuickMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    // Find matching employee dynamically from the real personnel list
    if (role === 'hr_admin') {
      const hrEmp = employees.find(e => e.role === 'hr_admin' || e.department.includes('SRH') || e.department.includes('SAL') || e.id === 'EMP-016' || e.id === 'EMP-001');
      if (hrEmp) setCurrentEmployeeId(hrEmp.id);
    } else if (role === 'manager') {
      const mgrEmp = employees.find(e => e.role === 'manager' || e.position.toLowerCase().includes('chef') || e.position.toLowerCase().includes('directeur adjoint') || e.id === 'EMP-002');
      if (mgrEmp) setCurrentEmployeeId(mgrEmp.id);
    } else {
      const regEmp = employees.find(e => e.grade === 'cadre' || e.grade === 'maitrise' || e.grade === 'employe' || e.id === 'EMP-003');
      if (regEmp) setCurrentEmployeeId(regEmp.id);
    }
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: System Title & Company Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <CompanyLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  {companySettings.acronym || 'IMROP'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-cyan-50 text-cyan-800 rounded-md border border-cyan-200 uppercase tracking-wide">
                  RH Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block leading-none">
                {language === 'ar' ? companySettings.nameAr : companySettings.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action + Language + Notifications + User & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button (3-clicks rule!) */}
          <div className="relative" ref={quickRef}>
            <button
              id="header-quick-action-btn"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t('quickAction')}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showQuickMenu && (
              <div className="absolute top-full mt-2 end-0 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('quickAction')}
                </div>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewMission();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-start transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>{t('newMissionQuick')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewLeave();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-start transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{t('newLeaveQuick')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewExpense();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-start transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>{t('newExpenseQuick')}</span>
                </button>
                {(userRole === 'hr_admin' || userRole === 'manager') && (
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewMemo();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-start transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>{t('newMemoQuick')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Language Switcher (FR / AR) */}
          <button
            id="header-lang-toggle"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Changer de langue / تغيير اللغة"
          >
            <Languages className="w-4 h-4 text-slate-500" />
            <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="header-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full mt-2 end-0 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{t('notifications')}</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t('markAllRead')}</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      {t('noNotifications')}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkTab) setActiveTab(n.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-start hover:bg-slate-50 transition-colors cursor-pointer ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-800">
                            {language === 'ar' && n.titleAr ? n.titleAr : n.title}
                          </span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {language === 'ar' && n.messageAr ? n.messageAr : n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher Popover */}
          <div className="relative" ref={userRef}>
            <button
              id="header-user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <img
                src={currentEmployee.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={currentEmployee.firstName}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="hidden md:block text-start leading-tight">
                <div className="text-xs font-semibold text-slate-900">
                  {language === 'ar' && currentEmployee.firstNameAr
                    ? `${currentEmployee.firstNameAr} ${currentEmployee.lastNameAr}`
                    : `${currentEmployee.firstName} ${currentEmployee.lastName}`}
                </div>
                <div className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                  <span>{t(`role_${userRole}`)}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute top-full mt-2 end-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active user header */}
                <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
                  <div className="text-xs font-bold text-slate-900">
                    {language === 'ar' && currentEmployee.firstNameAr
                      ? `${currentEmployee.firstNameAr} ${currentEmployee.lastNameAr}`
                      : `${currentEmployee.firstName} ${currentEmployee.lastName}`}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentEmployee.position} • {currentEmployee.matricule}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {currentEmployee.email}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('switchRole')}
                </div>
                <div className="space-y-1 mb-3">
                  <button
                    onClick={() => handleRoleChange('employee')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-start transition-colors cursor-pointer ${
                      userRole === 'employee' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('role_employee')}</span>
                    </div>
                    {userRole === 'employee' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => handleRoleChange('manager')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-start transition-colors cursor-pointer ${
                      userRole === 'manager' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('role_manager')}</span>
                    </div>
                    {userRole === 'manager' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => handleRoleChange('hr_admin')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-start transition-colors cursor-pointer ${
                      userRole === 'hr_admin' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('role_hr_admin')}</span>
                    </div>
                    {userRole === 'hr_admin' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                </div>

                {/* Switch Active Employee */}
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-2">
                  {t('currentUser')}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setCurrentEmployeeId(emp.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-start transition-colors cursor-pointer ${
                        currentEmployeeId === emp.id ? 'bg-slate-100 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"}
                        alt={emp.firstName}
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate">
                        {emp.firstName} {emp.lastName} ({emp.department.split(' ')[0]})
                      </span>
                    </button>
                  ))}
                </div>
                {/* Logout Button */}
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Logout Icon on Header */}
          <button
            onClick={() => logout()}
            title={language === 'ar' ? 'تسجيل الخروج والعودة لصفحة البداية' : "Se déconnecter et retourner à l'accueil"}
            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer hidden sm:flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
