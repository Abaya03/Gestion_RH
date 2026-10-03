import fs from 'fs';

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
    name: "Centre de Nouakchott (CN)",
    nameAr: "مركز نواكشوط",
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

const tokenMap = {
  "Abba": "أبّا",
  "Abd": "عبد",
  "Abdallahi": "عبد الله",
  "Abdarrahmane": "عبد الرحمن",
  "Abdel": "عبد",
  "Abderrahmane": "عبد الرحمن",
  "Abdi": "عبدي",
  "Abdou": "عبدو",
  "Abdoul": "عبد",
  "Abdoulaye": "عبد الله",
  "Abed": "عابد",
  "Abou": "أبو",
  "Aboud": "عبود",
  "Aboumediene": "أبو مدين",
  "Achamra": "الشامرة",
  "Adeba": "أديبا",
  "Ahmed": "أحمد",
  "Ahmedou": "أحمده",
  "Aicha": "عائشة",
  "Aichetou": "عائشة",
  "Aissata": "عيستة",
  "Alassane": "الحسن",
  "Ali": "علي",
  "Aliou": "عليو",
  "Alioune": "علي",
  "Allal": "علال",
  "Aly": "علي",
  "Amadou": "أمادو",
  "Aminetou": "آمنة",
  "Amma": "أمّا",
  "Arbi": "العربي",
  "Argueina": "أرغينه",
  "Asmaou": "أسماء",
  "Assane": "الحسن",
  "Ayih": "عييه",
  "Ayouba": "أيوب",
  "Azza": "عزة",
  "Ba": "با",
  "Baba": "بابا",
  "Babou": "بابو",
  "Bacar": "بكار",
  "Bady": "بادي",
  "Bah": "باه",
  "Bahi": "باهي",
  "Ball": "بال",
  "Bamba": "بمبا",
  "Bambaye": "بمباي",
  "Bar": "البار",
  "Barikallah": "بارك الله",
  "Baya": "باي",
  "Baye": "باي",
  "Bebih": "ببيه",
  "Bechir": "البشير",
  "Bedy": "بدي",
  "Beheitt": "بحيت",
  "Beibou": "بيبو",
  "Bestami": "البسطامي",
  "Beyahe": "بياه",
  "Beye": "بيه",
  "Beyih": "بيه",
  "Bilal": "بلال",
  "Birane": "بيران",
  "Bneya": "بنيّة",
  "Bnoun": "ابنون",
  "Bocar": "بوكار",
  "Boilil": "بويليل",
  "Bouh": "بوه",
  "Bouha": "بوها",
  "Boujoumaa": "بوجمعة",
  "Boukhary": "البخاري",
  "Boullahi": "بولاهي",
  "Bourweiss": "بورويس",
  "Bouvreiwa": "بوفريوة",
  "Bouya": "بويا",
  "Bouzouma": "بوزومة",
  "Bowba": "بوبه",
  "Boya": "بويا",
  "Braham": "ابراهم",
  "Brahim": "إبراهيم",
  "Breika": "ابريكة",
  "Chaabane": "شعبان",
  "Cheikh": "الشيخ",
  "Cheikhna": "شيخنا",
  "Cheikhou": "شيخو",
  "Chlouma": "شلومة",
  "Chouaib": "شعيب",
  "Chreif": "الشريف",
  "Ciré": "سيري",
  "Coumba": "كومبا",
  "Dah": "الداه",
  "Dammy": "دامي",
  "Dechagh": "دشاغ",
  "Deda": "دداه",
  "Dedah": "دداه",
  "Deddah": "دداه",
  "Dedde": "دده",
  "Dedeche": "ددش",
  "Dia": "ديا",
  "Diagne": "دياني",
  "Dialade": "ديالادي",
  "Diallo": "ديالو",
  "Dieng": "دينغ",
  "Diop": "ديوب",
  "Dièye": "ديي",
  "Djibril": "جبريل",
  "Djimera": "جيميرا",
  "Douh": "دوه",
  "Dy": "دي",
  "EL": "",
  "El": "",
  "Eba": "إبه",
  "Ebabeck": "أبابك",
  "Echvagha": "إشفاقه",
  "Edy": "إدي",
  "Ejiwen": "إجيوين",
  "Elewa": "عليوة",
  "Eleya": "عليّة",
  "Elimane": "عليمان",
  "Elmoustapha": "المصطفى",
  "Ely": "علي",
  "Emeihimid": "امحيميد",
  "Ememe": "إمّام",
  "Evteir": "افطير",
  "Fah": "فاه",
  "Fall": "فال",
  "Fally": "فالي",
  "Fatimata": "فاطمتا",
  "Fatimetou": "فاطمة",
  "Feitimatt": "فاطمة",
  "Gandéga": "غانديغا",
  "Ghailany": "غيلاني",
  "Greine": "كرينه",
  "Habatt": "هباط",
  "Habib": "حبيب",
  "Habibe": "حبيب",
  "Habiboillah": "حبيب الله",
  "Habott": "هبوط",
  "Haby": "هابي",
  "Hacen": "الحسن",
  "Hademine": "هادامين",
  "Hadramy": "الحضرامي",
  "Hady": "الهادي",
  "Hafedh": "الحافظ",
  "Haidalla": "هيدالة",
  "Haja": "الحاجة",
  "Hama": "حماه",
  "Hamady": "حمادي",
  "Hamam": "همّام",
  "Hamed": "حامد",
  "Hamet": "حاميت",
  "Hamiya": "حميّة",
  "Hamma": "همّا",
  "Hammoud": "حمود",
  "Hamoud": "حمود",
  "Hamza": "حمزة",
  "Harouna": "هارونا",
  "Hassan": "الحسن",
  "Heiba": "هيبة",
  "Hejbou": "حجبو",
  "Hemmed": "حمّد",
  "Hemoud": "حمود",
  "Hjour": "احجور",
  "Hmoudi": "حمودي",
  "Houssein": "الحسين",
  "Housseine": "الحسين",
  "Housseyne": "الحسين",
  "Ibra": "إبرا",
  "Ibrahim": "إبراهيم",
  "Idoumou": "إدومو",
  "Idrissa": "إدريسا",
  "Ismail": "إسماعيل",
  "Ismaila": "إسماعيلا",
  "Isselmou": "إسلم",
  "Jemal": "جمال",
  "Jiddou": "جدو",
  "Jiyed": "جيد",
  "Kadiata": "كادياتا",
  "Kerbally": "كربالي",
  "Kerim": "الكريم",
  "Khadijetou": "خديجة",
  "Khaihoum": "خيهوم",
  "Khairi": "خيري",
  "Khaitoura": "خيطورة",
  "Khaless": "خالص",
  "Khalifa": "الخليفة",
  "Khalil": "الخليل",
  "Khatry": "خطري",
  "Khattry": "خطري",
  "Khayarhoum": "خيرهم",
  "Khaye": "الخاي",
  "Khyar": "الخيار",
  "Kidé": "كيدي",
  "Kleithima": "كليثيمة",
  "Konté": "كونتي",
  "Kory": "الكوري",
  "Lam": "لام",
  "Lamba": "لامبا",
  "Lassana": "لاسانا",
  "Legraa": "لكرع",
  "Lekhal": "لكحل",
  "Lekoueiri": "لكويري",
  "Lemina": "لمينة",
  "Lemine": "لمين",
  "Lemrabott": "المرابط",
  "Limam": "الإمام",
  "Loutt": "لوط",
  "M'Ailim": "معيليم",
  "M'Bareck": "امبارك",
  "M'Beirickat": "امبيريكات",
  "M'Bengue": "امبينك",
  "M'Boirikatt": "امبيريكات",
  "M'Haimdatt": "امحيمدات",
  "M'Haimid": "امحيميد",
  "M'Heimid": "امحيميد",
  "MBeirika": "امبيريكة",
  "MBodj": "امبودج",
  "Madiakho": "مادياخو",
  "Mahfoudh": "محفوظ",
  "Mahmoud": "محمود",
  "Malal": "ملال",
  "Mamadou": "مامادو",
  "Mame": "مام",
  "Mamoune": "المأمون",
  "Mamy": "مامي",
  "Maouloud": "مولود",
  "Mariam": "مريم",
  "Marieme": "مريم",
  "Med": "محمد",
  "Mehdi": "المهدي",
  "Meihemid": "امحيميد",
  "Meiloud": "ميلود",
  "Meisse": "ميسه",
  "Messaoud": "مسعود",
  "Meynatt": "مينات",
  "Mih": "ميه",
  "Mint": "منت",
  "Moctar": "المختار",
  "Mohamed": "محمد",
  "Mohameden": "محمذن",
  "Mohamedou": "محمدو",
  "Moileck": "مويلك",
  "Mokhtar": "المختار",
  "Moubarrak": "مبارك",
  "Moujtaba": "المجتبى",
  "Moulaye": "مولاي",
  "Mounaya": "مناية",
  "Moussa": "موسى",
  "Moustapha": "المصطفى",
  "Moyhemid": "امحيميد",
  "N'Diaye": "انجاي",
  "N'Guiya": "انكيّة",
  "N'Tilitt": "انتليت",
  "NGaidé": "نغيدي",
  "Nabgha": "نابغة",
  "Nah": "الناه",
  "Najem": "ناجم",
  "Naji": "الناجي",
  "Nalla": "نله",
  "Navaa": "النفاع",
  "Nema": "النعمة",
  "Nene": "نينه",
  "Niang": "نيانغ",
  "Nouh": "نوح",
  "O.": "ولد",
  "O.Med": "ولد محمد",
  "Oumar": "عمر",
  "Ousmane": "عثمان",
  "Raki": "راكي",
  "Reyoug": "ريوغ",
  "Roughaya": "رقية",
  "SY": "سي",
  "Sy": "سي",
  "Sadegh": "صادق",
  "Saikou": "سيكو",
  "Saleck": "السالك",
  "Saleh": "صالح",
  "Salem": "سالم",
  "Sall": "صال",
  "Salma": "سلمى",
  "Samba": "صمبا",
  "Sarr": "سار",
  "Sedoum": "سدوم",
  "Semeta": "سمته",
  "Seyidi": "السيدي",
  "Seyidina": "سيدنا",
  "Sid'Ahmed": "سيد أحمد",
  "Sidi": "سيدي",
  "Sidina": "سيدين",
  "Sileymane": "سليمان",
  "Soueilim": "سويلم",
  "Soule": "صولي",
  "Souleymane": "سليمان",
  "Sow": "صو",
  "T'Feil": "تفعيل",
  "Taleb": "طالب",
  "Talla": "تالا",
  "Tarham": "ترهام",
  "Tem": "التام",
  "Thierno": "تيرنو",
  "Traore": "تراوري",
  "Vadhel": "الفاضل",
  "Vall": "فال",
  "Vally": "فالي",
  "Vetah": "فتاح",
  "Wagne": "وان",
  "Wagué": "واغي",
  "Wehna": "وهنه",
  "Weis": "ويس",
  "Wekalou": "وكلو",
  "Yahya": "يحيى",
  "Yarg": "يرك",
  "Yero": "ييرو",
  "Yeslem": "يسلم",
  "Youma": "يوما",
  "Zeidane": "زيدان",
  "dit": "الملقب",
  "kane": "كان",
  "konko": "كونكو"
};

