export type Language = 'fr' | 'ar';

export type UserRole = 'employee' | 'manager' | 'hr_admin';

export type EmployeeGrade = 
  | 'cadre_superieur' 
  | 'cadre_sup' 
  | 'cadre' 
  | 'maitrise' 
  | 'agent_maitrise' 
  | 'employe';

export interface Employee {
  id: string;
  matricule: string;
  civility?: 'Monsieur' | 'Madame';
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  email: string;
  phone: string;
  department: string;
  departmentAr?: string;
  position: string;
  positionAr?: string;
  grade: EmployeeGrade;
  nni?: string; // Numéro National d'Identification (10 chiffres)
  cnss?: string; // Numéro d'immatriculation CNSS (Caisse Nationale de Sécurité Sociale)
  cnam?: string; // Numéro d'assuré CNAM (Caisse Nationale d'Assurance Maladie)
  bankName?: string; // e.g., 'BCI', 'BNM', 'BMCI', 'BPM', 'Attijariwafa'
  bankAccount?: string; // e.g., '8984'
  hireDate?: string;
  annualLeaveEntitlement?: number;
  totalLeaveDays?: number;
  usedLeaveDays?: number;
  remainingLeaveDays: number;
  managerId?: string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
  rib?: string;
  birthDate?: string;
  birthPlace?: string;
  categoryCode?: string;
  echelon?: string;
  contractType?: string;
  baseSalary?: number; // Salaire de base mensuel en MRU
  transportAllowance?: number; // Indemnité de transport en MRU
  housingAllowance?: number; // Indemnité de logement en MRU
  workSite?: string;
  bap?: string;
}

export type OrgUnitType = 'direction' | 'service' | 'laboratoire' | 'centre' | 'station' | 'cellule' | 'autre';

export interface DepartmentPosition {
  fr: string;
  ar?: string;
  grade?: EmployeeGrade;
  role?: UserRole;
  cat?: string;
}

export interface Department {
  id: string;
  code: string; // e.g. "DIR", "DSR", "LERVA", "SRH", "CN"
  name: string; // French official name
  nameAr?: string; // Arabic official name
  type?: OrgUnitType;
  site: string; // "Nouadhibou", "Nouakchott", "Banc d'Arguin", "Boghé", "En mer"
  bap?: 'SCIEN' | 'ADMIN' | 'NAVAL' | 'TECH' | string;
  headEmployeeId?: string; // Designated head/responsible
  description?: string;
  descriptionAr?: string;
  positions?: DepartmentPosition[];
}

export type TransportMode = 
  | 'avion'
  | 'train'
  | 'voiture_service'
  | 'voiture_perso'
  | 'taxi'
  | 'transport_commun'
  | 'autre';

export type MissionStatus = 
  | 'draft'
  | 'pending_manager'
  | 'approved_manager'
  | 'validated_hr'
  | 'rejected'
  | 'completed';

export interface MissionOrder {
  id: string;
  orderNumber: string; // e.g. "2023-026" or "2026-001"
  employeeId: string;
  destinationType: 'en_mauritanie' | 'a_letranger';
  destinationPrecisions: string; // e.g., "Nouakchott", "Dakar", etc.
  destination: string;
  destinationAr?: string;
  countryOrCity?: string;
  purpose: string; // Motif de la mission
  purposeAr?: string;
  otherMembers?: string; // Autres Membres de la mission
  departureDate: string; // Date de début de mission
  departureTime?: string;
  returnDate: string; // Date de fin de mission ou "Fin de mission"
  returnTime?: string;
  isEndFixed?: boolean; // If true: specified date, if false: "Fin de mission"
  transportMode: TransportMode;
  transportSelection?: 'voiture' | 'avion' | 'autre';
  transportDetails?: string;
  budgetImputation: 'IMROP' | 'autre';
  budgetImputationOther?: string;
  daysCount?: number; // Nombre de jours de mission
  dailyRate?: number; // Taux journalier per diem en MRU (ou devise)
  transportCost?: number; // Frais de transport saisis manuellement en MRU
  totalMissionFees?: number; // Frais de mission = (daysCount * dailyRate) + transportCost
  advancePercentage?: number; // e.g. 80%
  autoGenerateExpenseClaim?: boolean;
  currency?: string; // e.g. 'MRU'
  estimatedBudget: number;
  advanceRequested: boolean;
  advanceAmount: number;
  status: MissionStatus;
  createdAt: string;
  createdBy: string;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  hrValidatedAt?: string;
  hrValidatedBy?: string;
  rejectionReason?: string;
  linkedExpenseClaimId?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'transport' 
  | 'hebergement' 
  | 'restauration' 
  | 'carburant' 
  | 'peage' 
  | 'per_diem'
  | 'divers' 
  | 'autre';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  descriptionAr?: string;
  date: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  receiptName?: string;
  isPerDiemAuto?: boolean;
}

export type ExpenseClaimStatus = 
  | 'draft'
  | 'submitted'
  | 'pending_manager'
  | 'approved_manager'
  | 'validated_hr'
  | 'paid'
  | 'rejected';

export interface ExpenseClaim {
  id: string;
  claimNumber: string; // e.g. "2023-006"
  missionOrderId?: string;
  referenceOM?: string; // e.g. "014" or "OM N°2023-014"
  employeeId: string;
  submissionDate: string; // Date de l'état (JJ/MM/AAAA)
  paymentReason: string; // Motif Paiement e.g., "Régularisation frais de mission à Dakar"
  paymentReasonAr?: string;
  status: ExpenseClaimStatus;
  
