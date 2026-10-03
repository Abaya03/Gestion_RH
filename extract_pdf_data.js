import fs from 'fs';

// Department code mapping to full official names & Arabic names
const departmentMap = {
  "DIR": {
    name: "Direction Générale (DIR)",
    nameAr: "الإدارة العامة",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "DSR": {
    name: "Direction Scientifique et de la Recherche (DSR)",
    nameAr: "الإدارة العلمية والبحوث",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LERVA": {
    name: "Laboratoire d'Évaluation des Ressources Vivantes Aquatiques (LERVA)",
    nameAr: "مختبر تقييم الموارد الحية المائية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LEBOA": {
    name: "Laboratoire d'Écologie et de Biologie des Organismes Aquatiques (LEBOA)",
    nameAr: "مختبر بيئة وبيولوجيا الكائنات المائية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LEMMC": {
    name: "Laboratoire d'Étude des Milieux Marins et Côtiers (LEMMC)",
    nameAr: "مختبر دراسة الأوساط البحرية والساحلية",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "LESE": {
    name: "Laboratoire d'Écotoxicologie et Surveillance de l'Environnement (LESE)",
    nameAr: "مختبر علم السموم البيئية ومراقبة البيئة",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "CN": {
    name: "Station IMROP de Nouakchott (CN)",
    nameAr: "محطة المعهد بنواكشوط",
    site: "Nouakchott",
    bap: "SCIEN"
  },
  "SS": {
    name: "Station Sud & Pêche Continentale (SS)",
    nameAr: "محطة الجنوب والصيد القاري",
    site: "Boghé / Kaédi",
    bap: "SCIEN"
  },
  "AK": {
    name: "Station Banc d'Arguin (AK - Arkeiss/Iwik)",
    nameAr: "محطة حوض آرغين",
    site: "Banc d'Arguin",
    bap: "SCIEN"
  },
  "SAR": {
    name: "Service d'Armement et Navires de Recherche (SAR / N/R Al Awam)",
    nameAr: "مصلحة التجهيز وسفن البحوث (العوام)",
    site: "En mer / Port Nouadhibou",
    bap: "NAVAL"
  },
  "SAL": {
    name: "Service des Affaires Générales et Logistique (SAL)",
    nameAr: "مصلحة الشؤون العامة واللوجستيات",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SC": {
    name: "Service Comptabilité et Finances (SC)",
    nameAr: "مصلحة المحاسبة والمالية",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SRH": {
    name: "Service des Ressources Humaines (SRH)",
    nameAr: "مصلحة المصادر البشرية",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "SI": {
    name: "Service Informatique, SIG et Statistiques (SI)",
    nameAr: "مصلحة المعلوماتية ونظم المعلومات الجغرافية",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "SMT": {
    name: "Service Maintenance Technique et Ateliers (SMT)",
    nameAr: "مصلحة الصيانة الفنية والورش",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "STM": {
    name: "Service Technologies Marines (STM)",
    nameAr: "مصلحة التكنولوجيا البحرية",
    site: "Nouadhibou",
    bap: "TECH"
  },
  "CDIS": {
    name: "Centre de Documentation et Information Scientifique (CDIS)",
    nameAr: "مركز التوثيق والإعلام العلمي",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "CDI": {
    name: "Centre de Documentation et Information (CDI)",
    nameAr: "مركز التوثيق والإعلام",
    site: "Nouadhibou",
    bap: "ADMIN"
  },
  "COS": {
    name: "Cellule d'Océanographie Spatiale (COS)",
    nameAr: "خلية علم المحيطات الفضائي",
    site: "Nouadhibou",
    bap: "SCIEN"
  },
  "MPEM": {
    name: "Ministère Pêches & Économie Maritime / Détachement (MPEM)",
    nameAr: "وزارة الصيد والاقتصاد البحري / انتداب",
    site: "Nouakchott / Nouadhibou",
    bap: "ADMIN"
  }
};

// Map grade category to system grade
function mapCategoryToGrade(cat, poste) {
  const p = (poste || '').toLowerCase();
  const c = (cat || '').toUpperCase();
  if (c.startsWith('A1') || p.includes('directeur') || p.includes('inspecteur')) {
    if (c.includes('A1-11') && (p.includes('directeur') || p.includes('inspecteur'))) return 'cadre_superieur';
    if (p.includes('directeur')) return 'cadre_superieur';
    if (p.includes('chercheur') || p.includes('ingénieur') || p.includes('ingenieur')) return 'cadre';
    if (p.includes('observateur') || p.includes('tech')) return 'maitrise';
    return 'cadre';
  }
  if (c.startsWith('A2') || c.startsWith('ING')) {
    if (p.includes('directeur')) return 'cadre_superieur';
    return 'cadre';
  }
  if (c.startsWith('TA') || c.startsWith('TB') || c.startsWith('TC') || c.startsWith('GA') || c.startsWith('GB')) {
    return 'maitrise';
  }
  if (c.startsWith('SD') || c.startsWith('SC') || c.startsWith('GD') || c.startsWith('CD') || c.startsWith('TD') || c.startsWith('GC') || c.startsWith('HC') || c.startsWith('MD')) {
    return 'employe';
  }
  return 'employe';
}

console.log("Helper loaded");