const compoundFirstNamesAr = [
  "عبد الله", "عبد الرحمن", "عبد الكريم", "عبد الفتاح", "عبد القادر",
  "سيد أحمد", "سيدي محمد", "سيدي أحمد", "سيدي المختار", "سيدي يحيى",
  "محمد لمين", "محمد الأمين", "محمد محمود", "محمد سالم", "محمد المصطفى",
  "محمد المختار", "محمد عبد الله", "محمد الحافظ", "محمد الشيخ", "محمد يحيى",
  "محمد السالك", "محمد البشير", "محمد المأمون", "محمد الخليل", "محمد نوح",
  "محمد أحمده", "محمد أحمد", "محمد فال", "محمد خيري", "محمد إبراهيم",
  "الشيخ باي", "الشيخ محمد", "الشيخ عمر", "الشيخ عبد الله", "الشيخ عبد",
  "بابا أحمد", "أحمد سالم", "أحمد فال", "أحمد سيدي", "أحمد الناه",
  "أحمد محمود", "أحمد محمد", "أحمد خطري", "أحمده محمد", "أحمده سيد أحمد",
  "علي الشيخ", "سيدنا موسى", "آمنة محمد سالم", "عزة أحمد الشيخ",
  "فاطمة خيطورة", "فاطمتا أيوب", "فاطمتا عمر", "فاطمة منت", "خديجة منت",
  "عيستة مامادو", "عيستة ييرو", "مريم بوجمعة", "مريم منت", "أمادو هارونا",
  "أمادو عبد الرحمن", "بويا عبد الرحمن", "مامادو عبد", "مامادو لامبا", "مامادو موسى",
  "صمبا الحسن", "سليمان تيرنو", "الخليفة بولاهي", "باه محمد محمود"
];

