import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  Employee, 
  MissionOrder, 
  ExpenseClaim, 
  LeaveRequest, 
  InternalMemo, 
  CompanySettings,
  Language 
} from '../types';

export function exportTableToExcel(data: any[], fileName: string, sheetName = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportMissionsToExcel(
  missions: MissionOrder[], 
  employees: Employee[], 
  currency: string,
  lang: Language = 'fr'
) {
  const empMap = new Map(employees.map(e => [e.id, e]));

  const rows = missions.map(m => {
    const emp = empMap.get(m.employeeId);
    const empName = lang === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
    const dept = lang === 'ar' && emp?.departmentAr ? emp.departmentAr : emp?.department;

    return {
      [lang === 'ar' ? "رقم الأمر" : "N° Ordre"]: m.orderNumber,
      [lang === 'ar' ? "الموظف" : "Collaborateur"]: empName || m.employeeId,
      [lang === 'ar' ? "الرقم الوظيفي" : "Matricule"]: emp?.matricule || "",
      [lang === 'ar' ? "القسم" : "Département"]: dept || "",
      [lang === 'ar' ? "الوجهة" : "Destination"]: m.destination,
      [lang === 'ar' ? "تاريخ الانطلاق" : "Date Départ"]: `${m.departureDate} ${m.departureTime}`,
      [lang === 'ar' ? "تاريخ العودة" : "Date Retour"]: `${m.returnDate} ${m.returnTime}`,
      [lang === 'ar' ? "وسيلة النقل" : "Moyen Transport"]: m.transportMode,
      [lang === 'ar' ? "الاعتماد المالي" : "Imputation Budgétaire"]: m.budgetImputation === 'autre' && m.budgetImputationOther ? m.budgetImputationOther : 'IMROP',
      [lang === 'ar' ? "الحالة" : "Statut"]: m.status,
      [lang === 'ar' ? "سبب المهمة" : "Objet"]: m.purpose,
    };
  });

  exportTableToExcel(rows, `Ordres_de_Mission_${new Date().toISOString().slice(0, 10)}`, 'Missions');
}

export function exportExpensesToExcel(
  expenses: ExpenseClaim[], 
  employees: Employee[], 
  currency: string,
  lang: Language = 'fr'
) {
  const empMap = new Map(employees.map(e => [e.id, e]));

  const rows = expenses.map(e => {
    const emp = empMap.get(e.employeeId);
    const empName = lang === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;

    return {
      [lang === 'ar' ? "رقم الكشف" : "N° État"]: e.claimNumber,
      [lang === 'ar' ? "الموظف" : "Collaborateur"]: empName || e.employeeId,
      [lang === 'ar' ? "تاريخ التقديم" : "Date Soumission"]: e.submissionDate,
      [lang === 'ar' ? `إجمالي المصاريف (${currency})` : `Total Dépenses (${currency})`]: e.totalExpenses,
      [lang === 'ar' ? `السلفة المخصومة (${currency})` : `Avance Déduite (${currency})`]: e.advanceDeducted,
      [lang === 'ar' ? `الصافي للصرف (${currency})` : `Net à Payer (${currency})`]: e.netPayable,
      [lang === 'ar' ? "الحالة" : "Statut"]: e.status,
      [lang === 'ar' ? "طريقة الدفع" : "Mode Paiement"]: e.paymentMethod || "N/A",
      [lang === 'ar' ? "المرجع" : "Référence"]: e.paymentReference || "N/A",
      [lang === 'ar' ? "تاريخ الصرف" : "Date Règlement"]: e.paymentDate || "N/A"
    };
  });

  exportTableToExcel(rows, `Frais_de_Mission_${new Date().toISOString().slice(0, 10)}`, 'Frais');
}

export function exportLeavesToExcel(
  leaves: LeaveRequest[], 
  employees: Employee[], 
  lang: Language = 'fr'
) {
  const empMap = new Map(employees.map(e => [e.id, e]));

  const rows = leaves.map(l => {
    const emp = empMap.get(l.employeeId);
    const empName = lang === 'ar' && emp?.firstNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : `${emp?.firstName} ${emp?.lastName}`;
    const dept = lang === 'ar' && emp?.departmentAr ? emp.departmentAr : emp?.department;

    return {
      [lang === 'ar' ? "رقم الطلب" : "N° Demande"]: l.requestNumber,
      [lang === 'ar' ? "الموظف" : "Collaborateur"]: empName || l.employeeId,
      [lang === 'ar' ? "القسم" : "Département"]: dept || "",
      [lang === 'ar' ? "نوع الإجازة" : "Type Congé"]: l.leaveType,
      [lang === 'ar' ? "تاريخ البدء" : "Date Début"]: l.startDate,
      [lang === 'ar' ? "تاريخ الانتهاء" : "Date Fin"]: l.endDate,
      [lang === 'ar' ? "عدد الأيام" : "Nombre Jours"]: l.totalDays,
      [lang === 'ar' ? "الحالة" : "Statut"]: l.status,
      [lang === 'ar' ? "السبب" : "Motif"]: l.reason
    };
  });

  exportTableToExcel(rows, `Rapport_Conges_${new Date().toISOString().slice(0, 10)}`, 'Conges');
}

export function exportEmployeesToExcel(
  employees: Employee[], 
  lang: Language = 'fr'
) {
  const rows = employees.map(e => ({
    [lang === 'ar' ? "الرقم الوظيفي" : "Matricule"]: e.matricule,
    [lang === 'ar' ? "الاسم الكامل" : "Nom & Prénom"]: `${e.firstName} ${e.lastName}`,
    [lang === 'ar' ? "الاسم بالعربية" : "Nom Arabe"]: `${e.firstNameAr} ${e.lastNameAr}`,
    [lang === 'ar' ? "القسم" : "Département"]: e.department,
    [lang === 'ar' ? "الوظيفة" : "Poste"]: e.position,
    [lang === 'ar' ? "الرتبة" : "Grade"]: e.grade,
    [lang === 'ar' ? "تاريخ التوظيف" : "Date Embauche"]: e.hireDate,
    [lang === 'ar' ? "رصيد الإجازات المتبقي" : "Solde Congés (Jours)"]: e.remainingLeaveDays,
    [lang === 'ar' ? "البريد الإلكتروني" : "Email"]: e.email,
    [lang === 'ar' ? "الهاتف" : "Téléphone"]: e.phone,
    [lang === 'ar' ? "الحساب البنكي" : "RIB"]: e.rib || ""
  }));

  exportTableToExcel(rows, `Annuaire_Collaborateurs_${new Date().toISOString().slice(0, 10)}`, 'Collaborateurs');
}

export function exportMemosToExcel(
  memos: InternalMemo[], 
  totalEmployeesCount: number,
  lang: Language = 'fr'
) {
  const rows = memos.map(m => ({
    [lang === 'ar' ? "رقم المذكرة" : "N° Note"]: m.memoNumber,
    [lang === 'ar' ? "العنوان" : "Titre"]: m.title,
    [lang === 'ar' ? "العنوان بالعربية" : "Titre Arabe"]: m.titleAr || "",
    [lang === 'ar' ? "الكاتب" : "Auteur"]: `${m.authorName} (${m.authorRole})`,
    [lang === 'ar' ? "الفئة" : "Catégorie"]: m.category,
    [lang === 'ar' ? "تاريخ النشر" : "Date Publication"]: m.publishedDate,
    [lang === 'ar' ? "تاريخ النفاذ" : "Date Effet"]: m.effectiveDate || m.publishedDate,
    [lang === 'ar' ? "الفئة المستهدفة" : "Audience"]: m.targetAudience === 'department' ? m.targetDepartment : m.targetAudience,
    [lang === 'ar' ? "عاجلة" : "Urgente"]: m.isUrgent ? (lang === 'ar' ? "نعم" : "Oui") : (lang === 'ar' ? "لا" : "Non"),
    [lang === 'ar' ? "عدد القراءات" : "Lectures"]: m.readReceipts.length,
    [lang === 'ar' ? "نسبة الإطلاع" : "Taux Lecture"]: `${Math.round((m.readReceipts.length / (totalEmployeesCount || 1)) * 100)}%`
  }));

  exportTableToExcel(rows, `Notes_de_Service_${new Date().toISOString().slice(0, 10)}`, 'NotesDeService');
}

