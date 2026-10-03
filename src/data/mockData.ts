import { 
  Employee, 
  Department,
  MissionOrder, 
  ExpenseClaim, 
  InternalMemo, 
  LeaveRequest, 
  PerDiemRate, 
  CompanySettings, 
  AuditLog, 
  AppNotification 
} from '../types';
import { officialImropPersonnel, imropDepartmentsList } from './imropPersonnelData';

export const initialCompanySettings: CompanySettings = {
  name: "Institut Mauritanien de Recherches Océanographiques et des Pêches",
  nameAr: "المعهد الموريتاني لبحوث المحيطات والصيد",
  acronym: "IMROP",
  ministryName: "Ministère des Pêches, des Infrastructures Maritimes et Portuaires",
  ministryNameAr: "وزارة الصيد والبنى التحتية البحرية والمينائية",
  countryName: "République Islamique de Mauritanie",
  countryNameAr: "الجمهورية الإسلامية الموريتانية",
  motto: "Honneur • Fraternité • Justice",
  mottoAr: "شرف - إخاء - عدالة",
  rcNumber: "EPIC N° 2000-058",
  taxNumber: "NIF 00481903",
  address: "BP 22, Cansado, Nouadhibou, Mauritanie",
  addressAr: "ص.ب 22، كانصادو، نواذيبو، موريتانيا",
  phone: "+222 45 74 51 24 / +222 45 74 53 79",
  email: "direction@imrop.mr",
  currency: "MRU",
  currencyAr: "أوقية",
  hrDirectorName: "EL Khalifa Boullahi EL Hacen",
  hrDirectorTitle: "Chef Service des Ressources Humaines & Logistique (SAL)",
  chefSrhName: "EL Khalifa Boullahi EL Hacen",
  comptableName: "Mohamed O. Ahmed Ely",
  directorName: "Dr. Mohamed EL Hafedh Ejiwen",
  defaultBcmEuroRate: 37.14,
  defaultBcmDollarRate: 34.50
};

export const initialPerDiemRates: PerDiemRate[] = [
  {
    grade: 'cadre_superieur',
    labelFr: 'Directeur / Chercheur Principal (Cadre Sup.)',
    labelAr: 'مدير / باحث رئيسي (إطار عالي)',
    dailyMealAllowance: 1200,
    nightAccommodationAllowance: 2500,
    kmAllowanceRate: 15,
    nationalPerDiemMru: 3700,
    internationalPerDiemEur: 150,
    internationalPerDiemUsd: 160
  },
  {
    grade: 'cadre',
    labelFr: 'Chercheur / Ingénieur / Chef de Labo (Cadre)',
    labelAr: 'باحث / مهندس / رئيس مختبر (إطار)',
    dailyMealAllowance: 900,
    nightAccommodationAllowance: 1800,
    kmAllowanceRate: 12,
    nationalPerDiemMru: 2700,
    internationalPerDiemEur: 130,
    internationalPerDiemUsd: 140
  },
  {
    grade: 'maitrise',
    labelFr: 'Technicien Supérieur / Observateur Océano',
    labelAr: 'تقني عالي / مراقب أوقيانوغرافي',
    dailyMealAllowance: 600,
    nightAccommodationAllowance: 1200,
    kmAllowanceRate: 8,
    nationalPerDiemMru: 1800,
    internationalPerDiemEur: 100,
    internationalPerDiemUsd: 110
  },
  {
    grade: 'employe',
    labelFr: 'Agent d\'appui / Chauffeur / Matelot',
    labelAr: 'عون دعم / سائق / بحار',
    dailyMealAllowance: 450,
    nightAccommodationAllowance: 900,
    kmAllowanceRate: 6,
    nationalPerDiemMru: 1350,
    internationalPerDiemEur: 80,
    internationalPerDiemUsd: 90
  }
];

export const initialEmployees: Employee[] = officialImropPersonnel;

export const initialDepartments: Department[] = imropDepartmentsList;