function translateFullName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const arabicWords = [];
  
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i];
    
    if ((p === "EL" || p === "El") && i + 1 < parts.length) {
      const nextWord = parts[i + 1];
      const translatedNext = tokenMap[nextWord] || nextWord;
      const combined = translatedNext.startsWith("ال") ? translatedNext : ("ال" + translatedNext);
      arabicWords.push(combined);
      i++;
      continue;
    }

    if (p === "O.Med" || p === "O.med") {
      arabicWords.push("ولد", "محمد");
      continue;
    }

    if (p.startsWith("O.") && p.length > 2) {
      const rest = p.slice(2);
      arabicWords.push("ولد");
      if (tokenMap[rest]) arabicWords.push(tokenMap[rest]);
      continue;
    }

    const tr = tokenMap[p] !== undefined ? tokenMap[p] : p;
    if (tr) arabicWords.push(tr);
  }

  return arabicWords.join(" ");
}

function splitArabicName(fullAr) {
  for (const comp of compoundFirstNamesAr) {
    if (fullAr.startsWith(comp + " ")) {
      return {
        firstNameAr: comp,
        lastNameAr: fullAr.slice(comp.length).trim()
      };
    }
  }
  const words = fullAr.split(" ");
  return {
    firstNameAr: words[0] || "",
    lastNameAr: words.slice(1).join(" ") || ""
  };
}

