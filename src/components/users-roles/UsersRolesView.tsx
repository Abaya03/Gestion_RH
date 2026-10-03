import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, Employee, EmployeeGrade } from '../../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  KeyRound, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  UserCog, 
  Lock, 
  Unlock, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Building,
  Eye,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  X,
  UserPlus,
  AlertTriangle,
  Mail,
  Phone,
  Layers,
  Award
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const { 
    language, 
    t, 
    employees, 
    userRole, 
    setUserRole, 
    currentEmployeeId, 
    setCurrentEmployeeId, 
    currentEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedExistingEmpId, setSelectedExistingEmpId] = useState<string>('');
  const [creationMode, setCreationMode] = useState<'existing' | 'new'>('existing');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [deletingUser, setDeletingUser] = useState<Employee | null>(null);

  // Form State for Add User
  const [formUser, setFormUser] = useState<Partial<Employee> & { initialPassword?: string }>({
    matricule: '',
    civility: 'Monsieur',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    nni: '',
    email: '',
    phone: '+222 ',
    department: 'Direction Scientifique & Recherche',
    position: 'Responsable',
    grade: 'cadre',
    role: 'manager',
    managerId: '',
    isActive: true,
    initialPassword: 'Imrop' + new Date().getFullYear() + '@'
  });

  const isRtl = language === 'ar';

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingUser(null);
        setDeletingUser(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const handleOpenAdd = () => {
    setSelectedExistingEmpId('');
    setCreationMode('existing');
    const nextNum = String(employees.length + 1).padStart(3, '0');
    setFormUser({
      matricule: `IMROP-${nextNum}`,
      civility: 'Monsieur',
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      nni: '',
      email: '',
      phone: '+222 ',
      department: 'Direction Scientifique & Recherche',
      position: 'Responsable',
      grade: 'cadre',
      role: 'manager',
      managerId: '',
      isActive: true,
      initialPassword: 'Imrop' + new Date().getFullYear() + '@'
    });
    setShowAddModal(true);
  };

  const handleSelectExistingEmployee = (empId: string) => {
    setSelectedExistingEmpId(empId);
    if (!empId) return;
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setFormUser({
      matricule: emp.matricule,
      civility: emp.civility,
      firstName: emp.firstName,
      lastName: emp.lastName,
      firstNameAr: emp.firstNameAr || '',
      lastNameAr: emp.lastNameAr || '',
      nni: emp.nni || '',
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      grade: emp.grade,
      role: emp.role === 'hr_admin' ? 'hr_admin' : 'manager',
      managerId: emp.managerId || '',
      isActive: emp.isActive !== false,
      initialPassword: 'Imrop' + new Date().getFullYear() + '@'
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (creationMode === 'existing' && selectedExistingEmpId) {
      // Promote existing employee to Manager or Admin
      const emp = employees.find(e => e.id === selectedExistingEmpId);
      updateEmployee(selectedExistingEmpId, {
        role: (formUser.role as UserRole) || 'manager',
        managerId: formUser.managerId || undefined,
        isActive: formUser.isActive !== false
      });
      setShowAddModal(false);
      showNotification(`Accès attribué : ${emp?.firstName} ${emp?.lastName} a maintenant le rôle ${formUser.role === 'hr_admin' ? 'RH / Administrateur' : 'Responsable N+1'}.`);
      return;
    }

    if (!formUser.firstName || !formUser.lastName) return;

    const email = formUser.email || `${formUser.firstName.toLowerCase().replace(/\s+/g, '.')}.${formUser.lastName.toLowerCase().replace(/\s+/g, '')}@imrop.mr`;

    const newEmp: Omit<Employee, 'id'> = {
      matricule: formUser.matricule || `IMROP-${Date.now().toString().slice(-3)}`,
      civility: formUser.civility as any || 'Monsieur',
      firstName: formUser.firstName,
      lastName: formUser.lastName,
      firstNameAr: formUser.firstNameAr || undefined,
      lastNameAr: formUser.lastNameAr || undefined,
      nni: formUser.nni || undefined,
      email: email,
      phone: formUser.phone || '+222 45 00 00 00',
      department: formUser.department || 'Direction Scientifique & Recherche',
      position: formUser.position || 'Responsable',
      grade: (formUser.grade as EmployeeGrade) || 'cadre',
      role: formUser.role || 'manager',
      managerId: formUser.managerId || undefined,
      bankName: 'BCI',
      bankAccount: '',
      rib: '',
      hireDate: new Date().toISOString().slice(0, 10),
      annualLeaveEntitlement: 30,
      remainingLeaveDays: 30,
      isActive: formUser.isActive !== false,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`
    };

    createEmployee(newEmp);
    setShowAddModal(false);
    showNotification(`Compte d'accès créé avec succès pour ${formUser.firstName} ${formUser.lastName}.`);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingUser({ ...emp });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateEmployee(editingUser.id, editingUser);
    setEditingUser(null);
    showNotification(`Droits et paramètres de ${editingUser.firstName} ${editingUser.lastName} mis à jour.`);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentEmployeeId) {
      alert("Impossible de supprimer l'utilisateur actuellement connecté ! Veuillez d'abord basculer sur un autre profil.");
      setDeletingUser(null);
      return;
    }

    // Downgrade back to standard employee (removes them from privileged users list)
    updateEmployee(deletingUser.id, { role: 'employee' });
    showNotification(`Droits d'accès retirés pour ${deletingUser.firstName} ${deletingUser.lastName} (${deletingUser.matricule}).`);
    setDeletingUser(null);
  };

  const handleRoleChangeForEmployee = (empId: string, newRole: UserRole) => {
    updateEmployee(empId, { role: newRole });
    const emp = employees.find(e => e.id === empId);
    if (newRole === 'employee') {
      showNotification(`Accès révoqué pour ${emp?.firstName} ${emp?.lastName} (reclassé comme collaborateur standard).`);
    } else {
      showNotification(`Rôle de ${emp?.firstName} ${emp?.lastName} modifié en ${newRole === 'hr_admin' ? 'RH / Administrateur' : 'Responsable N+1'}.`);
    }
  };

  const handleManagerChange = (empId: string, newManagerId: string) => {
    updateEmployee(empId, { managerId: newManagerId || undefined });
    showNotification(`Responsable N+1 mis à jour avec succès.`);
  };

  const handleToggleActive = (empId: string, currentActive: boolean = true) => {
    updateEmployee(empId, { isActive: !currentActive });
    showNotification(`Statut du compte utilisateur mis à jour.`);
  };

  const handleSwitchSession = (emp: Employee) => {
    setCurrentEmployeeId(emp.id);
    if (emp.role) {
      setUserRole(emp.role);
    } else if (emp.grade === 'cadre_superieur') {
      setUserRole('hr_admin');
    } else if (emp.position.toLowerCase().includes('chef') || emp.position.toLowerCase().includes('directeur')) {
      setUserRole('manager');
    } else {
      setUserRole('employee');
    }
    showNotification(`Session basculée sur ${emp.firstName} ${emp.lastName} (${emp.matricule})`);
  };

  // Strictly filter out standard collaborateurs - only show users with application management roles (RH/Admin and Managers)
  const usersWithAccess = employees.filter(emp => {
    const empRole = emp.role || (emp.grade === 'cadre_superieur' ? 'hr_admin' : (emp.position.toLowerCase().includes('chef') || emp.position.toLowerCase().includes('directeur')) ? 'manager' : 'employee');
    return empRole === 'hr_admin' || empRole === 'manager';
  });

  const filteredUsers = usersWithAccess.filter(emp => {
    const s = searchTerm.toLowerCase();
    const matchSearch = 
      emp.firstName.toLowerCase().includes(s) ||
      emp.lastName.toLowerCase().includes(s) ||
      (emp.firstNameAr && emp.firstNameAr.includes(searchTerm)) ||
      (emp.lastNameAr && emp.lastNameAr.includes(searchTerm)) ||
      emp.matricule.toLowerCase().includes(s) ||
      (emp.nni && emp.nni.includes(searchTerm)) ||
      emp.email.toLowerCase().includes(s) ||
      emp.position.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s);

    const empRole = emp.role || (emp.grade === 'cadre_superieur' ? 'hr_admin' : (emp.position.toLowerCase().includes('chef') || emp.position.toLowerCase().includes('directeur')) ? 'manager' : 'employee');
    const matchRole = selectedRoleFilter === 'ALL' || empRole === selectedRoleFilter;
    const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
    const matchStatus = selectedStatusFilter === 'ALL' || 
      (selectedStatusFilter === 'active' && emp.isActive !== false) ||
      (selectedStatusFilter === 'inactive' && emp.isActive === false);

    return matchSearch && matchRole && matchDept && matchStatus;
  });

  // KPI calculations for privileged users with application access
  const totalPrivilegedUsers = usersWithAccess.length;
  const activePrivilegedUsers = usersWithAccess.filter(e => e.isActive !== false).length;
  const adminCount = usersWithAccess.filter(e => (e.role === 'hr_admin') || (!e.role && e.grade === 'cadre_superieur')).length;
  const managerCount = usersWithAccess.filter(e => (e.role === 'manager') || (!e.role && (e.position.toLowerCase().includes('chef') || e.position.toLowerCase().includes('directeur')) && e.grade !== 'cadre_superieur')).length;

  const permissionsMatrix = [
    {
      module: "1. Ordres de Mission",
      action: "Créer et soumettre un ordre de mission",
      employee: true,
      manager: true,
      hr_admin: true
    },
    {
      module: "1. Ordres de Mission",
      action: "Visa & Approbation hiérarchique (N+1)",
      employee: false,
      manager: true,
      hr_admin: true
    },
    {
      module: "1. Ordres de Mission",
      action: "Validation finale & Émission officielle RH",
      employee: false,
      manager: false,
      hr_admin: true
    },
    {
      module: "2. Frais de Mission (Décomptes)",
      action: "Générer un état de frais et liquidation",
      employee: true,
      manager: true,
      hr_admin: true
    },
    {
      module: "2. Frais de Mission (Décomptes)",
      action: "Visa N+1 sur l'état de frais",
      employee: false,
      manager: true,
      hr_admin: true
    },
    {
      module: "2. Frais de Mission (Décomptes)",
      action: "Liquidation, Bon à payer & Ordonnancement RH",
      employee: false,
      manager: false,
      hr_admin: true
    },
    {
      module: "3. Notes de Service",
      action: "Consulter et accuser réception (J'ai lu)",
      employee: true,
      manager: true,
      hr_admin: true
    },
    {
      module: "3. Notes de Service",
      action: "Rédiger et publier des Notes de Service",
      employee: false,
      manager: false,
      hr_admin: true
    },
    {
      module: "4. Gestion des Congés",
      action: "Soumettre une demande de congé",
      employee: true,
      manager: true,
      hr_admin: true
    },
    {
      module: "4. Gestion des Congés",
      action: "Avis & Approbation N+1 des congés",
      employee: false,
      manager: true,
      hr_admin: true
    },
    {
      module: "4. Gestion des Congés",
      action: "Validation finale RH & Décompte automatique",
      employee: false,
      manager: false,
      hr_admin: true
    },
    {
      module: "5. Gestion du Personnel",
      action: "Ajout, modification & suppression fiches personnel",
      employee: false,
      manager: false,
      hr_admin: true
    },
    {
      module: "6. Utilisateurs et rôles & Paramètres",
      action: "Attribution des rôles et barèmes généraux",
      employee: false,
      manager: false,
      hr_admin: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 end-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">
                {language === 'ar' ? 'المستخدمون والأدوار' : 'Utilisateurs et rôles'}
              </h1>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'إدارة حسابات الدخول، تعيين الأدوار والصلاحيات، إضافة وتعديل وحذف المستخدمين، ومحاكاة الجلسات'
                  : 'Gestion des comptes d\'accès, création/modification/suppression des utilisateurs, attribution des rôles et simulation de session'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Active User */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">Session :</span>
            <span className="font-extrabold text-slate-900">{currentEmployee.firstName} {currentEmployee.lastName}</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${userRole === 'hr_admin' ? 'bg-purple-100 text-purple-800' : userRole === 'manager' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
              {userRole === 'hr_admin' ? 'RH / Admin' : userRole === 'manager' ? 'Responsable N+1' : 'Collaborateur'}
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-100 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة مستخدم جديد' : 'Ajouter un utilisateur'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Comptes avec Accès</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPrivilegedUsers}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>{activePrivilegedUsers} actifs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>RH / Administrateurs</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{adminCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Accès & validation finale</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Responsables N+1</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{managerCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Visa hiérarchique</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Statut Sécurité</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{activePrivilegedUsers}/{totalPrivilegedUsers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Comptes opérationnels</div>
        </div>
      </div>

      {/* 2 System Roles with Administrative Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role 1: Responsable N+1 */}
        <div className={`p-4 rounded-2xl border transition-all ${userRole === 'manager' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900">Responsable Direct (N+1)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
              Visa 1er niveau
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Supervision hiérarchique et approbation préalable des membres de son équipe.
          </p>
          <ul className="text-[11px] text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Visa hiérarchique des ordres de mission</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Contrôle & visa des décomptes de frais</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Validation préalable des congés d'équipe</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Consultation du calendrier des absences</li>
          </ul>
        </div>

        {/* Role 2: RH / Admin */}
        <div className={`p-4 rounded-2xl border transition-all ${userRole === 'hr_admin' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900">RH / Administrateur</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
              Contrôle Total
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Validation finale officielle, liquidation comptable et administration générale.
          </p>
          <ul className="text-[11px] text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Validation finale & émission des OM officiels</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Liquidation, Bon à payer & Paiement des frais</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Validation RH & déduction solde congés</li>
            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Attribution des rôles et configuration système</li>
          </ul>
        </div>
      </div>

      {/* User Accounts & Assigned Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">Comptes Utilisateurs avec Droits d'Accès</h2>
            <p className="text-xs text-slate-500">Liste des utilisateurs autorisés (Responsables N+1 et Administrateurs RH)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher utilisateur..."
                className="w-full text-xs ps-8 pe-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Tous les rôles avec accès</option>
              <option value="manager">Responsable N+1</option>
              <option value="hr_admin">RH / Admin</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="active">Actif uniquement</option>
              <option value="inactive">Suspendu uniquement</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">Utilisateur & Matricule</th>
                <th className="p-3 text-start">Email / Identifiant</th>
                <th className="p-3 text-start">Rôle Système</th>
                <th className="p-3 text-start">Responsable (N+1)</th>
                <th className="p-3 text-start">Statut</th>
                <th className="p-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((emp) => {
                const currentRole = emp.role || (emp.grade === 'cadre_superieur' ? 'hr_admin' : (emp.position.toLowerCase().includes('chef') || emp.position.toLowerCase().includes('directeur')) ? 'manager' : 'employee');
                const isCurrentSession = emp.id === currentEmployeeId;

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50/70 transition-colors ${isCurrentSession ? 'bg-purple-50/40' : ''}`}>
                    {/* User Identity */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={emp.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80`} 
                          alt={emp.firstName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{emp.firstName} {emp.lastName}</span>
                            {emp.firstNameAr && (
                              <span className="text-[11px] font-medium text-slate-500">({emp.firstNameAr} {emp.lastNameAr})</span>
                            )}
                            {isCurrentSession && (
                              <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.2 rounded-full">
                                Actuel
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{emp.matricule} • {emp.position}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3 whitespace-nowrap font-mono text-slate-600">
                      {emp.email}
                    </td>

                    {/* Role Selector */}
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChangeForEmployee(emp.id, e.target.value as UserRole)}
                        className={`text-xs p-1.5 rounded-lg font-bold border ${currentRole === 'hr_admin' ? 'bg-purple-50 text-purple-800 border-purple-200' : currentRole === 'manager' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}
                      >
                        <option value="manager">Responsable N+1</option>
                        <option value="hr_admin">RH / Administrateur</option>
                        <option value="employee">Retirer l'accès privilégié</option>
                      </select>
                    </td>

                    {/* Manager N+1 Selector */}
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={emp.managerId || ''}
                        onChange={(e) => handleManagerChange(emp.id, e.target.value)}
                        className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium max-w-[180px]"
                      >
                        <option value="">Aucun (Direction Générale)</option>
                        {employees.filter(m => m.id !== emp.id).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} ({m.matricule})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Account Status */}
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(emp.id, emp.isActive !== false)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${emp.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
                      >
                        {emp.isActive !== false ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Suspendu</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit, Delete, Switch Session */}
                    <td className="p-3 whitespace-nowrap text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSwitchSession(emp)}
                          disabled={isCurrentSession}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${isCurrentSession ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                          title="Prendre cette session utilisateur"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">{isCurrentSession ? 'Session' : 'Simuler'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Modifier le compte utilisateur"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingUser(emp)}
                          disabled={isCurrentSession}
                          className={`p-1.5 rounded-lg transition-colors ${isCurrentSession ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'}`}
                          title={isCurrentSession ? "Session active non supprimable" : "Retirer les droits de cet utilisateur"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ajouter un nouvel utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">
                    {language === 'ar' ? 'إسناد دور وصول أو إضافة مستخدم' : 'Donner un Accès & Attribuer un Rôle'}
                  </h2>
                  <p className="text-xs text-slate-500">Attribuer des droits Responsable (N+1) ou Administrateur RH</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Creation mode selector: Existing employee or New account */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCreationMode('existing')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${creationMode === 'existing' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                1. Sélectionner un agent de l'IMROP
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('new')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${creationMode === 'new' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                2. Créer un nouvel utilisateur
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              {creationMode === 'existing' ? (
                <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <label className="block font-bold text-purple-900">
                    Sélectionner l'agent à promouvoir *
                  </label>
                  <select
                    value={selectedExistingEmpId}
                    onChange={(e) => handleSelectExistingEmployee(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Choisir un collaborateur dans l'annuaire IMROP --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.matricule} • {emp.firstName} {emp.lastName} — {emp.position} ({emp.department})
                      </option>
                    ))}
                  </select>
                  {selectedExistingEmpId && (
                    <p className="text-[11px] text-purple-700 font-medium">
                      Agent sélectionné : {formUser.firstName} {formUser.lastName} ({formUser.matricule}) • {formUser.position}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matricule IMROP *</label>
                  <input
                    type="text"
                    required
                    value={formUser.matricule}
                    onChange={(e) => setFormUser({ ...formUser, matricule: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    disabled={creationMode === 'existing'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle Système à Attribuer *</label>
                  <select
                    value={formUser.role}
                    onChange={(e) => setFormUser({ ...formUser, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900"
                  >
                    <option value="manager">Responsable Direct (N+1)</option>
                    <option value="hr_admin">RH / Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable N+1</label>
                  <select
                    value={formUser.managerId}
                    onChange={(e) => setFormUser({ ...formUser, managerId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="">Aucun (Direction Générale)</option>
                    {employees.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Names FR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom (Français) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mohamed Lemine"
                    value={formUser.firstName}
                    onChange={(e) => setFormUser({ ...formUser, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom (Français) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: OULD CHEIKH"
                    value={formUser.lastName}
                    onChange={(e) => setFormUser({ ...formUser, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  />
                </div>
              </div>

              {/* Names AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">الاسم الأول (بالعربية)</label>
                  <input
                    type="text"
                    placeholder="محمد الأمين"
                    value={formUser.firstNameAr}
                    onChange={(e) => setFormUser({ ...formUser, firstNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                    disabled={creationMode === 'existing'}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">اسم العائلة (بالعربية)</label>
                  <input
                    type="text"
                    placeholder="ولد الشيخ"
                    value={formUser.lastNameAr}
                    onChange={(e) => setFormUser({ ...formUser, lastNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                    disabled={creationMode === 'existing'}
                  />
                </div>
              </div>

              {/* Department, Position, Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département *</label>
                  <select
                    value={formUser.department}
                    onChange={(e) => setFormUser({ ...formUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  >
                    <option value="Direction Scientifique & Recherche">Direction Scientifique & Recherche</option>
                    <option value="Laboratoire d'Océanographie Physique & Biologie">Labo Océanographie & Biologie</option>
                    <option value="Service des Ressources Humaines (SRH)">Service des RH (SRH)</option>
                    <option value="Direction Générale">Direction Générale</option>
                    <option value="Agence Comptable & Finances">Agence Comptable & Finances</option>
                    <option value="Service Informatique & SI">Service Informatique & SI</option>
                    <option value="Service Logistique & Moyens Généraux">Logistique & Moyens Généraux</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fonction / Poste *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Responsable d'Équipe"
                    value={formUser.position}
                    onChange={(e) => setFormUser({ ...formUser, position: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade</label>
                  <select
                    value={formUser.grade}
                    onChange={(e) => setFormUser({ ...formUser, grade: e.target.value as EmployeeGrade })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    disabled={creationMode === 'existing'}
                  >
                    <option value="cadre_superieur">Cadre Supérieur / Directeur</option>
                    <option value="cadre">Cadre / Chercheur</option>
                    <option value="maitrise">Agent de Maîtrise / Technicien</option>
                    <option value="employe">Employé / Agent d'appui</option>
                  </select>
                </div>
              </div>

              {/* Contact & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Identifiant Pro) *</label>
                  <input
                    type="email"
                    placeholder="prenom.nom@imrop.mr"
                    value={formUser.email}
                    onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone (+222)</label>
                  <input
                    type="text"
                    value={formUser.phone}
                    onChange={(e) => setFormUser({ ...formUser, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    disabled={creationMode === 'existing'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NNI National (10 chiffres)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Ex: 2489201934"
                    value={formUser.nni}
                    onChange={(e) => setFormUser({ ...formUser, nni: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    disabled={creationMode === 'existing'}
                  />
                </div>
              </div>

              {/* Password simulation & Account status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div>
                  <label className="block font-bold text-purple-900 mb-1">Mot de passe d'initialisation</label>
                  <input
                    type="text"
                    value={formUser.initialPassword}
                    onChange={(e) => setFormUser({ ...formUser, initialPassword: e.target.value })}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl font-mono text-purple-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Statut initial du compte</label>
                  <select
                    value={formUser.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormUser({ ...formUser, isActive: e.target.value === 'active' })}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl font-bold"
                  >
                    <option value="active">Actif (Accès autorisé)</option>
                    <option value="inactive">Suspendu (Accès bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-sm shadow-purple-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{creationMode === 'existing' ? 'Attribuer le rôle' : "Enregistrer l'utilisateur"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier un utilisateur */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">
                    {language === 'ar' ? 'تعديل بيانات المستخدم والدور' : 'Modifier le Compte & les Droits d\'Accès'}
                  </h2>
                  <p className="text-xs text-slate-500">{editingUser.matricule} • {editingUser.firstName} {editingUser.lastName}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matricule</label>
                  <input
                    type="text"
                    required
                    value={editingUser.matricule}
                    onChange={(e) => setEditingUser({ ...editingUser, matricule: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle Système *</label>
                  <select
                    value={editingUser.role || 'employee'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900"
                  >
                    <option value="manager">Responsable Direct (N+1)</option>
                    <option value="hr_admin">RH / Administrateur</option>
                    <option value="employee">Retirer l'accès privilégié (Collaborateur)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable N+1</label>
                  <select
                    value={editingUser.managerId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, managerId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="">Aucun (Direction Générale)</option>
                    {employees.filter(m => m.id !== editingUser.id).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Names FR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom (Français)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom (Français)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Names AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">الاسم الأول (بالعربية)</label>
                  <input
                    type="text"
                    value={editingUser.firstNameAr || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, firstNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">اسم العائلة (بالعربية)</label>
                  <input
                    type="text"
                    value={editingUser.lastNameAr || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, lastNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                  />
                </div>
              </div>

              {/* Department, Position, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Direction Scientifique & Recherche">Direction Scientifique & Recherche</option>
                    <option value="Laboratoire d'Océanographie Physique & Biologie">Labo Océanographie & Biologie</option>
                    <option value="Service des Ressources Humaines (SRH)">Service des RH (SRH)</option>
                    <option value="Direction Générale">Direction Générale</option>
                    <option value="Agence Comptable & Finances">Agence Comptable & Finances</option>
                    <option value="Service Informatique & SI">Service Informatique & SI</option>
                    <option value="Service Logistique & Moyens Généraux">Logistique & Moyens Généraux</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fonction / Poste</label>
                  <input
                    type="text"
                    required
                    value={editingUser.position}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut du Compte</label>
                  <select
                    value={editingUser.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="active">Actif (Accès autorisé)</option>
                    <option value="inactive">Suspendu (Accès révoqué)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email / Identifiant</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NNI National</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editingUser.nni || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, nni: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-sm shadow-purple-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmation de Suppression */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'ar' ? 'تأكيد حذف المستخدم' : 'Supprimer le compte utilisateur ?'}
                </h3>
                <p className="text-xs text-slate-500">Cette action est irréversible.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div><strong>Utilisateur :</strong> {deletingUser.firstName} {deletingUser.lastName}</div>
              <div><strong>Matricule :</strong> {deletingUser.matricule}</div>
              <div><strong>Email :</strong> {deletingUser.email}</div>
              <div><strong>Rôle :</strong> {deletingUser.role || 'employee'}</div>
            </div>

            <p className="text-xs text-slate-600">
              Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur du système d'accès RH Pro ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions & Security RACI Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
        <div>
          <h2 className="font-extrabold text-base text-slate-900">Matrice des Droits & Privilèges (RACI)</h2>
          <p className="text-xs text-slate-500">Cartographie officielle des droits d'accès par rôle pour chaque fonctionnalité du système</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">Module</th>
                <th className="p-3 text-start">Opération / Privilège</th>
                <th className="p-3 text-center">Collaborateur</th>
                <th className="p-3 text-center">Responsable N+1</th>
                <th className="p-3 text-center">RH / Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{item.module}</td>
                  <td className="p-3 text-slate-700">{item.action}</td>
                  <td className="p-3 text-center">
                    {item.employee ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.manager ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.hr_admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