export const initialMissionOrders: MissionOrder[] = [
  {
    id: "om-1",
    orderNumber: "2023-026",
    employeeId: "EMP-001",
    destinationType: "a_letranger",
    destinationPrecisions: "Dakar, Sénégal (CRODT - Centre de Recherches Océanographiques de Dakar-Thiaroye)",
    destination: "Dakar, Sénégal",
    destinationAr: "داكار، السنغال",
    purpose: "Participation à l'atelier sous-régional sur l'évaluation conjointe des stocks de petits pélagiques en Afrique du Nord-Ouest",
    purposeAr: "المشاركة في الورشة الإقليمية للتقييم المشترك لمخزونات الأسماك السطحية الصغيرة",
    otherMembers: "Dr. Ahmedou OULD SIDI, Aissata DIALLO",
    departureDate: "2023-03-12",
    departureTime: "08:00",
    returnDate: "2023-03-19",
    returnTime: "18:00",
    isEndFixed: true,
    transportMode: "avion",
    transportSelection: "avion",
    transportDetails: "Vol Air Mauritanie Nouakchott - Dakar - Nouakchott",
    budgetImputation: "IMROP",
    budgetImputationOther: "",
    estimatedBudget: 33426,
    advanceRequested: false,
    advanceAmount: 0,
    status: "validated_hr",
    createdAt: "2023-02-25T09:00:00Z",
    createdBy: "EMP-001",
    managerApprovedAt: "2023-02-26T11:00:00Z",
    managerApprovedBy: "Ahmedou OULD SIDI",
    hrValidatedAt: "2023-02-27T14:30:00Z",
    hrValidatedBy: "Dr. Mohamed Mahmoud OULD TFEIL",
    linkedExpenseClaimId: "ef-1",
    notes: "Ordre conforme au modèle officiel IMROP N°2023-026."
  },
  {
    id: "om-2",
    orderNumber: "2023-016",
    employeeId: "EMP-001",
    destinationType: "en_mauritanie",
    destinationPrecisions: "Nouakchott",
    destination: "Nouakchott, Mauritanie",
    destinationAr: "نواكشوط، موريتانيا",
    purpose: "Réunion de coordination scientifique avec le Ministère des Pêches et de l'Economie Maritime et la DSPCM",
    purposeAr: "اجتماع التنسيق العلمي مع وزارة الصيد وخفر السواحل الموريتاني",
    otherMembers: "Néant",
    departureDate: "2023-03-15",
    departureTime: "07:30",
    returnDate: "Fin de mission",
    returnTime: "18:00",
    isEndFixed: false,
    transportMode: "voiture_service",
    transportSelection: "voiture",
    transportDetails: "Véhicule de service IMROP 4x4 Toyota Hilux",
    budgetImputation: "IMROP",
    budgetImputationOther: "",
    estimatedBudget: 12000,
    advanceRequested: true,
    advanceAmount: 5000,
    status: "approved_manager",
    createdAt: "2023-03-10T14:20:00Z",
    createdBy: "EMP-001",
    managerApprovedAt: "2023-03-11T10:00:00Z",
    managerApprovedBy: "Ahmedou OULD SIDI",
    notes: "Ordre conforme au modèle officiel IMROP N°2023-016."
  },
  {
    id: "om-3",
    orderNumber: "2026-001",
    employeeId: "EMP-006",
    destinationType: "en_mauritanie",
    destinationPrecisions: "Banc d'Arguin & Station Iwik",
    destination: "Parc National du Banc d'Arguin (PNBA)",
    destinationAr: "حوض آركين ومحطة إيويك",
    purpose: "Campagne d'échantillonnage biologique et suivi écologique des nourriceries côtières",
    purposeAr: "حملة أخذ العينات البيولوجية والمتابعة البيئية لمناطق الحضانة الساحلية",
    otherMembers: "El Hacen OULD BILAL, 2 Observateurs marins",
    departureDate: "2026-09-05",
    departureTime: "07:00",
    returnDate: "2026-09-10",
    returnTime: "19:00",
    isEndFixed: true,
    transportMode: "voiture_service",
    transportSelection: "voiture",
    transportDetails: "Véhicule tout-terrain IMROP 4x4",
    budgetImputation: "IMROP",
    budgetImputationOther: "",
    estimatedBudget: 18500,
    advanceRequested: true,
    advanceAmount: 10000,
    status: "pending_manager",
    createdAt: "2026-08-28T16:00:00Z",
    createdBy: "EMP-006",
    notes: "Mission terrain d'échantillonnage planifiée."
  }
];

export const initialExpenseClaims: ExpenseClaim[] = [
  {
    id: "ef-1",
    claimNumber: "2023-006",
    missionOrderId: "om-1",
    referenceOM: "014",
    employeeId: "EMP-001",
    submissionDate: "27/02/2023",
    paymentReason: "Régularisation frais de mission à Dakar",
    paymentReasonAr: "تسوية مصاريف مهمة إلى داكار",
    status: "validated_hr",
    bcmRateEuro: 37.14,
    bcmRateDollar: 0,
    missionStartDate: "01/03/2023",
    missionEndDate: "06/03/2023",
    daysCount: 6,
    perDiemDailyRateMru: 0,
    transportAmountMru: 0,
    perDiemDailyRateDollar: 0,
    perDiemDailyRateEuro: 150,
    totalDevise: 900,
    bankName: "BCI",
    bankAccount: "8984",
    imputation: "IMROP",
    items: [
      {
        id: "item-1",
        category: "per_diem",
        description: "Per diem mission Dakar (6 jours x 150 € = 900 € convertis au taux BCM 37,14 MRU)",
        descriptionAr: "تعويض يومي لمهمة داكار (6 أيام × 150 يورو = 900 يورو بسعر البنك المركزي 37.14)",
        date: "2023-03-01",
        amount: 33426,
        quantity: 6,
        unitPrice: 5571,
        isPerDiemAuto: true
      }
    ],
    totalExpenses: 33426,
    advanceDeducted: 0,
    netPayable: 33426,
    amountInWords: "Trente trois mille quatre cent vingt six MRU.",
    paymentMethod: "virement",
    paymentReference: "VIR-BCI-2023-006",
    paymentDate: "2023-03-08",
    chefSrhApprovedAt: "2023-02-27T10:00:00Z",
    chefSrhApprovedBy: "Chef Service SRH",
    comptableApprovedAt: "2023-02-27T12:30:00Z",
    comptableApprovedBy: "Le Comptable IMROP",
    directeurApprovedAt: "2023-02-27T15:00:00Z",
    directeurApprovedBy: "Le Directeur Général IMROP",
    managerApprovedAt: "2023-02-27T10:00:00Z",
    managerApprovedBy: "Ahmedou OULD SIDI",
    hrValidatedAt: "2023-02-27T15:00:00Z",
    hrValidatedBy: "Dr. Mohamed Mahmoud OULD TFEIL",
    notes: "État conforme au modèle officiel IMROP ETAT DE PAIEMENT N°2023-006."
  }
];