const compoundFirstNamesFr = [
  "Abdallahi", "Abdel Kerim", "Abdou Mohamed", "Abdoulaye Cheikhou", "Abou Ciré",
  "Ahmed Nah", "Ahmed Mohamed", "Ahmed Saleck", "Ahmed Sidi", "Ahmedou Mohamed",
  "Ahmedou Sid'Ahmed", "Amadou Harouna", "Aminetou Mohamed Salem", "Assane Deda",
  "Azza Ahmed Cheikh", "Baba Ahmed Cheikh", "Bahi Beye", "Bambaye Hamady",
  "Beyahe Meisse", "Beyih Mohamed", "Bouya Abdarrahmane", "Brahim Mohamed",
  "Cheikh Baye", "Cheikh Mohamed", "Cheikhna Yero", "Dah Alioune",
  "Dedah Ahmed", "Dedde Mohamed", "Dedeche Saleck", "Diagne Ahmed",
  "Djimera Lassana", "EL Khalifa", "EL Moctar", "Elimane Abou", "Ely Sidi",
  "Fah Mohamedou", "Fatimetou Khaitoura", "Hammoud EL Vadhel", "Hamoud Taleb",
  "Lemina Sidi", "Mamadou Abdoul", "Mamadou Lamba", "Marieme Boujoumaa",
  "MBeirika Ahmed Salem", "MBodj Oumar", "Meiloud Ahmed Salem",
  "Mohamed Abdallahi", "Mohamed Ali", "Mohamed Aly", "Mohamed Cheikh",
  "Mohamed EL Bechir", "Mohamed EL Mamoune", "Mohamed Elmoustapha",
  "Mohamed Mahmoud", "Mohamed EL Hafedh", "Mohamed O. Ahmed", "Mohamed Mahfoudh",
  "Mohamed Saleck", "Mohamed Salem", "Mohamed Yahya", "Moulaye Mohamed",
  "Nabgha Moustapha", "Oumar Hamet", "Saikou Oumar", "Salma Mint",
  "Samba Alassane", "Sidi Ahmed", "Sidi EL Moctar", "Sidi Mohamed",
  "Sidi Yahya", "Souleymane M'Ailim", "Wagne Amadou", "Yahya Baba",
  "Yeslem Mohamed", "EL Hadramy", "EL Houssein", "EL Kory", "EL Mamy",
  "Ely Cheikh", "Fatimata Ayouba", "Fatimata Oumar", "Greine Mint",
  "Hama Hamoud", "Hamam Mamadou", "Hamza Sid'Ahmed", "Idrissa Moussa",
  "Ismaila Samba", "Jemal Abderrahmane", "Kadiata Bocar", "Khadijetou Mint",
  "Khadijetou Mohamed", "Kleithima Mint", "Lemrabott Abdallahi",
  "Mame Raki", "Mariam Amadou", "Marieme Mint", "Mehdi O.", "Moctar O.",
  "Mohamed Abderrahmane", "Mohamed Ahmed", "Mohamed Brahim", "Mohamed EL Boukhary",
  "Mohamed EL Mokhtar", "Mohamed EL Moustapha", "Mohamed Nouh", "Mohamedou Moctar",
  "Mohamedou Mohameden", "Mounaya Mohamed", "Moussa Abdoulaye", "Moussa Moctar",
  "Naji Mohamed", "Naji O.", "Nema O.", "NGaidé Bocar", "N'Guiya Mint",
  "Oumar Abdoulaye", "Oumar Samba", "Roughaya Mint", "Seyidina Moussa",
  "Sid'Ahmed Ahmed", "Sid'Ahmed Mohamed Saleck", "Sid'Ahmed O.", "Sidi N'Diaye",
  "Sidi Sid'Ahmed", "Sidina Abba", "Sidina O.", "Sileymane Thierno",
  "Tarham Bouha", "Traore Mamadou", "Zeidane O.", "Mohamed EL Khalil",
  "Habiboillah Mohameden", "Ememe Mohamed", "EL Moujtaba Mohamed", "Bah Mohamed Mahmoud"
];

