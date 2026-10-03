import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeGrade, Department } from '../../types';
import { DepartmentModal } from './DepartmentModal';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  CreditCard, 
  UserCheck, 
  X, 
  Check, 
  Edit3, 
  Trash2,
  FileText,
  Compass,
  Calendar,
  Eye,
  Download,
  Printer,
  Shield,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MapPin,
  Briefcase,
  Hash
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface PersonnelManagementViewProps {
  onOpenNewMissionWithEmployee?: (employeeId: string) => void;
}

const MAURITANIAN_BANKS = [
  { name: "BMCI", code: "00012", prefix: "162" },
  { name: "BPM", code: "00020", prefix: "100" },
  { name: "BNM", code: "00014", prefix: "028" },
  { name: "SGM", code: "00018", prefix: "010" },
  { name: "BAMIS", code: "00015", prefix: "034" },
  { name: "BCI", code: "00011", prefix: "089" },
  { name: "BIM", code: "00022", prefix: "045" },
  { name: "Attijariwafa Bank", code: "00016", prefix: "056" },
  { name: "Chinguetti Bank", code: "00017", prefix: "067" },
  { name: "Orabank", code: "00019", prefix: "078" },
  { name: "CDD", code: "00025", prefix: "095" },
  { name: "IB Bank", code: "00026", prefix: "099" },
  { name: "Autre", code: "00000", prefix: "000" }
];