  // Taux de change BCM du jour
  bcmRateEuro: number; // e.g. 37.14
  bcmRateDollar: number; // e.g. 0 or 34.50
  
  // Mission parameters for the tabular grid
  missionStartDate?: string;
  missionEndDate?: string;
  daysCount: number; // Nb de jours
  
  // Allowances & rates
  perDiemDailyRateMru: number; // Taux MRU/j
  transportAmountMru: number; // Transport en MRU
  perDiemDailyRateDollar: number; // Taux $/j
  perDiemDailyRateEuro: number; // Taux €/j
  totalDevise: number; // TOT € ou TOT $
  
  // Bank details for payment
  bankName: string; // e.g. "BCI", "BNM", "BMCI"
  bankAccount: string; // e.g. "8984"
  imputation: string; // e.g. "IMROP"
  
  items: ExpenseItem[];
  totalExpenses: number; // TOTAL MRU
  advanceDeducted: number;
  netPayable: number; // NET A PERCEVOIR in MRU
  amountInWords?: string; // e.g. "Trente trois mille quatre cent vingt six MRU."
  
  paymentMethod?: 'virement' | 'cheque' | 'especes';
  paymentReference?: string;
  paymentDate?: string;
  
  // Signatures
  chefSrhApprovedAt?: string;
  chefSrhApprovedBy?: string;
  comptableApprovedAt?: string;
  comptableApprovedBy?: string;
  directeurApprovedAt?: string;
  directeurApprovedBy?: string;
  
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  hrValidatedAt?: string;
  hrValidatedBy?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt?: string;
}

export interface PerDiemRate {
  grade: EmployeeGrade | string;
  labelFr: string;
  labelAr: string;
  dailyMealAllowance: number;
  nightAccommodationAllowance: number;
  kmAllowanceRate?: number;
  internationalPerDiemEur?: number; // e.g. 150 EUR/j for abroad
  internationalPerDiemUsd?: number; // e.g. 160 USD/j for abroad
  nationalPerDiemMru?: number; // e.g. 3500 MRU/j for local
}

export type MemoCategory = 
  | 'administrative' 
  | 'technical' 
  | 'security' 
  | 'hr' 
  | 'event' 
  | 'general' 
  | 'regulatory' 
  | 'disciplinary' 
  | 'announcement' 
  | 'schedule';

export type TargetAudience = 'all' | 'department' | 'managers' | 'individuals';
export type MemoAudience = TargetAudience;

export interface ReadReceipt {
  id?: string;
  employeeId: string;
  employeeName?: string;
  readAt: string;
  acknowledged?: boolean;
}

export interface InternalMemo {
  id: string;
  memoNumber: string;
  title: string;
  titleAr?: string;
  category: MemoCategory | string;
  audience?: MemoAudience;
  targetAudience?: TargetAudience | string;
  targetDepartment?: string;
  targetDepartmentAr?: string;
  targetEmployeeIds?: string[];
  publishedDate: string;
  effectiveDate?: string;
  authorName?: string;
  authorRole?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatoryTitleAr?: string;
  content: string;
  contentAr?: string;
  attachmentName?: string;
  isUrgent: boolean;
  status: 'draft' | 'published';
  readReceipts: ReadReceipt[];
}

export type LeaveType = 
  | 'conge_paye'
  | 'maladie'
  | 'maternite_paternite'
  | 'pelerinage'
  | 'evenement_familial'
  | 'sans_solde'
  | 'recuperation'
  | 'annual'
  | 'sick'
  | 'exceptional'
  | 'unpaid'
  | 'recovery';

export type LeaveStatus = 
  | 'pending_manager'
  | 'approved_manager'
  | 'validated_hr'
  | 'rejected'
  | 'cancelled';

export interface LeaveRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  startHalfDay?: 'full' | 'morning' | 'afternoon';
  endHalfDay?: 'full' | 'morning' | 'afternoon';
  totalDays: number;
  reason: string;
  reasonAr?: string;
  attachmentName?: string;
  status: LeaveStatus;
  createdAt: string;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  hrValidatedAt?: string;
  hrValidatedBy?: string;
  rejectionReason?: string;
}

export interface CompanySettings {
  name: string; // "Institut Mauritanien de Recherches Océanographiques et des Pêches"
  nameAr?: string; // "المعهد الموريتاني لبحوث المحيطات والصيد"
  acronym?: string; // "IMROP"
  ministryName?: string; // "Ministère des Pêches et de l'Economie Maritime"
  ministryNameAr?: string; // "وزارة الصيد والاقتصاد البحري"
  countryName?: string; // "République Islamique de Mauritanie"
  countryNameAr?: string; // "الجمهورية الإسلامية الموريتانية"
  motto?: string; // "Honneur • Fraternité • Justice"
  mottoAr?: string; // "شرف - إخاء - عدالة"
  logoUrl?: string;
  rcNumber: string;
  taxNumber: string;
  address: string;
  addressAr?: string;
  phone: string;
  email: string;
  currency: string; // "MRU"
  currencyAr?: string; // "أوقية"
  hrDirectorName: string;
  hrDirectorTitle?: string;
  chefSrhName?: string;
  comptableName?: string;
  directorName?: string;
  defaultBcmEuroRate?: number;
  defaultBcmDollarRate?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  performedBy?: string;
  action: string;
  actionAr?: string;
  module: 'missions' | 'expenses' | 'memos' | 'leaves' | 'employees' | 'settings' | 'auth' | string;
  details: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  linkTab?: string;
  read: boolean;
  createdAt: string;
}