export const initialInternalMemos: InternalMemo[] = [
  {
    id: "memo-1",
    memoNumber: "NS-2026-001",
    title: "Directives relatives aux missions scientifiques et aux campagnes océanographiques 2026",
    titleAr: "توجيهات بخصوص المهام العلمية والحملات الأوقيانوغرافية لسنة 2026",
    category: "regulatory",
    audience: "all",
    publishedDate: "2026-08-01",
    signatoryName: "Dr. Mohamed Mahmoud OULD TFEIL",
    signatoryTitle: "Directeur Général IMROP",
    signatoryTitleAr: "المدير العام للمعهد الموريتاني لبحوث المحيطات والصيد",
    content: "Il est rappelé à l'ensemble des chercheurs, ingénieurs et techniciens de l'IMROP que toute mission de terrain ou à l'étranger doit faire l'objet d'un Ordre de Mission dûment visé par la Direction avant tout engagement budgétaire.",
    contentAr: "يُذكر جميع الباحثين والمهندسين والتقنيين بالمعهد بأن أي مهمة ميدانية أو خارجية يجب أن تكون مصحوبة بأمر بمهمة رسمي موقع من الإدارة العامة قبل أي التزام مالي.",
    isUrgent: false,
    status: "published",
    readReceipts: [
      { employeeId: "EMP-001", readAt: "2026-08-02T08:30:00Z", acknowledged: true },
      { employeeId: "EMP-002", readAt: "2026-08-01T10:15:00Z", acknowledged: true },
      { employeeId: "EMP-003", readAt: "2026-08-01T11:00:00Z", acknowledged: true }
    ]
  }
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    requestNumber: "TC-2026-001",
    employeeId: "EMP-001",
    leaveType: "conge_paye",
    startDate: "2026-09-15",
    endDate: "2026-09-22",
    startHalfDay: "morning",
    endHalfDay: "afternoon",
    totalDays: 6,
    reason: "Congé annuel de repos statutaire",
    reasonAr: "عطلة سنوية نظامية للراحة",
    status: "validated_hr",
    createdAt: "2026-08-20T10:00:00Z",
    managerApprovedAt: "2026-08-21T09:00:00Z",
    managerApprovedBy: "Ahmedou OULD SIDI",
    hrValidatedAt: "2026-08-22T14:00:00Z",
    hrValidatedBy: "Dr. Mohamed Mahmoud OULD TFEIL"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-08-29T08:30:00Z",
    userId: "EMP-004",
    userName: "Dr. Mohamed Mahmoud OULD TFEIL",
    action: "Validation Ordre de Mission N°2023-026",
    actionAr: "اعتماد أمر بمهمة رقم 2023-026",
    module: "missions",
    details: "Validation administrative de la mission à Dakar pour Dr. Mohamed Salem OULD VALL"
  },
  {
    id: "log-2",
    timestamp: "2026-08-29T08:35:00Z",
    userId: "EMP-005",
    userName: "Cheikh Tidjane BA",
    action: "Liquidation État de Paiement N°2023-006",
    actionAr: "تصفية كشف صرف رقم 2023-006",
    module: "expenses",
    details: "Virement de 33 426 MRU ordonné pour régularisation frais de mission"
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: "notif-1",
    recipientId: "EMP-001",
    title: "Ordre de Mission Validé",
    titleAr: "تم اعتماد أمر المهمة",
    message: "Votre ordre de mission N°2023-026 a été validé par la Direction Générale.",
    messageAr: "تم اعتماد أمر المهمة رقم 2023-026 من قِبل الإدارة العامة.",
    type: "success",
    linkTab: "missions",
    read: false,
    createdAt: "2026-08-29T08:30:00Z"
  }
];
