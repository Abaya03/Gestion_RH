import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  UserRole, 
  Employee, 
  Department,
  MissionOrder, 
  ExpenseClaim, 
  InternalMemo, 
  LeaveRequest, 
  PerDiemRate, 
  CompanySettings, 
  AuditLog, 
  AppNotification,
  ExpenseItem
} from '../types';
import { 
  initialEmployees, 
  initialDepartments,
  initialMissionOrders, 
  initialExpenseClaims, 
  initialInternalMemos, 
  initialLeaveRequests, 
  initialPerDiemRates, 
  initialCompanySettings, 
  initialAuditLogs, 
  initialNotifications 
} from '../data/mockData';
import { translations } from '../i18n/translations';
import { numberToWordsFR } from '../utils/numberToWords';

interface AppContextType {
  // Authentication State (Opening / Login Screen)
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;

  // Localization & Role
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['fr'], params?: Record<string, string | number>) => string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentEmployeeId: string;
  setCurrentEmployeeId: (id: string) => void;
  currentEmployee: Employee;

  // Active View
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Core Data
  employees: Employee[];
  missionOrders: MissionOrder[];
  expenseClaims: ExpenseClaim[];
  internalMemos: InternalMemo[];
  leaveRequests: LeaveRequest[];
  perDiemRates: PerDiemRate[];
  companySettings: CompanySettings;
  auditLogs: AuditLog[];
  notifications: AppNotification[];

  // Mission Actions
  createMissionOrder: (data: Omit<MissionOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => MissionOrder;
  updateMissionOrder: (id: string, data: Partial<MissionOrder>) => void;
  approveMissionByManager: (id: string) => void;
  validateMissionByHR: (id: string) => void;
  rejectMission: (id: string, reason: string) => void;
  deleteMissionOrder: (id: string) => void;
  generateExpenseClaimFromMission: (missionId: string) => ExpenseClaim | null;

  // Expense Actions
  createExpenseClaim: (data: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'submissionDate' | 'status' | 'totalExpenses' | 'netPayable'>) => ExpenseClaim;
  updateExpenseClaim: (id: string, data: Partial<ExpenseClaim>) => void;
  approveExpenseByManager: (id: string) => void;
  validateExpenseByHR: (id: string, paymentDetails?: { method: 'virement' | 'cheque' | 'especes'; ref: string }) => void;
  rejectExpense: (id: string, reason: string) => void;
  deleteExpenseClaim: (id: string) => void;

  // Memo Actions
  createInternalMemo: (data: Omit<InternalMemo, 'id' | 'memoNumber' | 'publishedDate' | 'readReceipts'>) => InternalMemo;
  acknowledgeMemo: (memoId: string) => void;
  deleteInternalMemo: (id: string) => void;

  // Leave Actions
  createLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => { request?: LeaveRequest; error?: string };
  approveLeaveByManager: (id: string) => void;
  validateLeaveByHR: (id: string) => void;
  rejectLeave: (id: string, reason: string) => void;
  deleteLeaveRequest: (id: string) => void;

  // Employee Actions
  createEmployee: (data: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Department & Service Actions
  departments: Department[];
  createDepartment: (data: Omit<Department, 'id'> & { id?: string }) => Department;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => { success: boolean; error?: string };

  // Settings & Rates
  updatePerDiemRates: (rates: PerDiemRate[]) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  restoreDemoData: () => void;
  reloadOfficialImropPersonnel: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Helper
  getEmployeeById: (id: string) => Employee | undefined;
  getPerDiemRateForGrade: (grade: string) => PerDiemRate | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'RH_PRO_DATA_V4';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rh_pro_lang');
    return (saved === 'ar' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rh_pro_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // 1b. Authentication State (Opening / Login screen)
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    const savedAuth = sessionStorage.getItem('rh_pro_auth');
    return savedAuth === 'true';
  });

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
    if (auth) {
      sessionStorage.setItem('rh_pro_auth', 'true');
    } else {
      sessionStorage.removeItem('rh_pro_auth');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. User & Role
  const [userRole, setUserRole] = useState<UserRole>('hr_admin');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('EMP-034'); // default Chef Service SRH / Logistique (EL Khalifa Boullahi EL Hacen)

  // 4. Persistence state
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 200) {
          return parsed;
        }
      } catch (e) {
        // ignore and fallback
      }
    }
    return initialEmployees;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return initialDepartments;
  });

  const [missionOrders, setMissionOrders] = useState<MissionOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_missions`);
    return saved ? JSON.parse(saved) : initialMissionOrders;
  });

  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenseClaims;
  });

  const [internalMemos, setInternalMemos] = useState<InternalMemo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_memos`);
    return saved ? JSON.parse(saved) : initialInternalMemos;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leaves`);
    return saved ? JSON.parse(saved) : initialLeaveRequests;
  });

  const [perDiemRates, setPerDiemRates] = useState<PerDiemRate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_baremes`);
    return saved ? JSON.parse(saved) : initialPerDiemRates;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_company`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currency === 'MAD' || !parsed.currency) {
          parsed.currency = 'MRU';
          parsed.currencyAr = 'أوقية';
        }
        return parsed;
      } catch (e) {
        return initialCompanySettings;
      }
    }
    return initialCompanySettings;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_missions`, JSON.stringify(missionOrders));
  }, [missionOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenseClaims));
  }, [expenseClaims]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_memos`, JSON.stringify(internalMemos));
  }, [internalMemos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leaves`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_baremes`, JSON.stringify(perDiemRates));
  }, [perDiemRates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  // Current Employee helper
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) || employees[0];

  // Helper function to get employee by ID
  const getEmployeeById = (id: string) => employees.find(e => e.id === id);

  // Helper function to get per diem rate
  const getPerDiemRateForGrade = (grade: string) => perDiemRates.find(r => r.grade === grade);

  // Translation helper
  const t = (key: keyof typeof translations['fr'], params?: Record<string, string | number>): string => {
    let str = (translations[language] && (translations[language] as any)[key]) || (translations['fr'] as any)[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  // Add Log Helper
  const addLog = (action: string, actionAr: string, module: AuditLog['module'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentEmployee.id,
      userName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      action,
      actionAr,
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add Notification Helper
  const addNotification = (
    recipientId: string,
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    type: AppNotification['type'] = 'info',
    linkTab?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientId,
      title,
      titleAr,
      message,
      messageAr,
      type,
      linkTab,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // -------------------------------------------------------------
  // MISSION ORDERS (Module 1)
  // -------------------------------------------------------------
  const createMissionOrder = (data: Omit<MissionOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>): MissionOrder => {
    const currentYear = new Date().getFullYear();
    const countThisYear = missionOrders.filter(m => m.orderNumber.includes(`${currentYear}`)).length + 1;
    const orderNumber = `OM-${currentYear}-${String(countThisYear).padStart(4, '0')}`;

    // Calculate total mission fees: (daysCount * dailyRate) + transportCost
    const days = data.daysCount !== undefined && data.daysCount > 0 ? data.daysCount : 1;
    const rate = data.dailyRate !== undefined ? data.dailyRate : 0;
    const transport = data.transportCost !== undefined ? data.transportCost : 0;
    const totalFees = data.totalMissionFees !== undefined && data.totalMissionFees > 0 
      ? data.totalMissionFees 
      : (days * rate) + transport;

    const estimatedBudget = totalFees > 0 ? totalFees : data.estimatedBudget;

    const newOrder: MissionOrder = {
      ...data,
      id: `om-${Date.now()}`,
      orderNumber,
      daysCount: days,
      dailyRate: rate,
      transportCost: transport,
      totalMissionFees: totalFees,
      estimatedBudget,
      status: 'pending_manager',
      createdAt: new Date().toISOString(),
      createdBy: currentEmployee.id
    };

    setMissionOrders(prev => [newOrder, ...prev]);

    const beneficiary = getEmployeeById(data.employeeId);
    const beneficiaryName = beneficiary ? `${beneficiary.firstName} ${beneficiary.lastName}` : data.employeeId;

    addLog(
      `Création de l'ordre de mission ${orderNumber}`,
      `إنشاء أمر مهمة جديد ${orderNumber}`,
      'missions',
      `Destination: ${data.destination} pour ${beneficiaryName}. Frais: (${days}j x ${rate} MRU) + ${transport} MRU Transport = ${totalFees} ${companySettings.currency}`
    );

    // If autoGenerateExpenseClaim was requested, create linked expense claim immediately
    if (data.autoGenerateExpenseClaim) {
      setTimeout(() => {
        generateExpenseClaimFromMission(newOrder.id);
      }, 50);
    }

    // Notify manager
    if (beneficiary?.managerId) {
      addNotification(
        beneficiary.managerId,
        `Nouvel ordre de mission à approuver (${orderNumber})`,
        `أمر مهمة جديد بانتظار موافقتك (${orderNumber})`,
        `${beneficiaryName} a soumis un ordre de mission pour ${data.destination}. Montant: ${totalFees} ${companySettings.currency}`,
        `قام ${beneficiaryName} بتقديم أمر مهمة للوجهة ${data.destination}. المبلغ: ${totalFees} ${companySettings.currencyAr}`,
        'info',
        'missions'
      );
    }

    return newOrder;
  };

  const updateMissionOrder = (id: string, data: Partial<MissionOrder>) => {
    setMissionOrders(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const approveMissionByManager = (id: string) => {
    const order = missionOrders.find(m => m.id === id);
    if (!order) return;

    const updated = {
      ...order,
      status: 'approved_manager' as const,
      managerApprovedAt: new Date().toISOString(),
      managerApprovedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`
    };

    setMissionOrders(prev => prev.map(m => m.id === id ? updated : m));

    addLog(
      `Approbation N+1 de l'ordre ${order.orderNumber}`,
      `موافقة المسؤول المباشر N+1 على أمر المهمة ${order.orderNumber}`,
      'missions',
      `Approuvé par ${currentEmployee.firstName} ${currentEmployee.lastName}. Transmis aux RH.`
    );

    // Notify HR
    addNotification(
      'EMP-004', // HR Director
      `Ordre de mission approuvé par N+1 (${order.orderNumber})`,
      `أمر مهمة معتمد من المسؤول المباشر (${order.orderNumber})`,
      `L'ordre de mission ${order.orderNumber} est validé par le responsable et attend votre visa RH final.`,
      `أمر المهمة ${order.orderNumber} تمت الموافقة عليه وينتظر مصادقة الموارد البشرية.`,
      'warning',
      'missions'
    );
  };

  const validateMissionByHR = (id: string) => {
    const order = missionOrders.find(m => m.id === id);
    if (!order) return;

    const updated = {
      ...order,
      status: 'validated_hr' as const,
      hrValidatedAt: new Date().toISOString(),
      hrValidatedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`
    };

    setMissionOrders(prev => prev.map(m => m.id === id ? updated : m));

    addLog(
      `Validation RH définitive de l'ordre ${order.orderNumber}`,
      `المصادقة النهائية للموارد البشرية على أمر المهمة ${order.orderNumber}`,
      'missions',
      `Validé par ${currentEmployee.firstName} ${currentEmployee.lastName}. Ordre officiel généré.`
    );

    // Notify Employee
    addNotification(
      order.employeeId,
      `Votre ordre de mission ${order.orderNumber} est validé !`,
      `تمت المصادقة على أمر المهمة الخاص بك ${order.orderNumber} !`,
      `Votre déplacement pour ${order.destination} a été validé par la Direction RH. Vous pouvez imprimer votre ordre officiel.`,
      `تمت المصادقة على تنقلك إلى ${order.destination}. يمكنك الآن طباعة الوثيقة الرسمية.`,
      'success',
      'missions'
    );
  };

  const rejectMission = (id: string, reason: string) => {
    const order = missionOrders.find(m => m.id === id);
    if (!order) return;

    const updated = {
      ...order,
      status: 'rejected' as const,
      rejectionReason: reason
    };

    setMissionOrders(prev => prev.map(m => m.id === id ? updated : m));

    addLog(
      `Refus de l'ordre de mission ${order.orderNumber}`,
      `رفض أمر المهمة ${order.orderNumber}`,
      'missions',
      `Motif: ${reason}`
    );

    addNotification(
      order.employeeId,
      `Ordre de mission ${order.orderNumber} refusé`,
      `تم رفض أمر المهمة ${order.orderNumber}`,
      `Votre demande a été refusée pour le motif suivant : ${reason}`,
      `تم رفض طلبك للسبب التالي : ${reason}`,
      'error',
      'missions'
    );
  };

  const deleteMissionOrder = (id: string) => {
    setMissionOrders(prev => prev.filter(m => m.id !== id));
  };

  // Automatic connection: Generate Expense Claim from approved Mission Order!
  const generateExpenseClaimFromMission = (missionId: string): ExpenseClaim | null => {
    const mission = missionOrders.find(m => m.id === missionId);
    if (!mission) return null;

    if (mission.linkedExpenseClaimId) {
      const existing = expenseClaims.find(e => e.id === mission.linkedExpenseClaimId);
      if (existing) return existing;
    }

    const employee = getEmployeeById(mission.employeeId);
    const bareme = employee ? getPerDiemRateForGrade(employee.grade) : perDiemRates[1];

    // Calculate days duration: prioritize mission.daysCount
    const start = new Date(mission.departureDate);
    const end = new Date(mission.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const fallbackDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const daysCount = mission.daysCount !== undefined && mission.daysCount > 0 ? mission.daysCount : fallbackDays;

    const isAbroad = mission.destinationType === 'a_letranger';
    const bcmRateEuro = 37.14;
    const bcmRateDollar = 0;

    // Daily rate determination: prioritize mission.dailyRate
    let perDiemMru = 0;
    let perDiemEuro = 0;
    if (isAbroad) {
      perDiemEuro = mission.dailyRate !== undefined && mission.dailyRate > 0 ? mission.dailyRate : 150;
      perDiemMru = Math.round(perDiemEuro * bcmRateEuro);
    } else {
      if (mission.dailyRate !== undefined && mission.dailyRate > 0) {
        perDiemMru = mission.dailyRate;
      } else {
        perDiemMru = bareme?.nationalPerDiemMru || 2500;
      }
    }

    // Manual transport cost in MRU
    const transportAmountMru = mission.transportCost !== undefined ? Number(mission.transportCost) : 0;

    const items: ExpenseItem[] = [];

    // 1. Per diem allowance line item
    const perDiemTotal = daysCount * perDiemMru;
    items.push({
      id: `item-${Date.now()}-1`,
      category: 'per_diem',
      description: isAbroad 
        ? `Indemnités journalières de séjour (${daysCount} jours x ${perDiemEuro} € x ${bcmRateEuro} MRU)` 
        : `Indemnités journalières de mission (${daysCount} jours x ${perDiemMru} ${companySettings.currency})`,
      descriptionAr: isAbroad
        ? `تعويضات الإقامة اليومية (${daysCount} أيام × ${perDiemEuro} € × ${bcmRateEuro} أوقية)`
        : `التعويض اليومي للمهمة (${daysCount} أيام × ${perDiemMru} ${companySettings.currencyAr})`,
      date: mission.departureDate,
      amount: perDiemTotal,
      quantity: daysCount,
      unitPrice: perDiemMru,
      isPerDiemAuto: true
    });

    // 2. Transport cost line item (manual transport)
    if (transportAmountMru > 0) {
      items.push({
        id: `item-${Date.now()}-2`,
        category: 'transport',
        description: `Frais de transport (${(mission.transportSelection || mission.transportMode).toUpperCase()}) : ${mission.transportDetails || mission.destination}`,
        descriptionAr: `مصاريف النقل (${mission.transportSelection || mission.transportMode}) : ${mission.destination}`,
        date: mission.departureDate,
        amount: transportAmountMru,
        quantity: 1,
        unitPrice: transportAmountMru,
        receiptName: `Justificatif_Transport_${mission.orderNumber}.pdf`,
        isPerDiemAuto: false
      });
    }

    const currentYear = new Date().getFullYear();
    const countThisYear = expenseClaims.filter(e => e.claimNumber.includes(`${currentYear}`)).length + 1;
    const claimNumber = `${currentYear}-${String(countThisYear).padStart(3, '0')}`;

    const totalEuro = isAbroad ? daysCount * perDiemEuro : undefined;
    const totalExp = perDiemTotal + transportAmountMru;
    const advance = mission.advanceRequested ? Number(mission.advanceAmount || 0) : 0;
    const net = Math.max(0, totalExp - advance);

    const paymentReason = `Régularisation frais de mission à ${mission.destinationPrecisions || mission.destination}`;
    const amountInWords = numberToWordsFR(net, 'MRU');

    const newClaim: ExpenseClaim = {
      id: `ef-${Date.now()}`,
      claimNumber,
      missionOrderId: mission.id,
      employeeId: mission.employeeId,
      submissionDate: new Date().toLocaleDateString('fr-FR'),
      status: 'submitted',
      paymentReason,
      referenceOM: mission.orderNumber.length > 3 ? mission.orderNumber.slice(-3) : mission.orderNumber,
      missionStartDate: mission.departureDate.split('-').reverse().join('/'),
      missionEndDate: mission.returnDate.includes('-') ? mission.returnDate.split('-').reverse().join('/') : mission.returnDate,
      daysCount,
      perDiemDailyRateMru: perDiemMru,
      transportAmountMru,
      perDiemDailyRateDollar: 0,
      perDiemDailyRateEuro: perDiemEuro,
      totalDevise: totalEuro || 0,
      bcmRateEuro,
      bcmRateDollar,
      bankName: employee?.bankName || 'BCI',
      bankAccount: employee?.bankAccount || '8984',
      imputation: mission.budgetImputation === 'autre' ? (mission.budgetImputationOther || 'Autre') : 'IMROP',
      amountInWords,
      items,
      totalExpenses: totalExp,
      advanceDeducted: advance,
      netPayable: net,
      notes: `Généré automatiquement depuis l'ordre de mission N°${mission.orderNumber}. Formule: (${daysCount} j x ${perDiemMru} MRU) + ${transportAmountMru} MRU Transport = ${totalExp} MRU.`
    };

    setExpenseClaims(prev => [newClaim, ...prev]);

    // Update mission with linked id
    setMissionOrders(prev => prev.map(m => m.id === mission.id ? { ...m, linkedExpenseClaimId: newClaim.id } : m));

    addLog(
      `Génération automatique de l'état de frais ${claimNumber} pour la mission ${mission.orderNumber}`,
      `إنشاء تلقائي لكشف المصاريف ${claimNumber} المرتبط بأمر المهمة ${mission.orderNumber}`,
      'expenses',
      `Total: ${totalExp} ${companySettings.currency}, Avance déduite: ${advance} ${companySettings.currency}, Net: ${net} ${companySettings.currency}`
    );

    return newClaim;
  };

  // -------------------------------------------------------------
  // EXPENSE CLAIMS (Module 2)
  // -------------------------------------------------------------
  const createExpenseClaim = (data: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'submissionDate' | 'status' | 'totalExpenses' | 'netPayable'> & Partial<Pick<ExpenseClaim, 'totalExpenses' | 'netPayable'>>): ExpenseClaim => {
    const currentYear = new Date().getFullYear();
    const countThisYear = expenseClaims.filter(e => e.claimNumber.includes(`${currentYear}`)).length + 1;
    const claimNumber = `${currentYear}-${String(countThisYear).padStart(3, '0')}`;

    const totalExp = data.totalExpenses !== undefined ? data.totalExpenses : data.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const advance = Number(data.advanceDeducted || 0);
    const net = data.netPayable !== undefined ? data.netPayable : Math.max(0, totalExp - advance);

    const newClaim: ExpenseClaim = {
      ...data,
      id: `ef-${Date.now()}`,
      claimNumber,
      submissionDate: new Date().toLocaleDateString('fr-FR'),
      status: 'submitted',
      totalExpenses: totalExp,
      advanceDeducted: advance,
      netPayable: net
    };

    setExpenseClaims(prev => [newClaim, ...prev]);

    const beneficiary = getEmployeeById(data.employeeId);
    const beneficiaryName = beneficiary ? `${beneficiary.firstName} ${beneficiary.lastName}` : data.employeeId;

    addLog(
      `Création de l'état de frais ${claimNumber}`,
      `إنشاء كشف مصاريف جديد ${claimNumber}`,
      'expenses',
      `Collaborateur: ${beneficiaryName}, Total: ${totalExp} ${companySettings.currency}, Net: ${net} ${companySettings.currency}`
    );

    return newClaim;
  };

  const updateExpenseClaim = (id: string, data: Partial<ExpenseClaim>) => {
    setExpenseClaims(prev => prev.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, ...data };
      if (data.items || data.advanceDeducted !== undefined) {
        const items = data.items || e.items;
        const total = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
        const adv = data.advanceDeducted !== undefined ? Number(data.advanceDeducted) : e.advanceDeducted;
        updated.totalExpenses = total;
        updated.netPayable = total - adv;
      }
      return updated;
    }));
  };

  const approveExpenseByManager = (id: string) => {
    const claim = expenseClaims.find(e => e.id === id);
    if (!claim) return;

    const updated = {
      ...claim,
      status: 'approved_manager' as const,
      managerApprovedAt: new Date().toISOString(),
      managerApprovedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`
    };

    setExpenseClaims(prev => prev.map(e => e.id === id ? updated : e));

    addLog(
      `Approbation N+1 de l'état de frais ${claim.claimNumber}`,
      `موافقة المسؤول المباشر على كشف المصاريف ${claim.claimNumber}`,
      'expenses',
      `Transmis pour ordonnancement et bon à payer RH.`
    );

    addNotification(
      'EMP-004',
      `État de frais approuvé par N+1 (${claim.claimNumber})`,
      `كشف مصاريف معتمد من المسؤول المباشر (${claim.claimNumber})`,
      `Montant net de ${claim.netPayable} ${companySettings.currency} en attente de visa RH / Bon à payer.`,
      `المبلغ الصافي ${claim.netPayable} ${companySettings.currencyAr} بانتظار تأشيرة الصرف.`,
      'warning',
      'expenses'
    );
  };

  const validateExpenseByHR = (id: string, paymentDetails?: { method: 'virement' | 'cheque' | 'especes'; ref: string }) => {
    const claim = expenseClaims.find(e => e.id === id);
    if (!claim) return;

    const updated = {
      ...claim,
      status: 'paid' as const,
      hrValidatedAt: new Date().toISOString(),
      hrValidatedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      paymentMethod: paymentDetails?.method || 'virement',
      paymentReference: paymentDetails?.ref || `VIR-REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().slice(0, 10)
    };

    setExpenseClaims(prev => prev.map(e => e.id === id ? updated : e));

    addLog(
      `Validation & Paiement de l'état de frais ${claim.claimNumber}`,
      `مصادقة وصرف كشف المصاريف ${claim.claimNumber}`,
      'expenses',
      `Montant net décaissé : ${claim.netPayable} ${companySettings.currency} (${updated.paymentMethod} - Réf: ${updated.paymentReference})`
    );

    addNotification(
      claim.employeeId,
      `Règlement de votre état de frais ${claim.claimNumber} effectué !`,
      `تم صرف وتسوية كشف المصاريف الخاص بك ${claim.claimNumber} !`,
      `Un règlement de ${claim.netPayable} ${companySettings.currency} a été ordonné par ${updated.paymentMethod}.`,
      `تم إصدار أمر صرف بمبلغ ${claim.netPayable} ${companySettings.currencyAr}.`,
      'success',
      'expenses'
    );
  };

  const rejectExpense = (id: string, reason: string) => {
    const claim = expenseClaims.find(e => e.id === id);
    if (!claim) return;

    const updated = {
      ...claim,
      status: 'rejected' as const,
      rejectionReason: reason
    };

    setExpenseClaims(prev => prev.map(e => e.id === id ? updated : e));

    addLog(
      `Refus de l'état de frais ${claim.claimNumber}`,
      `رفض كشف المصاريف ${claim.claimNumber}`,
      'expenses',
      `Motif: ${reason}`
    );

    addNotification(
      claim.employeeId,
      `État de frais ${claim.claimNumber} rejeté`,
      `تم رفض كشف المصاريف ${claim.claimNumber}`,
      `Motif : ${reason}`,
      `السبب : ${reason}`,
      'error',
      'expenses'
    );
  };

  const deleteExpenseClaim = (id: string) => {
    setExpenseClaims(prev => prev.filter(e => e.id !== id));
  };

  // -------------------------------------------------------------
  // INTERNAL MEMOS (Module 3)
  // -------------------------------------------------------------
  const createInternalMemo = (data: Omit<InternalMemo, 'id' | 'memoNumber' | 'publishedDate' | 'readReceipts'>): InternalMemo => {
    const currentYear = new Date().getFullYear();
    const countThisYear = internalMemos.filter(m => m.memoNumber.includes(`${currentYear}`)).length + 1;
    const memoNumber = `NS-${currentYear}-${String(countThisYear).padStart(3, '0')}`;

    const newMemo: InternalMemo = {
      ...data,
      id: `memo-${Date.now()}`,
      memoNumber,
      publishedDate: new Date().toISOString().slice(0, 10),
      readReceipts: [
        {
          employeeId: currentEmployee.id,
          readAt: new Date().toISOString(),
          acknowledged: true
        }
      ]
    };

    setInternalMemos(prev => [newMemo, ...prev]);

    addLog(
      `Publication de la Note de Service ${memoNumber}`,
      `نشر مذكرة المصلحة الداخلية ${memoNumber}`,
      'memos',
      `Titre: ${data.title}. Audience: ${data.audience}`
    );

    // Notify targeted audience
    addNotification(
      'all',
      `Nouvelle Note de Service : ${data.title}`,
      `مذكرة مصلحة جديدة : ${data.titleAr || data.title}`,
      `Une nouvelle note (${memoNumber}) a été publiée par la Direction. Veuillez en prendre connaissance.`,
      `تم نشر مذكرة مصلحة جديدة (${memoNumber}). يُرجى الاطلاع والتأكيد.`,
      data.isUrgent ? 'warning' : 'info',
      'memos'
    );

    return newMemo;
  };

  const acknowledgeMemo = (memoId: string) => {
    setInternalMemos(prev => prev.map(m => {
      if (m.id !== memoId) return m;
      const existing = m.readReceipts.find(r => r.employeeId === currentEmployee.id);
      if (existing) return m;

      const newReceipts = [
        ...m.readReceipts,
        {
          employeeId: currentEmployee.id,
          readAt: new Date().toISOString(),
          acknowledged: true
        }
      ];
      return { ...m, readReceipts: newReceipts };
    }));

    addLog(
      `Accusé de lecture de la Note ${memoId} par ${currentEmployee.firstName} ${currentEmployee.lastName}`,
      `تأكيد قراءة المذكرة ${memoId} من طرف ${currentEmployee.firstName} ${currentEmployee.lastName}`,
      'memos',
      `Accusé de réception enregistré avec succès.`
    );
  };

  const deleteInternalMemo = (id: string) => {
    setInternalMemos(prev => prev.filter(m => m.id !== id));
  };

  // -------------------------------------------------------------
  // LEAVE MANAGEMENT (Module 4)
  // -------------------------------------------------------------
  const createLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>): { request?: LeaveRequest; error?: string } => {
    const employee = getEmployeeById(data.employeeId);
    if (!employee) return { error: "Employé introuvable" };

    // Check balance
    if (data.leaveType === 'annual' && data.totalDays > employee.remainingLeaveDays) {
      return { 
        error: language === 'ar' 
          ? `الرصيد المتبقي (${employee.remainingLeaveDays} يوم) غير كافٍ لطلب ${data.totalDays} يوم.`
          : `Solde insuffisant (${employee.remainingLeaveDays} j restants) pour une demande de ${data.totalDays} j.`
      };
    }

    const currentYear = new Date().getFullYear();
    const countThisYear = leaveRequests.filter(l => l.requestNumber.includes(`${currentYear}`)).length + 1;
    const requestNumber = `CG-${currentYear}-${String(countThisYear).padStart(4, '0')}`;

    const newRequest: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      requestNumber,
      status: 'pending_manager',
      createdAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    const beneficiaryName = `${employee.firstName} ${employee.lastName}`;

    addLog(
      `Demande de congé ${requestNumber} pour ${beneficiaryName}`,
      `طلب إجازة جديد ${requestNumber} للموظف ${beneficiaryName}`,
      'leaves',
      `Type: ${data.leaveType}, Durée: ${data.totalDays} jour(s) du ${data.startDate} au ${data.endDate}`
    );

    // Notify manager
    if (employee.managerId) {
      addNotification(
        employee.managerId,
        `Demande de congé à approuver (${requestNumber})`,
        `طلب إجازة بانتظار موافقتك (${requestNumber})`,
        `${beneficiaryName} demande ${data.totalDays} jour(s) de congé (${data.leaveType}).`,
        `طلب ${beneficiaryName} إجازة لمدة ${data.totalDays} يوم (${data.leaveType}).`,
        'info',
        'leaves'
      );
    }

    return { request: newRequest };
  };

  const approveLeaveByManager = (id: string) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    const updated = {
      ...req,
      status: 'approved_manager' as const,
      managerApprovedAt: new Date().toISOString(),
      managerApprovedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`
    };

    setLeaveRequests(prev => prev.map(l => l.id === id ? updated : l));

    addLog(
      `Approbation N+1 de la demande de congé ${req.requestNumber}`,
      `موافقة المسؤول المباشر على طلب الإجازة ${req.requestNumber}`,
      'leaves',
      `Transmis pour validation RH.`
    );

    addNotification(
      'EMP-004',
      `Demande de congé approuvée par N+1 (${req.requestNumber})`,
      `طلب إجازة معتمد من المسؤول المباشر (${req.requestNumber})`,
      `La demande de ${req.totalDays} j (${req.leaveType}) est validée par le manager et attend le visa RH.`,
      `طلب الإجازة (${req.requestNumber}) بانتظار مصادقة الموارد البشرية.`,
      'warning',
      'leaves'
    );
  };

  const validateLeaveByHR = (id: string) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    const updated = {
      ...req,
      status: 'validated_hr' as const,
      hrValidatedAt: new Date().toISOString(),
      hrValidatedBy: `${currentEmployee.firstName} ${currentEmployee.lastName}`
    };

    setLeaveRequests(prev => prev.map(l => l.id === id ? updated : l));

    // Deduct leave balance automatically if annual or recovery leave!
    if (req.leaveType === 'annual' || req.leaveType === 'recovery') {
      setEmployees(prev => prev.map(e => {
        if (e.id === req.employeeId) {
          const newRemaining = Math.max(0, e.remainingLeaveDays - req.totalDays);
          return { ...e, remainingLeaveDays: newRemaining };
        }
        return e;
      }));
    }

    addLog(
      `Validation RH et déduction du solde pour le congé ${req.requestNumber}`,
      `المصادقة النهائية للموارد البشرية وخصم رصيد الإجازة ${req.requestNumber}`,
      'leaves',
      `Déduction de ${req.totalDays} jour(s) du solde de l'employé.`
    );

    addNotification(
      req.employeeId,
      `Votre congé ${req.requestNumber} est accordé et validé !`,
      `تمت الموافقة والمصادقة على طلب إجازتك ${req.requestNumber} !`,
      `Votre absence du ${req.startDate} au ${req.endDate} (${req.totalDays} j) est officiellement enregistrée.`,
      `تم تسجيل إجازتك رسمياً من ${req.startDate} إلى ${req.endDate} (${req.totalDays} يوم).`,
      'success',
      'leaves'
    );
  };

  const rejectLeave = (id: string, reason: string) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    const updated = {
      ...req,
      status: 'rejected' as const,
      rejectionReason: reason
    };

    setLeaveRequests(prev => prev.map(l => l.id === id ? updated : l));

    addLog(
      `Refus de la demande de congé ${req.requestNumber}`,
      `رفض طلب الإجازة ${req.requestNumber}`,
      'leaves',
      `Motif: ${reason}`
    );

    addNotification(
      req.employeeId,
      `Demande de congé ${req.requestNumber} refusée`,
      `تم رفض طلب الإجازة ${req.requestNumber}`,
      `Motif : ${reason}`,
      `السبب : ${reason}`,
      'error',
      'leaves'
    );
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
  };

  // -------------------------------------------------------------
  // EMPLOYEES DIRECTORY
  // -------------------------------------------------------------
  const createEmployee = (data: Omit<Employee, 'id'>): Employee => {
    const count = employees.length + 1;
    const newEmp: Employee = {
      ...data,
      id: `EMP-${String(count).padStart(3, '0')}`,
      matricule: data.matricule || `RH-${String(count).padStart(3, '0')}`
    };

    setEmployees(prev => [...prev, newEmp]);

    addLog(
      `Ajout du collaborateur ${newEmp.firstName} ${newEmp.lastName} (${newEmp.matricule})`,
      `إضافة موظف جديد ${newEmp.firstNameAr || newEmp.firstName} ${newEmp.lastNameAr || newEmp.lastName}`,
      'employees',
      `Département: ${newEmp.department}, Poste: ${newEmp.position}`
    );

    return newEmp;
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    addLog(
      `Mise à jour du profil collaborateur (${id})`,
      `تحديث بيانات الموظف (${id})`,
      'employees',
      `Changements enregistrés.`
    );
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (emp) {
      addLog(
        `Suppression de la fiche collaborateur ${emp.firstName} ${emp.lastName} (${emp.matricule})`,
        `حذف ملف الموظف ${emp.firstNameAr || emp.firstName} ${emp.lastNameAr || emp.lastName}`,
        'employees',
        `Agent retiré de la base du personnel.`
      );
    }
  };

  // -------------------------------------------------------------
  // DEPARTMENTS & SERVICES DIRECTORY
  // -------------------------------------------------------------
  const createDepartment = (data: Omit<Department, 'id'> & { id?: string }): Department => {
    const rawCode = data.code?.trim() || data.name.trim().substring(0, 4).toUpperCase();
    const code = rawCode.toUpperCase();
    const id = data.id || code || `DEPT-${Date.now()}`;
    const newDept: Department = {
      id,
      code,
      name: data.name.trim(),
      nameAr: data.nameAr?.trim() || data.name.trim(),
      type: data.type || 'service',
      site: data.site || 'Nouadhibou',
      bap: data.bap || 'ADMIN',
      headEmployeeId: data.headEmployeeId || '',
      description: data.description || '',
      descriptionAr: data.descriptionAr || '',
      positions: data.positions || []
    };

    setDepartments(prev => {
      const exists = prev.some(d => d.id === newDept.id || d.code === newDept.code);
      if (exists) {
        return prev.map(d => (d.id === newDept.id || d.code === newDept.code) ? newDept : d);
      }
      return [...prev, newDept];
    });

    addLog(
      `Création de la structure / direction: ${newDept.name} (${newDept.code})`,
      `إنشاء مصلحة / إدارة جديدة: ${newDept.nameAr} (${newDept.code})`,
      'settings',
      `Site: ${newDept.site}, Branche: ${newDept.bap || 'N/A'}`
    );

    return newDept;
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    const existing = departments.find(d => d.id === id || d.code === id);
    if (!existing) return;

    const oldName = existing.name;
    const newName = data.name ? data.name.trim() : existing.name;
    const oldNameAr = existing.nameAr;
    const newNameAr = data.nameAr !== undefined ? data.nameAr.trim() : oldNameAr;
    const newSite = data.site !== undefined ? data.site : existing.site;

    setDepartments(prev => prev.map(d => (d.id === id || d.code === id) ? { ...d, ...data, name: newName, nameAr: newNameAr } : d));

    // Cascade update to employees if department name or site changed
    if (oldName !== newName || oldNameAr !== newNameAr || existing.site !== newSite) {
      setEmployees(prev => prev.map(emp => {
        if (emp.department === oldName) {
          return {
            ...emp,
            department: newName,
            departmentAr: newNameAr || emp.departmentAr,
            workSite: newSite || emp.workSite
          };
        }
        return emp;
      }));
    }

    addLog(
      `Mise à jour de la structure: ${newName} (${data.code || existing.code})`,
      `تحديث الهيكل الإداري: ${newNameAr || newName} (${data.code || existing.code})`,
      'settings',
      `Modifications enregistrées pour la structure.`
    );
  };

  const deleteDepartment = (id: string): { success: boolean; error?: string } => {
    const dept = departments.find(d => d.id === id || d.code === id);
    if (!dept) return { success: false, error: 'Structure introuvable.' };

    const assignedEmployees = employees.filter(e => e.department === dept.name);
    if (assignedEmployees.length > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette structure car ${assignedEmployees.length} collaborateur(s) y sont actuellement rattachés. Veuillez d'abord réaffecter ces agents.`
      };
    }

    setDepartments(prev => prev.filter(d => d.id !== id && d.code !== id));

    addLog(
      `Suppression de la structure: ${dept.name} (${dept.code})`,
      `حذف المصلحة / الإدارة: ${dept.nameAr || dept.name} (${dept.code})`,
      'settings',
      `Structure supprimée de l'organigramme.`
    );

    return { success: true };
  };

  // -------------------------------------------------------------
  // SETTINGS & BACKUP
  // -------------------------------------------------------------
  const updatePerDiemRates = (rates: PerDiemRate[]) => {
    setPerDiemRates(rates);
    addLog(
      `Mise à jour du barème des indemnités de mission`,
      `تحديث سلّم تعويضات مصاريف المهمة`,
      'settings',
      `Grades et indemnités révisés.`
    );
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    addLog(
      `Mise à jour des coordonnées et paramètres entreprise`,
      `تحديث بيانات وهوية الشركة`,
      'settings',
      `Raison sociale: ${settings.name}`
    );
  };

  const restoreDemoData = () => {
    setEmployees(initialEmployees);
    setDepartments(initialDepartments);
    setMissionOrders(initialMissionOrders);
    setExpenseClaims(initialExpenseClaims);
    setInternalMemos(initialInternalMemos);
    setLeaveRequests(initialLeaveRequests);
    setPerDiemRates(initialPerDiemRates);
    setCompanySettings(initialCompanySettings);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);

    addLog(
      `Restauration complète des données de démonstration`,
      `استعادة كامل البيانات التجريبية للنظام`,
      'settings',
      `Réinitialisation effectuée avec succès.`
    );
  };

  const reloadOfficialImropPersonnel = () => {
    setEmployees(initialEmployees);
    setDepartments(initialDepartments);
    try {
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(initialEmployees));
      localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(initialDepartments));
    } catch (e) {
      console.warn("Could not save employees to local storage", e);
    }
    addLog(
      `Rechargement de l'effectif officiel IMROP (${initialEmployees.length} agents)`,
      `إعادة تحميل القائمة الرسمية لعمال المعهد (${initialEmployees.length} موظف)`,
      'employees',
      `L'ensemble des ${initialEmployees.length} fiches du personnel et départements a été synchronisé.`
    );
  };

  const exportBackupJSON = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      companySettings,
      perDiemRates,
      departments,
      employees,
      missionOrders,
      expenseClaims,
      internalMemos,
      leaveRequests,
      auditLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `RH_Pro_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.departments) setDepartments(data.departments);
      if (data.employees) setEmployees(data.employees);
      if (data.missionOrders) setMissionOrders(data.missionOrders);
      if (data.expenseClaims) setExpenseClaims(data.expenseClaims);
      if (data.internalMemos) setInternalMemos(data.internalMemos);
      if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
      if (data.perDiemRates) setPerDiemRates(data.perDiemRates);
      if (data.companySettings) setCompanySettings(data.companySettings);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addLog(
        `Importation réussie d'une sauvegarde de données JSON`,
        `استيراد ناجح لملف النسخة الاحتياطية JSON`,
        'settings',
        `Données rechargées avec succès.`
      );
      return true;
    } catch (e) {
      console.error("Failed to import backup JSON", e);
      return false;
    }
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        language,
        setLanguage,
        t,
        userRole,
        setUserRole,
        currentEmployeeId,
        setCurrentEmployeeId,
        currentEmployee,
        activeTab,
        setActiveTab,
        departments,
        employees,
        missionOrders,
        expenseClaims,
        internalMemos,
        leaveRequests,
        perDiemRates,
        companySettings,
        auditLogs,
        notifications,
        createMissionOrder,
        updateMissionOrder,
        approveMissionByManager,
        validateMissionByHR,
        rejectMission,
        deleteMissionOrder,
        generateExpenseClaimFromMission,
        createExpenseClaim,
        updateExpenseClaim,
        approveExpenseByManager,
        validateExpenseByHR,
        rejectExpense,
        deleteExpenseClaim,
        createInternalMemo,
        acknowledgeMemo,
        deleteInternalMemo,
        createLeaveRequest,
        approveLeaveByManager,
        validateLeaveByHR,
        rejectLeave,
        deleteLeaveRequest,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        updatePerDiemRates,
        updateCompanySettings,
        restoreDemoData,
        reloadOfficialImropPersonnel,
        exportBackupJSON,
        importBackupJSON,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getEmployeeById,
        getPerDiemRateForGrade
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
