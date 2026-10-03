import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';
import { UserRole } from '../../types';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Languages, 
  X,
  Phone,
  Mail,
  Shield,
  Compass,
  Briefcase
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { 
    companySettings, 
    language, 
    setLanguage, 
    employees, 
    setCurrentEmployeeId, 
    setUserRole,
    setIsAuthenticated 
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Quick profiles for instant one-click login testing
  const demoProfiles = [
    {
      id: 'admin',
      role: 'hr_admin' as UserRole,
      titleFr: 'Direction & RH',
      titleAr: 'الإدارة والموارد البشرية',
      empId: 'EMP-034',
      name: 'EL Khalifa Boullahi EL Hacen',
      desc: 'Chef Service RH & Logistique (SAL)',
      username: 'admin.srh@imrop.mr',
      defaultPass: 'Imrop2026@',
      badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
    },
    {
      id: 'manager',
      role: 'manager' as UserRole,
      titleFr: 'Responsable N+1',
      titleAr: 'المسؤول المباشر N+1',
      empId: 'EMP-002',
      name: 'Dr. Mohamed EL Hafedh Ejiwen',
      desc: 'Directeur Scientifique Adjoint',
      username: 'direction.scientifique@imrop.mr',
      defaultPass: 'Imrop2026@',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
    },
    {
      id: 'employee',
      role: 'employee' as UserRole,
      titleFr: 'Collaborateur',
      titleAr: 'باحث / موظف',
      empId: 'EMP-003',
      name: 'Chercheur Océanographe',
      desc: 'Laboratoire Océanographie Physique',
      username: 'chercheur@imrop.mr',
      defaultPass: 'Imrop2026@',
      badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
    }
  ];

  const handleSelectDemo = (profile: typeof demoProfiles[0]) => {
    setUsername(profile.username);
    setPassword(profile.defaultPass);
    setErrorMessage(null);
  };

  const handleDirectDemoLogin = (profile: typeof demoProfiles[0]) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find employee
      const emp = employees.find(e => e.id === profile.empId) || employees[0];
      setCurrentEmployeeId(emp.id);
      setUserRole(profile.role);
      setIsAuthenticated(true);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسم المستخدم أو الرقم الاستدلالي' : "Veuillez saisir votre nom d'utilisateur ou matricule.");
      return;
    }

    if (!password) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال كلمة المرور' : "Veuillez saisir votre mot de passe.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Look up matching employee by email, matricule, or name
      const matchedEmp = employees.find(e => {
        const matchEmail = e.email && e.email.toLowerCase() === cleanUser;
        const matchMatricule = e.matricule && e.matricule.toLowerCase() === cleanUser;
        const matchName = `${e.firstName} ${e.lastName}`.toLowerCase().includes(cleanUser);
        const matchNni = e.nni === cleanUser;
        return matchEmail || matchMatricule || matchName || matchNni;
      });

      if (matchedEmp || cleanUser === 'admin' || cleanUser === 'rh' || cleanUser.includes('imrop')) {
        const empToLogin = matchedEmp || employees.find(e => e.role === 'hr_admin') || employees[0];
        const roleToAssign = empToLogin.role || (empToLogin.grade === 'cadre_superieur' ? 'hr_admin' : 'manager');

        setCurrentEmployeeId(empToLogin.id);
        setUserRole(roleToAssign);
        setIsAuthenticated(true);
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage(
          language === 'ar'
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق أو اختيار حساب تجريبي.'
            : "Identifiant ou mot de passe incorrect. Vous pouvez utiliser l'un des profils rapides ci-dessous."
        );
      }
    }, 600);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-950 text-slate-100 overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Ambient Maritime & Luxury Deep Blue Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-600/10 rounded-full blur-3xl" />
        
        {/* Subtle geometric maritime grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Top Header Bar with Republic Identity & Language Switcher */}
      <header className="fixed top-0 left-0 right-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
              {language === 'ar' ? 'الجمهورية الإسلامية الموريتانية' : 'République Islamique de Mauritanie'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {language === 'ar' ? 'شرف • إخاء • عدالة' : 'Honneur • Fraternité • Justice'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer backdrop-blur-sm"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>
        </div>
      </header>

      {/* Main Chic Authentication Card Container */}
      <div className="relative z-10 w-full max-w-5xl my-16 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/80">
        
        {/* LEFT COLUMN: Corporate Prestige & Oceanographic Research Branding (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
          {/* Atmospheric subtle radial glow inside card */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            {/* Logo Emblem & Badges */}
            <div className="flex items-center gap-4">
              <CompanyLogo size="xl" />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Portail Officiel RH</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {companySettings.acronym || 'IMROP'}
                </h1>
              </div>
            </div>

            {/* Full Official Institution Name in French and Arabic */}
            <div className="space-y-2 border-l-2 border-cyan-500/60 pl-3.5 py-0.5">
              <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                {companySettings.name || "Institut Mauritanien de Recherches Océanographiques et des Pêches"}
              </p>
              <p className="text-xs sm:text-sm font-bold text-cyan-300/90 font-serif leading-relaxed text-right dir-rtl">
                {companySettings.nameAr || "المعهد الموريتاني لبحوث المحيطات والصيد"}
              </p>
            </div>

            {/* Ministry / Supervised By */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'تحت وصاية' : 'Sous la tutelle de'}
              </span>
              <p className="text-xs text-slate-300 font-medium">
                {companySettings.ministryName || "Ministère des Pêches, des Infrastructures Maritimes et Portuaires"}
              </p>
            </div>

            {/* Value Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Gestion automatisée des Ordres & Frais de Mission</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span>Calcul conforme des barèmes MRU & indemnités</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span>Workflow hiérarchique et visas électroniques certifiés</span>
              </div>
            </div>
          </div>

          {/* Footer inside Left Col */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono text-slate-500">Nouadhibou • Mauritanie</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Système Actif v4.2
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Ultra-Chic Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-slate-900/50">
          <div>
            {/* Form Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase block mb-1">
                  {language === 'ar' ? 'تسجيل الدخول الآمن' : 'Authentification Sécurisée'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {language === 'ar' ? 'مرحبًا بك في فضاء العمل' : 'Bienvenue sur votre espace RH'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'أدخل اسم المستخدم أو الرقم الاستدلالي وكلمة المرور للدخول إلى حسابك.'
                    : 'Veuillez renseigner vos identifiants institutionnels IMROP pour vous connecter.'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Error Notification banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Interactive Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'ar' ? 'اسم المستخدم / الرقم الاستدلالي أو البريد' : "Nom d'utilisateur / Matricule ou Email *"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={language === 'ar' ? 'مثال: admin.srh@imrop.mr أو IMROP-034' : 'Ex: admin.srh@imrop.mr ou IMROP-034'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ar' ? 'كلمة المرور *' : 'Mot de passe *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/60 border border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    {language === 'ar' ? 'تذكرني على هذا الجهاز' : 'Rester connecté sur cet appareil'}
                  </span>
                </label>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>SSL 256-bit</span>
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جارٍ التحقق من الهوية...' : 'Connexion en cours...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ar' ? 'دخول إلى النظام' : 'Se Connecter à l’Espace RH'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Bar (One-Click Testing) */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{language === 'ar' ? 'دخول تجريبي سريع بضغطة واحدة' : 'Accès Rapide Démo (1-Click)'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Sélectionner un profil</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoProfiles.map((dp) => (
                  <button
                    key={dp.id}
                    type="button"
                    onClick={() => handleDirectDemoLogin(dp)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 text-start transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dp.badgeColor}`}>
                        {language === 'ar' ? dp.titleAr : dp.titleFr}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {dp.name.split(' ')[0]} {dp.name.split(' ')[1] || ''}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {dp.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Security / Copyright Notice */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} {companySettings.acronym || 'IMROP'} • Tous droits réservés</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-slate-400 transition-colors">Politique de confidentialité</span>
              <span>•</span>
              <span className="hover:text-slate-400 transition-colors">Support SRH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Assistance Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">
                  {language === 'ar' ? 'المساعدة واسترجاع الحساب' : 'Récupération du mot de passe'}
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                {language === 'ar'
                  ? 'لأسباب أمنية، تتم إدارة كلمات المرور وتعيين الصلاحيات حصريًا عبر مصلحة الموارد البشرية واللوجستية (SRH).'
                  : "Pour des raisons de sécurité institutionnelle, la réinitialisation de vos identifiants est gérée par le Service des Ressources Humaines & Logistique (SAL / SRH)."}
              </p>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  Contact Administratif IMROP
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono">{companySettings.email || 'direction@imrop.mr'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono">{companySettings.phone || '+222 45 74 51 24'}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Conseil : En mode démonstration, vous pouvez utiliser le mot de passe générique <strong className="text-white font-mono">Imrop2026@</strong> ou cliquer sur l'un des profils rapides.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Compris, fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