export const PersonnelManagementView: React.FC<PersonnelManagementViewProps> = ({
  onOpenNewMissionWithEmployee
}) => {
  const { 
    language, 
    t, 
    departments: orgDepartments,
    employees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    reloadOfficialImropPersonnel,
    missionOrders,
    leaveRequests,
    companySettings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'departments'>('grid');
  const [pageSize, setPageSize] = useState<number | 'all'>(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [inspectingEmployee, setInspectingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deptDeleteError, setDeptDeleteError] = useState<string | null>(null);

  // New Employee Form State
  const [formEmp, setFormEmp] = useState<Partial<Employee>>({
    matricule: '',
    civility: 'Monsieur',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    nni: '',
    email: '',
    phone: '+222 ',
    department: 'Direction Scientifique et de la Recherche (DSR)',
    departmentAr: 'الإدارة العلمية والبحوث',
    position: 'Chercheur',
    positionAr: 'باحث',
    grade: 'cadre',
    bankName: 'BMCI',
    bankAccount: '',
    rib: '',
    hireDate: new Date().toISOString().slice(0, 10),
    annualLeaveEntitlement: 30,
    remainingLeaveDays: 30,
    workSite: 'Nouadhibou',
    contractType: 'Fonctionnaire',
    role: 'employee',
    isActive: true
  });

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingEmployee(null);
        setInspectingEmployee(null);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
  const banks = Array.from(new Set(employees.map(e => e.bankName).filter(Boolean)));

  // Calculate status for each employee (on mission, on leave, active)
  const getEmployeeLiveStatus = (empId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const activeMission = missionOrders.find(
      m => m.employeeId === empId && 
      (m.status === 'validated_hr' || m.status === 'approved_manager') &&
      m.departureDate <= today && 
      (m.returnDate >= today || !m.returnDate)
    );
    if (activeMission) return { label: 'En Mission', labelAr: 'في مهمة', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };

    const activeLeave = leaveRequests.find(
      l => l.employeeId === empId &&
      l.status === 'validated_hr' &&
      l.startDate <= today &&
      l.endDate >= today
    );
    if (activeLeave) return { label: 'En Congé', labelAr: 'في إجازة', color: 'bg-amber-50 text-amber-700 border-amber-200' };

    return { label: 'En Service', labelAr: 'في الخدمة', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const s = searchTerm.toLowerCase();
    const matchSearch = 
      emp.firstName.toLowerCase().includes(s) ||
      emp.lastName.toLowerCase().includes(s) ||
      (emp.firstNameAr && emp.firstNameAr.includes(searchTerm)) ||
      (emp.lastNameAr && emp.lastNameAr.includes(searchTerm)) ||
      emp.matricule.toLowerCase().includes(s) ||
      (emp.nni && emp.nni.includes(searchTerm)) ||
      emp.position.toLowerCase().includes(s) ||
      (emp.positionAr && emp.positionAr.includes(searchTerm)) ||
      emp.email.toLowerCase().includes(s) ||
      emp.phone.includes(searchTerm) ||
      (emp.bankAccount && emp.bankAccount.includes(searchTerm)) ||
      (emp.bankName && emp.bankName.toLowerCase().includes(s));

    const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchGrade = selectedGrade === 'ALL' || emp.grade === selectedGrade;
    const matchBank = selectedBank === 'ALL' || emp.bankName === selectedBank;

    const liveStatus = getEmployeeLiveStatus(emp.id);
    const matchStatus = 
      selectedStatus === 'ALL' || 
      (selectedStatus === 'mission' && liveStatus.label === 'En Mission') ||
      (selectedStatus === 'leave' && liveStatus.label === 'En Congé') ||
      (selectedStatus === 'active' && liveStatus.label === 'En Service');

    return matchSearch && matchDept && matchGrade && matchBank && matchStatus;
  });

  // Reset page to 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept, selectedGrade, selectedStatus, selectedBank, pageSize]);

  const totalFiltered = filteredEmployees.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalFiltered / Number(pageSize)));
  const displayedEmployees = pageSize === 'all' 
    ? filteredEmployees 
    : filteredEmployees.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const handleReloadOfficial = () => {
    reloadOfficialImropPersonnel();
    setSyncFeedback(`Effectif officiel complet (${employees.length} collaborateurs IMROP) rechargé et synchronisé.`);
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4000);
  };

  // KPI Stats
  const totalCount = employees.length;
  const cadresSupCount = employees.filter(e => e.grade === 'cadre_superieur' || e.grade === 'cadre_sup').length;
  const cadresCount = employees.filter(e => e.grade === 'cadre').length;
  const maitriseCount = employees.filter(e => e.grade === 'maitrise' || e.grade === 'agent_maitrise').length;
  const employesCount = employees.filter(e => e.grade === 'employe').length;

  const handleOpenAdd = () => {
    const nextMatriculeNum = String(employees.length + 1).padStart(3, '0');
    setFormEmp({
      matricule: `704${nextMatriculeNum}X`,
      civility: 'Monsieur',
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      nni: '',
      email: '',
      phone: '+222 ',
      department: 'Direction Scientifique et de la Recherche (DSR)',
      departmentAr: 'الإدارة العلمية والبحوث',
      position: 'Chercheur Halieute',
      positionAr: 'باحث في المصايد',
      grade: 'cadre',
      bankName: 'BMCI',
      bankAccount: '',
      rib: '',
      workSite: 'Nouadhibou',
      contractType: 'Fonctionnaire',
      hireDate: new Date().toISOString().slice(0, 10),
      annualLeaveEntitlement: 30,
      remainingLeaveDays: 30,
      role: 'employee',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmp.firstName || !formEmp.lastName || !formEmp.matricule) return;

    createEmployee({
      matricule: formEmp.matricule,
      civility: formEmp.civility || 'Monsieur',
      firstName: formEmp.firstName,
      lastName: formEmp.lastName,
      firstNameAr: formEmp.firstNameAr || '',
      lastNameAr: formEmp.lastNameAr || '',
      nni: formEmp.nni || '',
      email: formEmp.email || `${formEmp.firstName?.toLowerCase().charAt(0)}.${formEmp.lastName?.toLowerCase().replace(/\s+/g, '')}@imrop.mr`,
      phone: formEmp.phone || '+222 ',
      department: formEmp.department || 'Direction Scientifique et de la Recherche (DSR)',
      departmentAr: formEmp.departmentAr || '',
      position: formEmp.position || 'Agent IMROP',
      positionAr: formEmp.positionAr || '',
      grade: formEmp.grade || 'cadre',
      bankName: formEmp.bankName || 'BMCI',
      bankAccount: formEmp.bankAccount || '',
      rib: formEmp.rib || '',
      workSite: formEmp.workSite || 'Nouadhibou',
      contractType: formEmp.contractType || 'Fonctionnaire',
      hireDate: formEmp.hireDate || new Date().toISOString().slice(0, 10),
      annualLeaveEntitlement: formEmp.annualLeaveEntitlement || 30,
      remainingLeaveDays: formEmp.remainingLeaveDays ?? 30,
      role: formEmp.role || 'employee',
      isActive: true
    });

    setShowAddModal(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, editingEmployee);
    setEditingEmployee(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteEmployee(deletingId);
      setDeletingId(null);
    }
  };

  const gradeLabels: Record<string, { fr: string; ar: string; color: string }> = {
    cadre_superieur: { fr: 'Cadre Supérieur', ar: 'إطار عالي', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    cadre_sup: { fr: 'Cadre Supérieur', ar: 'إطار عالي', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    cadre: { fr: 'Cadre / Chercheur', ar: 'إطار / باحث', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    maitrise: { fr: 'Agent de Maîtrise', ar: 'وكيل تحكم / تقني', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    agent_maitrise: { fr: 'Agent de Maîtrise', ar: 'وكيل تحكم / تقني', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    employe: { fr: 'Employé d\'appui', ar: 'عامل دعم', color: 'bg-slate-100 text-slate-800 border-slate-200' }
  };

  // Export to Excel with complete fields
  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map((emp, index) => ({
      "N°": index + 1,
      "Matricule": emp.matricule,
      "Civilité": emp.civility || "M.",
      "Prénom (FR)": emp.firstName,
      "Nom (FR)": emp.lastName,
      "الاسم الكامل (عربي)": `${emp.firstNameAr || ''} ${emp.lastNameAr || ''}`.trim(),
      "NNI": emp.nni || "",
      "Département / Direction": emp.department,
      "الإدارة / المصلحة": emp.departmentAr || "",
      "Poste / Fonction": emp.position,
      "الوظيفة": emp.positionAr || "",
      "Grade": gradeLabels[emp.grade]?.fr || emp.grade,
      "Site d'affectation": emp.workSite || "Nouadhibou",
      "Type Contrat": emp.contractType || "Fonctionnaire",
      "Banque": emp.bankName || "",
      "N° Compte Bancaire": emp.bankAccount || "",
      "Clé RIB": emp.rib || "",
      "Téléphone": emp.phone,
      "Email": emp.email,
      "Date d'embauche": emp.hireDate || "",
      "Solde Congés (j)": emp.remainingLeaveDays,
      "Statut actuel": getEmployeeLiveStatus(emp.id).label
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Effectif IMROP");
    
    // Auto-fit column widths
    const max_width = dataToExport.reduce((w, r) => Math.max(w, (r["Prénom (FR)"] + " " + r["Nom (FR)"]).length), 15);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 8 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 14 },
      { wch: 36 },
      { wch: 28 },
      { wch: 30 },
      { wch: 26 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 26 },
      { wch: 16 },
      { wch: 24 },
      { wch: 14 },
      { wch: 10 },
      { wch: 14 }
    ];

    XLSX.writeFile(workbook, `Effectif_Personnel_IMROP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Department Handlers
  const handleOpenAddDept = () => {
    setEditingDepartment(null);
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDepartment(dept);
    setShowDeptModal(true);
  };

  const handleSaveDepartment = (deptData: Omit<Department, 'id'> & { id?: string }) => {
    if (deptData.id) {
      updateDepartment(deptData.id, deptData);
      setSyncFeedback(`La structure "${deptData.name}" (${deptData.code}) a été mise à jour avec succès.`);
    } else {
      const created = createDepartment(deptData);
      setSyncFeedback(`Nouvelle structure "${created.name}" (${created.code}) créée avec succès.`);
    }
  };

  const handleConfirmDeleteDept = () => {
    if (!deletingDept) return;
    const res = deleteDepartment(deletingDept.id);
    if (!res.success) {
      setDeptDeleteError(res.error || 'Erreur lors de la suppression.');
    } else {
      setSyncFeedback(`La structure "${deletingDept.name}" (${deletingDept.code}) a été supprimée.`);
      setDeletingDept(null);
      setDeptDeleteError(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Effectif & Répertoire du Personnel
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
              {employees.length} Agents
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
              {orgDepartments.length} Structures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institut Mauritanien de Recherches Océanographiques et des Pêches (IMROP)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleReloadOfficial}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Recharger et synchroniser la totalité des agents officiels IMROP"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recharger ({employees.length})</span>
          </button>

          <button
            onClick={handleOpenAddDept}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Créer une nouvelle direction, laboratoire ou service"
          >
            <Building className="w-3.5 h-3.5 text-indigo-300" />
            <span>Nouvelle Structure</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Agent</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cadres Supérieurs</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              CS
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{cadresSupCount}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Direction & Chercheurs seniors</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cadres / Chercheurs</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              C
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{cadresCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Scientifiques & Ingénieurs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Agents de Maîtrise</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              AM
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{maitriseCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Techniciens & Observateurs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Agents d'Appui</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              EA
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{employesCount}</p>
          <span className="text-[11px] text-slate-600 font-semibold">Matelots, Chauffeurs, Sécurité</span>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par Nom, Prénom, Matricule, NNI, Téléphone, Compte Bancaire, Poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tableau / RIB</span>
            </button>

            <button
              onClick={() => setViewMode('departments')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'departments' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Directions & Services ({orgDepartments.length})</span>
            </button>
          </div>
        </div>

        {/* Detailed Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
            >
              <option value="ALL">Toutes les Structures ({employees.length} agents)</option>
              {orgDepartments.map((dept) => {
                const count = employees.filter(e => e.department === dept.name).length;
                return (
                  <option key={dept.id || dept.code} value={dept.name}>
                    {dept.code ? `[${dept.code}] ` : ''}{dept.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tous les Statuts & Grades</option>
              <option value="cadre_superieur">Cadres Supérieurs ({cadresSupCount})</option>
              <option value="cadre">Cadres / Chercheurs ({cadresCount})</option>
              <option value="maitrise">Agents de Maîtrise ({maitriseCount})</option>
              <option value="employe">Employés d'appui ({employesCount})</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div className="flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Toutes les Banques ({banks.length})</option>
              {banks.map((b) => {
                const bCount = employees.filter(e => e.bankName === b).length;
                return (
                  <option key={b} value={b}>
                    {b} ({bCount} comptes)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tous les Statuts Actuels</option>
              <option value="active">En Service</option>
              <option value="mission">En Mission Officielle</option>
              <option value="leave">En Congé Annuel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Departments Overview Mode */}
      {viewMode === 'departments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Organigramme : Directions, Laboratoires & Services de l'IMROP ({orgDepartments.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Structures organiques actives avec effectifs rattachés ({employees.length} collaborateurs)
              </p>
            </div>

            <button
              onClick={handleOpenAddDept}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgDepartments.map((dept) => {
              const deptEmployees = employees.filter(e => e.department === dept.name);
              const assignedHead = dept.headEmployeeId ? employees.find(e => e.id === dept.headEmployeeId) : null;
              const deptLeader = assignedHead || deptEmployees.find(e => e.grade === 'cadre_superieur' || e.role === 'manager' || e.role === 'hr_admin') || deptEmployees[0];

              return (
                <div 
                  key={dept.id || dept.code} 
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-black text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                          {dept.code}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                            {dept.type === 'direction' ? 'Direction Centrale' : 
                             dept.type === 'laboratoire' ? 'Laboratoire de Recherche' : 
                             dept.type === 'centre' ? 'Centre Régional' : 
                             dept.type === 'station' ? 'Station de Recherche' : 
                             dept.bap === 'SCIEN' ? 'Direction Scientifique' : 
                             dept.bap === 'NAVAL' ? 'Flotte & Moyens Maritimes' : 'Service Administratif'}
                          </span>
                          <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                            {dept.name}
                          </h3>
                        </div>
                      </div>

                      {/* Quick Edit & Delete Actions */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditDept(dept)}
                          title="Modifier cette structure"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingDept(dept);
                            setDeptDeleteError(null);
                          }}
                          title="Supprimer cette structure"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {dept.nameAr && (
                      <p className="text-xs text-slate-500 font-bold text-right" dir="rtl">
                        {dept.nameAr}
                      </p>
                    )}

                    {dept.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        "{dept.description}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Site : <strong>{dept.site || 'Nouadhibou'}</strong></span>
                    </div>

                    {deptLeader && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                          <span>Responsable :</span>
                          {assignedHead && (
                            <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Désigné</span>
                          )}
                        </span>
                        <div className="font-bold text-slate-900">
                          {deptLeader.firstName} {deptLeader.lastName} ({deptLeader.matricule})
                        </div>
                        <div className="text-slate-500 text-[10px] truncate">
                          {deptLeader.position}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {deptEmployees.length} collaborateurs
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => {
                          setSelectedDept(dept.name);
                          setViewMode('table');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Voir effectif</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content: Cards View or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedEmployees.map((emp) => {
            const liveStatus = getEmployeeLiveStatus(emp.id);
            const gradeInfo = gradeLabels[emp.grade] || gradeLabels.cadre;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all space-y-3 relative group"
              >
                {/* Card Top: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img 
                      src={emp.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`} 
                      alt={emp.firstName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {emp.matricule}
                        </span>
                      </div>

                      {emp.firstNameAr && (
                        <p className="text-[11px] font-semibold text-slate-500">
                          {emp.firstNameAr} {emp.lastNameAr}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                        {emp.position}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${liveStatus.color} shrink-0`}>
                    {liveStatus.label}
                  </span>
                </div>

                {/* Badges: Department & Grade */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[170px]">{emp.department}</span>
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${gradeInfo.color}`}>
                    {gradeInfo.fr}
                  </span>
                </div>

                {/* Contact & Banking info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl text-slate-600">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">Banque / Compte</span>
                    <span className="font-bold text-slate-800">{emp.bankName || 'BCI'}</span> : <span className="font-mono">{emp.bankAccount || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Solde Congés</span>
                    <span className="font-bold text-indigo-700">{emp.remainingLeaveDays} jours</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                    {emp.nni && (
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">NNI: {emp.nni}</span>
                    )}
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1">
                    {onOpenNewMissionWithEmployee && (
                      <button
                        onClick={() => onOpenNewMissionWithEmployee(emp.id)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Créer un Ordre de Mission"
                      >
                        <Compass className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setInspectingEmployee(emp)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Consulter le dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Modifier les informations"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(emp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-start">Agent / Matricule</th>
                  <th className="p-3.5 text-start">Département & Fonction</th>
                  <th className="p-3.5 text-start">Grade</th>
                  <th className="p-3.5 text-start">NNI</th>
                  <th className="p-3.5 text-start">Banque & Compte</th>
                  <th className="p-3.5 text-start">Relevé RIB</th>
                  <th className="p-3.5 text-start">Solde Congés</th>
                  <th className="p-3.5 text-start">Statut</th>
                  <th className="p-3.5 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedEmployees.map((emp) => {
                  const liveStatus = getEmployeeLiveStatus(emp.id);
                  const gradeInfo = gradeLabels[emp.grade] || gradeLabels.cadre;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={emp.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`} 
                            alt={emp.firstName}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200" 
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                              {emp.matricule}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{emp.position}</div>
                        <div className="text-[11px] text-slate-500">{emp.department}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${gradeInfo.color}`}>
                          {gradeInfo.fr}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono text-slate-700">
                        {emp.nni || '-'}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-[11px]">
                        <span className="font-bold text-slate-800">{emp.bankName || 'BCI'}</span>
                        <span className="text-slate-600 block font-mono font-bold">{emp.bankAccount || '-'}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-[10px] font-mono text-slate-500">
                        {emp.rib || `${emp.bankName || 'BMCI'}-${emp.bankAccount || '---'}`}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {emp.remainingLeaveDays} j
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${liveStatus.color}`}>
                          {liveStatus.label}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-end">
                        <div className="flex items-center justify-end gap-1">
                          {onOpenNewMissionWithEmployee && (
                            <button
                              onClick={() => onOpenNewMissionWithEmployee(emp.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              title="Créer un Ordre de Mission pour cet agent"
                            >
                              <Compass className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setInspectingEmployee(emp)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Voir le dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier les coordonnées et compte"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
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
      ) : null}

      {/* Pagination Controls */}
      {totalFiltered > 0 && viewMode !== 'departments' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>
              Affichage de <strong className="text-slate-900 font-bold">{pageSize === 'all' ? 1 : ((currentPage - 1) * Number(pageSize)) + 1}</strong> à <strong className="text-slate-900 font-bold">{pageSize === 'all' ? totalFiltered : Math.min(currentPage * Number(pageSize), totalFiltered)}</strong> sur <strong className="text-slate-900 font-bold">{totalFiltered}</strong> agents (Effectif total IMROP : {employees.length})
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-[11px] font-medium">Par page :</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setPageSize(val);
                }}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
                <option value="all">Tous ({employees.length})</option>
              </select>
            </div>

            {pageSize !== 'all' && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={page}>
                          {prev && page - prev > 1 && (
                            <span className="px-1 text-slate-400">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  title="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Fiche Dossier Individuel du Personnel */}
      {inspectingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">Dossier Individuel du Personnel</h2>
                  <span className="text-xs text-indigo-600 font-bold">{inspectingEmployee.matricule} • IMROP</span>
                </div>
              </div>

              <button
                onClick={() => setInspectingEmployee(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img 
                src={inspectingEmployee.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120`} 
                alt={inspectingEmployee.firstName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0" 
              />
              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900 leading-snug">
                  {inspectingEmployee.civility === 'Madame' ? 'Mme.' : 'M.'} {inspectingEmployee.firstName} {inspectingEmployee.lastName}
                </h3>
                {inspectingEmployee.firstNameAr && (
                  <p className="text-xs font-bold text-slate-500">
                    {inspectingEmployee.firstNameAr} {inspectingEmployee.lastNameAr}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {inspectingEmployee.position}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold">
                    {inspectingEmployee.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Administrative Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Identité & Contact</span>
                <div className="space-y-1 text-slate-700">
                  <div><strong>NNI National :</strong> <span className="font-mono font-bold">{inspectingEmployee.nni || 'N/A'}</span></div>
                  <div><strong>Email Pro :</strong> <span className="text-indigo-600">{inspectingEmployee.email}</span></div>
                  <div><strong>Téléphone :</strong> {inspectingEmployee.phone}</div>
                  <div><strong>Date d'embauche :</strong> {inspectingEmployee.hireDate || 'Non spécifiée'}</div>
                  <div><strong>Lieu d'affectation :</strong> {inspectingEmployee.workSite || 'Nouadhibou'}</div>
                  <div><strong>Type de contrat :</strong> {inspectingEmployee.contractType || 'Fonctionnaire'}</div>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rémunération & Banque</span>
                <div className="space-y-1 text-slate-700">
                  <div><strong>Grade :</strong> {gradeLabels[inspectingEmployee.grade]?.fr || inspectingEmployee.grade}</div>
                  <div><strong>Établissement Bancaire :</strong> <span className="font-bold text-slate-900">{inspectingEmployee.bankName || 'BMCI'}</span></div>
                  <div><strong>N° Compte :</strong> <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{inspectingEmployee.bankAccount || 'N/A'}</span></div>
                  <div><strong>Relevé RIB :</strong> <span className="font-mono text-[11px] block text-slate-600 pt-0.5">{inspectingEmployee.rib || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            {/* Missions & Leaves History for this employee */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Historique d'activité de l'agent</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Missions Récentes</span>
                  </div>
                  {missionOrders.filter(m => m.employeeId === inspectingEmployee.id).length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {missionOrders.filter(m => m.employeeId === inspectingEmployee.id).slice(0, 3).map(m => (
                        <li key={m.id} className="flex items-center justify-between">
                          <span>{m.orderNumber} ({m.destination})</span>
                          <span className="font-semibold">{m.departureDate}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Aucune mission enregistrée</span>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Congés & Absences</span>
                  </div>
                  <div className="text-[11px] text-slate-700 mb-1">
                    Solde restant : <strong>{inspectingEmployee.remainingLeaveDays} jours</strong>
                  </div>
                  {leaveRequests.filter(l => l.employeeId === inspectingEmployee.id).length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {leaveRequests.filter(l => l.employeeId === inspectingEmployee.id).slice(0, 2).map(l => (
                        <li key={l.id} className="flex items-center justify-between">
                          <span>{l.requestNumber} ({l.totalDays}j)</span>
                          <span className="font-semibold">{l.startDate}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Aucun congé récent</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
              {onOpenNewMissionWithEmployee && (
                <button
                  onClick={() => {
                    const empId = inspectingEmployee.id;
                    setInspectingEmployee(null);
                    onOpenNewMissionWithEmployee(empId);
                  }}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Compass className="w-4 h-4" />
                  <span>Émettre un Ordre de Mission</span>
                </button>
              )}

              <button
                onClick={() => {
                  const toEdit = { ...inspectingEmployee };
                  setInspectingEmployee(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier le dossier / Compte</span>
              </button>

              <button
                onClick={() => setInspectingEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nouveau Collaborateur / Personnel */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">Ajouter un Nouveau Personnel</h2>
                  <p className="text-xs text-slate-500">Création de la fiche administrative, affectation et coordonnées bancaires</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matricule IMROP *</label>
                  <input
                    type="text"
                    required
                    value={formEmp.matricule}
                    onChange={(e) => setFormEmp({ ...formEmp, matricule: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Civilité</label>
                  <select
                    value={formEmp.civility}
                    onChange={(e) => setFormEmp({ ...formEmp, civility: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Monsieur">Monsieur</option>
                    <option value="Madame">Madame</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NNI National (10 chiffres)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Ex: 1978201934"
                    value={formEmp.nni}
                    onChange={(e) => setFormEmp({ ...formEmp, nni: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Noms FR & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom (Français) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mohamed Salem"
                    value={formEmp.firstName}
                    onChange={(e) => setFormEmp({ ...formEmp, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom (Français) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: OULD VALL"
                    value={formEmp.lastName}
                    onChange={(e) => setFormEmp({ ...formEmp, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">الاسم الأول (بالعربية)</label>
                  <input
                    type="text"
                    placeholder="محمد سالم"
                    value={formEmp.firstNameAr}
                    onChange={(e) => setFormEmp({ ...formEmp, firstNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">اسم العائلة (بالعربية)</label>
                  <input
                    type="text"
                    placeholder="ولد فال"
                    value={formEmp.lastNameAr}
                    onChange={(e) => setFormEmp({ ...formEmp, lastNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right"
                  />
                </div>
              </div>

              {/* Department, Position, Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département / Direction *</label>
                  <select
                    value={formEmp.department}
                    onChange={(e) => {
                      const found = orgDepartments.find(d => d.name === e.target.value);
                      setFormEmp({ 
                        ...formEmp, 
                        department: e.target.value,
                        departmentAr: found?.nameAr || formEmp.departmentAr,
                        workSite: found?.site || formEmp.workSite
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {orgDepartments.map((d) => (
                      <option key={d.id || d.code} value={d.name}>{d.code ? `[${d.code}] ` : ''}{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fonction / Poste *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chercheur Biologiste"
                    value={formEmp.position}
                    onChange={(e) => setFormEmp({ ...formEmp, position: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade / Statut *</label>
                  <select
                    value={formEmp.grade}
                    onChange={(e) => setFormEmp({ ...formEmp, grade: e.target.value as EmployeeGrade })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="cadre_superieur">Cadre Supérieur / Directeur</option>
                    <option value="cadre">Cadre / Chercheur</option>
                    <option value="maitrise">Agent de Maîtrise / Technicien</option>
                    <option value="employe">Employé / Agent d'appui</option>
                  </select>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banque (Mauritanie)</label>
                  <select
                    value={formEmp.bankName}
                    onChange={(e) => setFormEmp({ ...formEmp, bankName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {MAURITANIAN_BANKS.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numéro de Compte</label>
                  <input
                    type="text"
                    placeholder="Ex: 1628780101"
                    value={formEmp.bankAccount}
                    onChange={(e) => setFormEmp({ ...formEmp, bankAccount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clé RIB / Relevé</label>
                  <input
                    type="text"
                    placeholder="MR13 00012 01001..."
                    value={formEmp.rib}
                    onChange={(e) => setFormEmp({ ...formEmp, rib: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Contact, Contract & Site */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+222 45 74 00 00"
                    value={formEmp.phone}
                    onChange={(e) => setFormEmp({ ...formEmp, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site d'affectation</label>
                  <select
                    value={formEmp.workSite || 'Nouadhibou'}
                    onChange={(e) => setFormEmp({ ...formEmp, workSite: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Nouadhibou">Nouadhibou (Siège Cansado)</option>
                    <option value="Nouakchott">Nouakchott (Centre de Nouakchott)</option>
                    <option value="Banc d'Arguin">Banc d'Arguin (Iwik / PNBA)</option>
                    <option value="Boghé">Boghé / Kaédi (Continentale)</option>
                    <option value="En mer (N/R Al Awam)">En mer (N/R Al Awam / Amrig)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Solde Congé (jours)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formEmp.remainingLeaveDays}
                    onChange={(e) => setFormEmp({ ...formEmp, remainingLeaveDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Enregistrer l'Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier la Fiche Personnel & Compte Bancaire */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">Modifier la Fiche du Personnel</h2>
                  <p className="text-xs text-slate-500">{editingEmployee.matricule} • {editingEmployee.firstName} {editingEmployee.lastName}</p>
                </div>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
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
                    value={editingEmployee.matricule}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, matricule: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Civilité</label>
                  <select
                    value={editingEmployee.civility || 'Monsieur'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, civility: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Monsieur">Monsieur</option>
                    <option value="Madame">Madame</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NNI National (10 chiffres)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editingEmployee.nni || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, nni: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Noms FR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.firstName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.lastName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Noms AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">الاسم الأول (بالعربية)</label>
                  <input
                    type="text"
                    value={editingEmployee.firstNameAr || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, firstNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-right">اسم العائلة (بالعربية)</label>
                  <input
                    type="text"
                    value={editingEmployee.lastNameAr || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, lastNameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-right font-medium"
                  />
                </div>
              </div>

              {/* Department, Position, Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département / Service</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) => {
                      const found = orgDepartments.find(d => d.name === e.target.value);
                      setEditingEmployee({ 
                        ...editingEmployee, 
                        department: e.target.value,
                        departmentAr: found?.nameAr || editingEmployee.departmentAr,
                        workSite: found?.site || editingEmployee.workSite
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium truncate"
                  >
                    {orgDepartments.map(d => (
                      <option key={d.id || d.code} value={d.name}>{d.code ? `[${d.code}] ` : ''}{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poste / Fonction</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade</label>
                  <select
                    value={editingEmployee.grade}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, grade: e.target.value as EmployeeGrade })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="cadre_superieur">Cadre Supérieur / Directeur</option>
                    <option value="cadre">Cadre / Chercheur</option>
                    <option value="maitrise">Agent de Maîtrise / Technicien</option>
                    <option value="employe">Employé / Agent d'appui</option>
                  </select>
                </div>
              </div>

              {/* Banking Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                <div>
                  <label className="block font-bold text-indigo-900 mb-1">Banque</label>
                  <select
                    value={editingEmployee.bankName || 'BMCI'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, bankName: e.target.value })}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-950"
                  >
                    {MAURITANIAN_BANKS.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-indigo-900 mb-1">N° Compte Bancaire</label>
                  <input
                    type="text"
                    value={editingEmployee.bankAccount || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, bankAccount: e.target.value })}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-indigo-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-indigo-900 mb-1">Relevé RIB</label>
                  <input
                    type="text"
                    value={editingEmployee.rib || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, rib: e.target.value })}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Contact & Site */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Solde Congé (j)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingEmployee.remainingLeaveDays}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, remainingLeaveDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Employee Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Supprimer cet agent ?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Êtes-vous sûr de vouloir retirer ce collaborateur de la base du personnel ? Cette opération est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal (Create / Edit) */}
      <DepartmentModal
        isOpen={showDeptModal}
        onClose={() => {
          setShowDeptModal(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSave={handleSaveDepartment}
        employees={employees}
      />

      {/* Delete Department Confirmation Modal */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-2.5 text-rose-600 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Supprimer cette structure ?</h3>
                <p className="text-[11px] text-slate-500 font-mono">{deletingDept.code} - {deletingDept.name}</p>
              </div>
            </div>

            {deptDeleteError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {deptDeleteError}
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Êtes-vous sûr de vouloir supprimer définitivement la structure <strong>{deletingDept.name}</strong> ({deletingDept.code}) ?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Note : La suppression est bloquée si des collaborateurs sont actuellement rattachés à cette direction/service.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setDeletingDept(null);
                  setDeptDeleteError(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {deptDeleteError ? 'Fermer' : 'Annuler'}
              </button>
              {!deptDeleteError && (
                <button
                  onClick={handleConfirmDeleteDept}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmer la suppression
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
