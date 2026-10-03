import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeGrade } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  ShieldCheck, 
  CreditCard, 
  UserCheck, 
  X, 
  Check, 
  Edit3 
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { 
    language, 
    t, 
    employees, 
    currentEmployeeId, 
    setCurrentEmployeeId, 
    updateEmployee, 
    addEmployee 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Escape key closes open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingEmployee(null);
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New Employee Form
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    matricule: `EMP-${Date.now().toString().slice(-4)}`,
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    email: '',
    phone: '+212 6 00 00 00 00',
    department: 'Informatique & SI',
    position: 'Collaborateur',
    grade: 'cadre',
    role: 'employee',
    totalLeaveDays: 22,
    usedLeaveDays: 0,
    remainingLeaveDays: 22,
    rib: '011 780 0000 123456789012 34',
    isActive: true
  });

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.firstNameAr && emp.firstNameAr.includes(searchTerm)) ||
      emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchSearch && matchDept;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    updateEmployee(editingEmployee);
    setEditingEmployee(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName) return;
    const created: Employee = {
      id: `emp-${Date.now()}`,
      matricule: newEmp.matricule || `EMP-${Date.now().toString().slice(-4)}`,
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      firstNameAr: newEmp.firstNameAr,
      lastNameAr: newEmp.lastNameAr,
      email: newEmp.email || `${newEmp.firstName.toLowerCase()}.${newEmp.lastName.toLowerCase()}@entreprise.ma`,
      phone: newEmp.phone || '+212 6 00 00 00 00',
      department: newEmp.department || 'Informatique & SI',
      position: newEmp.position || 'Collaborateur',
      grade: (newEmp.grade as EmployeeGrade) || 'cadre',
      role: newEmp.role || 'employee',
      totalLeaveDays: Number(newEmp.totalLeaveDays) || 22,
      usedLeaveDays: Number(newEmp.usedLeaveDays) || 0,
      remainingLeaveDays: Number(newEmp.totalLeaveDays || 22) - Number(newEmp.usedLeaveDays || 0),
      rib: newEmp.rib,
      isActive: true,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?w=100`
    };
    addEmployee(created);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900">{t('navEmployees')}</h1>
              <p className="text-xs text-slate-500">Annuaire du personnel, matricules, soldes et fonctions</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-100 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Collaborateur</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, matricule, poste..."
              className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Tous les départements ({departments.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isCurrent = emp.id === currentEmployeeId;
          return (
            <div
              key={emp.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCurrent ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={emp.firstName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      {emp.firstNameAr && (
                        <p className="text-xs text-slate-500 font-cairo">
                          {emp.firstNameAr} {emp.lastNameAr}
                        </p>
                      )}
                      <span className="font-mono text-[10px] text-slate-400 font-bold block mt-0.5">
                        {emp.matricule}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingEmployee(emp)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Poste :</span>
                    <span className="font-semibold text-slate-800">{emp.position}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Département :</span>
                    <span className="font-medium text-slate-700">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Grade & Barème :</span>
                    <span className="font-bold text-indigo-700 uppercase">{emp.grade}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Solde Congés :</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {emp.remainingLeaveDays} j restants ({emp.usedLeaveDays}j pris)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                  {emp.email}
                </span>

                <button
                  onClick={() => setCurrentEmployeeId(emp.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCurrent ? "✓ Profil Actif" : "Basculer"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingEmployee && (
        <div 
          onClick={() => setEditingEmployee(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 cursor-default relative my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">
                Modifier le Collaborateur ({editingEmployee.matricule})
              </h2>
              <button
                onClick={() => setEditingEmployee(null)}
                title="Fermer (Échap)"
                className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Fermer</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.firstName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.lastName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poste</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade</label>
                  <select
                    value={editingEmployee.grade}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, grade: e.target.value as EmployeeGrade })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="cadre_sup">Cadre Supérieur / Direction</option>
                    <option value="cadre">Cadre</option>
                    <option value="agent_maitrise">Agent de Maîtrise</option>
                    <option value="employe">Employé / Ouvrier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Solde Total Congés (Jours)</label>
                  <input
                    type="number"
                    value={editingEmployee.totalLeaveDays}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setEditingEmployee({ 
                        ...editingEmployee, 
                        totalLeaveDays: total,
                        remainingLeaveDays: total - editingEmployee.usedLeaveDays 
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RIB Bancaire</label>
                  <input
                    type="text"
                    value={editingEmployee.rib || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, rib: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 cursor-default relative my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">
                Ajouter un nouveau collaborateur
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                title="Fermer (Échap)"
                className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Fermer</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade</label>
                  <select
                    value={newEmp.grade}
                    onChange={(e) => setNewEmp({ ...newEmp, grade: e.target.value as EmployeeGrade })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="cadre_sup">Cadre Supérieur / Direction</option>
                    <option value="cadre">Cadre</option>
                    <option value="agent_maitrise">Agent de Maîtrise</option>
                    <option value="employe">Employé / Ouvrier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poste</label>
                  <input
                    type="text"
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle Système</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="employee">Collaborateur / Employé</option>
                    <option value="manager">Manager N+1</option>
                    <option value="hr_admin">Directeur RH / Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Créer le collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
