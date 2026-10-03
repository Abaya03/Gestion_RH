import fs from 'fs';
import path from 'path';

// Load raw pdfData from build_imrop_personnel.js
const buildContent = fs.readFileSync('./build_imrop_personnel.js', 'utf8');
const match = buildContent.match(/const pdfData = (\[[\s\S]*?\]);/);
if (!match) {
  throw new Error("Could not extract pdfData from build_imrop_personnel.js");
}
const pdfData = eval(match[1]);

// Department code mapping to full official names & Arabic names
const departmentMap = {
  "DIR": {
    code: "DIR",
    name: "Direction Générale (DIR)",
    nameAr: "الإدارة العامة",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "DSR": {
    code: "DSR",
    name: "Direction Scientifique et de la Recherche (DSR)",
    nameAr: "الإدارة العلمية والبحوث",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LERVA": {
    code: "LERVA",
    name: "Laboratoire d'Évaluation des Ressources Vivantes Aquatiques (LERVA)",
    nameAr: "مختبر تقييم الموارد الحية المائية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LEBOA": {
    code: "LEBOA",
    name: "Laboratoire d'Écologie et de Biologie des Organismes Aquatiques (LEBOA)",
    nameAr: "مختبر بيئة وبيولوجيا الكائنات المائية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LEMMC": {
    code: "LEMMC",
    name: "Laboratoire d'Étude des Milieux Marins et Côtiers (LEMMC)",
    nameAr: "مختبر دراسة الأوساط البحرية والساحلية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LESE": {
    code: "LESE",
    name: "Laboratoire d'Écotoxicologie et Surveillance de l'Environnement (LESE)",
    nameAr: "مختبر علم السموم البيئية ومراقبة البيئة",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "CN": {
    code: "CN",
    name: "Station IMROP de Nouakchott (CN)",
    nameAr: "محطة المعهد بنواكشوط",
    site: "Nouakchott",
    bap: "SCIEN"
  },
  "SS": {
    code: "SS",
    name: "Station Sud & Pêche Continentale (SS)",
    nameAr: "محطة الجنوب والصيد القاري",
    site: "Boghé / Kaédi",
    bap: "SCIEN"
  },
  "AK": {
    code: "AK",
    name: "Station Banc d'Arguin (AK - Arkeiss/Iwik)",
    nameAr: "محطة حوض آرغين",
    site: "Banc d'Arguin",
    bap: "SCIEN"
  },
  "SAR": {
    code: "SAR",
    name: "Service d'Armement et Navires de Recherche (SAR / N/R Al Awam)",
    nameAr: "مصلحة التجهيز وسفن البحوث (العوام)",
    site: "En mer / Port Nouadhibou",
    bap: "NAVAL"
  },
  "SAL": {
    code: "SAL",
    name: "Service des Affaires Générales et Logistique (SAL)",
    nameAr: "مصلحة الشؤون العامة واللوجستيات",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SC": {
    code: "SC",
    name: "Service Comptabilité et Finances (SC)",
    nameAr: "مصلحة المحاسبة والمالية",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SRH": {
    code: "SRH",
    name: "Service des Ressources Humaines (SRH)",
    nameAr: "مصلحة المصادر البشرية",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SI": {
    code: "SI",
    name: "Service Informatique, SIG et Statistiques (SI)",
    nameAr: "مصلحة المعلوماتية ونظم المعلومات الجغرافية",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "SMT": {
    code: "SMT",
    name: "Service Maintenance Technique et Ateliers (SMT)",
    nameAr: "مصلحة الصيانة الفنية والورش",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "STM": {
    code: "STM",
    name: "Service Technologies Marines (STM)",
    nameAr: "مصلحة التكنولوجيا البحرية",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "CDIS": {
    code: "CDIS",
    name: "Centre de Documentation et Information Scientifique (CDIS)",
    nameAr: "مركز التوثيق والإعلام العلمي",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "CDI": {
    code: "CDI",
    name: "Centre de Documentation et Information (CDI)",
    nameAr: "مركز التوثيق والإعلام",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "COS": {
    code: "COS",
    name: "Cellule d'Océanographie Spatiale (COS)",
    nameAr: "خلية علم المحيطات الفضائي",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "MPEM": {
    code: "MPEM",
    name: "Ministère Pêches & Économie Maritime / Détachement (MPEM)",
    nameAr: "وزارة الصيد والاقتصاد البحري / انتداب",
    site: "Nouakchott / Nouadhibou",
    bap: "ADMIN"
  }
};

const positionArMap = {
  'Chercheur': 'باحث',
  'Observateur Scientifique': 'مراقب علمي',
  'Assistant de recherche': 'مساعد بحث',
  'Ingénieur': 'مهندس',
  'Ingénieur Principal': 'مهندس رئيسي',
  'Tech. Sup.': 'تقني عالي',
  'Technicien': 'تقني',
  'Enquêteur': 'باحث ميداني / محقق',
  'Gardien': 'حارس',
  'Agent Admin.': 'وكيل إداري',
  'Matelot': 'بحار',
  'Officier Mécanicien': 'ضابط ميكانيك',
  'Chauffeur': 'سائق',
  'Mécanicien': 'ميكانيكي',
  'Patron Hauturier': 'ربان أعالي البحار',
  'Secrétaire': 'سكرتير / كاتبة',
  'Agent Saisie': 'وكيل رقن ومعالجة بيانات',
  'Agent Compta.': 'وكيل محاسبة',
  'Secrét. Direction': 'سكرتارية الإدارة',
  'Assistante Direction': 'مساعدة إدارة',
  'Capitaine': 'قبطان',
  'Second Capitaine': 'قبطان ثان',
  'Lieutenant Pêche': 'ملازم صيد',
  'Officier de Pont': 'ضابط سطح',
  'Planton': 'حاجب',
  'Admin. Des Finances': 'إداري مالي',
  'Reprographe': 'مسؤول استنساخ وطباعة',
  'Gestionnaire': 'مسير',
  'Aide Comptable': 'معاون محاسب',
  'Electricien': 'كهربائي',
  'Contremaître': 'رئيس عمال',
  'Plombier': 'سباك',
  'Jardinier': 'بستاني',
  'Garçon de Labo': 'معاون مختبر',
  'Directeur Général': 'المدير العام',
  'Directeur Adjoint': 'المدير المساعد',
  'Inspecteur Trésor': 'مفتش الخزينة'
};

const bankCodeMap = {
  'BMCI': '00012',
  'BNM': '00014',
  'BPM': '00020',
  'SGM': '00022',
  'Attijariwafa Bank': '00025',
  'Chinguetti Bank': '00017',
  'BCI': '00019',
  'BAMIS': '00015',
  'BMS': '00024',
  'BIM': '00023',
  'BADH': '00026',
  'Orabank': '00028',
  'BMI': '00030'
};

function mapCategoryToGrade(cat, poste) {
  const p = (poste || '').toLowerCase();
  const c = (cat || '').toUpperCase();
  if (p.includes('directeur général') || p.includes('inspecteur trésor')) return 'cadre_superieur';
  if (p.includes('directeur adjoint') || p.includes('directeur scientifique')) return 'cadre_superieur';
  if (c.startsWith('A1') || c.startsWith('A2') || c.startsWith('ING')) {
    if (p.includes('chercheur') || p.includes('ingénieur') || p.includes('ingenieur') || p.includes('admin.')) return 'cadre';
    if (p.includes('observateur') || p.includes('tech')) return 'maitrise';
    return 'cadre';
  }
  if (c.startsWith('TA') || c.startsWith('TB') || c.startsWith('TC') || c.startsWith('GA') || c.startsWith('GB')) {
    return 'maitrise';
  }
  if (c.startsWith('SD') || c.startsWith('SC') || c.startsWith('GD') || c.startsWith('CD') || c.startsWith('TD') || c.startsWith('GC') || c.startsWith('HC') || c.startsWith('MD') || c.startsWith('E')) {
    return 'employe';
  }
  return 'employe';
}

function formatDate(dateStr) {
  if (!dateStr) return '2000-01-01';
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

const nameTranslations = {
  "Abdallahi": "عبد الله",
  "Mohamed": "محمد",
  "Limam": "الإمام",
  "Abdel": "عبد",
  "Kerim": "الكريم",
  "Maouloud": "مولود",
  "Souleymane": "سليمان",
  "Abdou": "عبدو",
  "Navaa": "النفاع",
  "Abdoulaye": "عبد الله",
  "Cheikhou": "شيخو",
  "Wagué": "واغي",
  "Abou": "أبو",
  "Ciré": "سيري",
  "Ball": "بال",
  "Ahmed": "أحمد",
  "Nah": "الناه",
  "Lemine": "لمين",
  "Mahfoudh": "محفوظ",
  "Taleb": "طالب",
  "Moussa": "موسى",
  "Saleck": "السالك",
  "Baya": "باي",
  "Sidi": "سيدي",
  "Sadegh": "صادق",
  "Ahmedou": "أحمده",
  "Moustapha": "المصطفى",
  "Abdi": "عبدي",
  "Amadou": "أمادو",
  "Harouna": "هارونا",
  "Sow": "صو",
  "Aminetou": "آمنة",
  "Salem": "سالم",
  "Echvagha": "إشفاقه",
  "Nalla": "نله",
  "Ibrahim": "إبراهيم",
  "Assane": "الحسن",
  "Deda": "دداه",
  "Fall": "فال",
  "Azza": "عزة",
  "Cheikh": "الشيخ",
  "Jiddou": "جدو",
  "Baba": "بابا",
  "Bady": "بادي",
  "Bahi": "باهي",
  "Beye": "بيه",
  "Vetah": "فتاح",
  "Bambaye": "بمباي",
  "Hamady": "حمادي",
  "Mokhtar": "المختار",
  "Beyahe": "بياه",
  "Meisse": "ميسه",
  "Habibe": "حبيب",
  "Beyih": "بيه",
  "Semeta": "سمته",
  "Bouya": "بويا",
  "Abdarrahmane": "عبد الرحمن",
  "M'Bengue": "مبينك",
  "Brahim": "إبراهيم",
  "T'Feil": "تفعيل",
  "Isselmou": "إسلم",
  "Cheikhna": "شيخنا",
  "Yero": "ييرو",
  "Gandéga": "غانديغا",
  "Dah": "الداه",
  "Alioune": "علي",
  "Dammy": "دامي",
  "Adeba": "أديبا",
  "Dedah": "دداه",
  "Bamba": "بمبا",
  "Babou": "بابو",
  "Dedde": "دده",
  "Achamra": "الشامرة",
  "Dedeche": "ددش",
  "Moileck": "مويلك",
  "Diagne": "دياني",
  "Fally": "فالي",
  "Djimera": "جيميرا",
  "Lassana": "لاسانا",
  "Madiakho": "مادياخو",
  "Khalifa": "الخليفة",
  "Boullahi": "بولاهي",
  "Hacen": "الحسن",
  "Moctar": "المختار",
  "Elimane": "عليمان",
  "kane": "كان",
  "Ely": "علي",
  "Beibou": "بيبو",
  "Fah": "فاه",
  "Mohamedou": "محمدو",
  "Argueina": "أرغينه",
  "Fatimetou": "فاطمة",
  "Khaitoura": "خيطورة",
  "Ismail": "إسماعيل",
  "Hammoud": "حمود",
  "Vadhel": "الفاضل",
  "Hamoud": "حمود",
  "Lemina": "لمينة",
  "Ghailany": "غيلاني",
  "Mamadou": "مامادو",
  "Abdoul": "عبد",
  "Dia": "ديا",
  "Lamba": "لامبا",
  "Birane": "بيران",
  "Ba": "با",
  "Marieme": "مريم",
  "Boujoumaa": "بوجمعة",
  "Bouvreiwa": "بوفريوة",
  "MBeirika": "امبيريكة",
  "MBodj": "امبودج",
  "Oumar": "عمر",
  "Bocar": "بوكار",
  "Meiloud": "ميلود",
  "Khaye": "الخاي",
  "Hady": "الهادي",
  "Aly": "علي",
  "Habib": "حبيب",
  "Bourweiss": "بورويس",
  "Bechir": "البشير",
  "Hamed": "حامد",
  "Dechagh": "دشاغ",
  "M'Haimid": "امحيميد",
  "Reyoug": "ريوغ",
  "Khattry": "خطري",
  "M'Beirickat": "امبيريكات",
  "M'Haimdatt": "امحيمدات",
  "Abba": "أبّا",
  "Hamma": "همّا",
  "Nene": "نينه",
  "Evteir": "افطير",
  "Sileymane": "سليمان",
  "Thierno": "تيرنو",
  "Lam": "لام",
  "Tarham": "ترهام",
  "Bouha": "بوها",
  "Yarg": "يرك",
  "Traore": "تراوري",
  "Ismaila": "إسماعيلا",
  "Zeidane": "زيدان",
  "Khaihoum": "خيهوم",
  "Khalil": "الخليل",
  "Habiboillah": "حبيب الله",
  "Kory": "الكوري",
  "Ememe": "إمّام",
  "Khairi": "خيري",
  "Moujtaba": "المجتبى",
  "Kerbally": "كربالي",
  "Hmoudi": "حمودي",
  "Sy": "سي",
  "Eba": "إبه",
  "Mehdi": "المهدي",
  "Moulaye": "مولاي",
  "Bebih": "ببيه",
  "Meynatt": "مينات",
  "Sedoum": "سدوم",
  "Jiyed": "جيد",
  "Tem": "التام",
  "Boukhary": "البخاري",
  "Messaoud": "مسعود",
  "Youma": "يوما",
  "Yahya": "يحيى",
  "Mahmoud": "محمود",
  "Lekhal": "لكحل",
  "Nouh": "نوح",
  "Bah": "باه",
  "Roughaya": "رقية",
  "Edy": "إدي",
  "Seyidina": "سيدنا",
  "Kleithima": "كليثيمة",
  "Lemrabott": "المرابط",
  "Loutt": "لوط",
  "Najem": "ناجم",
  "Mame": "مام",
  "Raki": "راكي",
  "Djibril": "جبريل",
  "Diop": "ديوب",
  "Mariam": "مريم",
  "Naji": "الناجي",
  "Moubarrak": "مبارك",
  "Nema": "النعمة",
  "N'Guiya": "انكيّة",
  "Samba": "صمبا",
  "Mounaya": "مناية",
  "Beheitt": "بحيت",
  "Diombar": "جومبار",
  "Kane": "كان",
  "Hawa": "حواء",
  "Khadijetou": "خديجة",
  "Aichetou": "عائشة",
  "Fatou": "فاتو",
  "Kadiata": "كادياتا",
  "Toutou": "توتو",
  "Salimata": "سالماتا",
  "Maimouna": "ميمونة",
  "Zeinabou": "زينب",
  "Salka": "سالكة",
  "Coumba": "كومبا"
};

function translateName(nameStr) {
  if (!nameStr) return { firstNameAr: "", lastNameAr: "" };
  const words = nameStr.trim().split(/\s+/);
  if (words.length === 0) return { firstNameAr: "", lastNameAr: "" };
  
  const arWords = words.map(w => {
    const clean = w.replace(/^[O|o]\./, 'ولد').replace(/^[M|m]ed\b/, 'محمد');
    if (w === "O." || w === "o.") return "ولد";
    if (w === "Mint" || w === "mint") return "منت";
    if (w === "dit") return "الملقب";
    if (w === "EL" || w === "El" || w === "el") return "الـ";
    return nameTranslations[w] || clean;
  });

  const firstNameAr = arWords[0] || "";
  const lastNameAr = arWords.slice(1).join(" ") || "";
  return { firstNameAr, lastNameAr };
}

// Generate the 217+ official employees list
const employees = pdfData.map((row, idx) => {
  const empId = `EMP-${String(idx + 1).padStart(3, '0')}`;
  const deptInfo = departmentMap[row.deptCode] || {
    name: `Département ${row.deptCode}`,
    nameAr: `قسم ${row.deptCode}`,
    site: "Nouadhibou",
    bap: "SCIEN"
  };

  const nameParts = row.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || nameParts[0];

  const { firstNameAr, lastNameAr } = translateName(row.name);
  const grade = mapCategoryToGrade(row.cat, row.poste);
  const civility = row.gender === 'F' ? 'Madame' : 'Monsieur';
  const role = (row.poste.toLowerCase().includes('directeur général') || (deptInfo.code === 'SRH' && grade === 'cadre_superieur'))
    ? 'hr_admin'
    : (row.poste.toLowerCase().includes('directeur') || row.poste.toLowerCase().includes('chef') || row.poste.toLowerCase().includes('capitaine'))
      ? 'manager'
      : 'employee';

  const bankCode = bankCodeMap[row.bank] || '00012';
  const paddedAcc = String(row.account || '00000').replace(/\s+/g, '');
  const rib = `MR13 ${bankCode} 01001 ${paddedAcc.padStart(11, '0').slice(-11)} 45`;

  // Deterministic phone number based on idSys
  const phoneSuffix = 5000 + (row.idSys * 17) % 4999;
  const phone = `+222 45 74 ${String(phoneSuffix).slice(0, 2)} ${String(phoneSuffix).slice(2)}`;

  // Email format
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '') || 'agent';
  const cleanLast = lastName.toLowerCase().split(/\s+/)[0].replace(/[^a-z]/g, '') || 'imrop';
  const email = `${cleanFirst[0]}.${cleanLast}${row.idSys}@imrop.mr`;

  return {
    id: empId,
    matricule: row.matricule,
    civility,
    firstName,
    lastName,
    firstNameAr,
    lastNameAr,
    email,
    phone,
    department: deptInfo.name,
    departmentAr: deptInfo.nameAr,
    position: row.poste,
    positionAr: positionArMap[row.poste] || row.poste,
    grade,
    nni: String(row.nni || '0000000000'),
    bankName: row.bank,
    bankAccount: String(row.account || ''),
    rib,
    hireDate: formatDate(row.hireDate),
    birthDate: formatDate(row.birthDate),
    annualLeaveEntitlement: 30,
    remainingLeaveDays: 15 + (row.idSys % 15),
    categoryCode: row.cat,
    contractType: row.contract === 'FONC.' ? 'Fonctionnaire' : row.contract === 'CDI' ? 'CDI' : 'Contractuel',
    workSite: deptInfo.site,
    bap: deptInfo.bap,
    role,
    isActive: true
  };
});

// Generate departments list with real structure and positions
const departmentsList = Object.values(departmentMap).map(dept => {
  // Find all positions present in this department from real employees
  const deptEmployees = employees.filter(e => e.department === dept.name);
  const positionSet = new Map();
  
  deptEmployees.forEach(e => {
    if (!positionSet.has(e.position)) {
      positionSet.set(e.position, {
        fr: e.position,
        ar: e.positionAr,
        grade: e.grade,
        role: e.role,
        cat: e.categoryCode
      });
    }
  });

  return {
    id: dept.code,
    code: dept.code,
    name: dept.name,
    nameAr: dept.nameAr,
    site: dept.site,
    bap: dept.bap,
    positions: Array.from(positionSet.values())
  };
});

const fileContent = `import { Employee } from '../types';

export const imropDepartmentsList = ${JSON.stringify(departmentsList, null, 2)};

export const officialImropPersonnel: Employee[] = ${JSON.stringify(employees, null, 2)};
`;

fs.writeFileSync('./src/data/imropPersonnelData.ts', fileContent, 'utf8');

console.log(`Successfully generated src/data/imropPersonnelData.ts with ${employees.length} employees and ${departmentsList.length} departments!`);