function splitFrenchName(fullName) {
  for (const comp of compoundFirstNamesFr) {
    if (fullName.toLowerCase().startsWith(comp.toLowerCase() + " ")) {
      return {
        firstName: comp,
        lastName: fullName.slice(comp.length).trim()
      };
    }
  }
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || parts[0] || ""
  };
}

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

// Generate the 217 official employees list
const employees = pdfData.map((row, idx) => {
  const empId = `EMP-${String(idx + 1).padStart(3, '0')}`;
  const deptInfo = departmentMap[row.deptCode] || {
    name: `Département ${row.deptCode}`,
    nameAr: `قسم ${row.deptCode}`,
    site: "Nouadhibou",
    bap: "SCIEN"
  };

  const { firstName, lastName } = splitFrenchName(row.name);
  const fullAr = translateFullName(row.name);
  const { firstNameAr, lastNameAr } = splitArabicName(fullAr);
  
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

  // Realistic phone number
  const phoneSuffix = 5000 + (row.idSys * 19) % 4990;
  const phone = `+222 45 74 ${String(phoneSuffix).slice(0, 2)} ${String(phoneSuffix).slice(2)}`;

  // Email format
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '') || 'agent';
  const cleanLast = lastName.toLowerCase().split(/\s+/).filter(w => !['o.', 'mint', 'el', 'dit', 'de', 'du'].includes(w)).pop()?.replace(/[^a-z]/g, '') || 'imrop';
  const email = `${cleanFirst}.${cleanLast}@imrop.mr`;

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
