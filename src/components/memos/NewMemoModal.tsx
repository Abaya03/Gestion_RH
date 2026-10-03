import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MemoCategory, TargetAudience } from '../../types';
import { FileText, X, AlertCircle, Check, Users, Building, ShieldAlert } from 'lucide-react';

interface NewMemoModalProps {
  onClose: () => void;
}

export const NewMemoModal: React.FC<NewMemoModalProps> = ({ onClose }) => {
  const { language, t, employees, currentEmployee, createInternalMemo } = useApp();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [category, setCategory] = useState<MemoCategory>('administrative');
  const [content, setContent] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [targetDepartment, setTargetDepartment] = useState('Informatique & SI');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد عنوان المذكرة' : 'Veuillez saisir le titre de la note.');
      return;
    }
    if (!content.trim()) {
      setError(language === 'ar' ? 'يرجى كتابة نص المذكرة' : 'Veuillez rédiger le contenu de la note.');
      return;
    }

    createInternalMemo({
      title,
      titleAr: titleAr || undefined,
      category,
      content,
      contentAr: contentAr || undefined,
      targetAudience,
      targetDepartment: targetAudience === 'department' ? targetDepartment : undefined,
      effectiveDate,
      isUrgent,
      attachmentName: attachmentName || undefined,
      authorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      authorRole: currentEmployee.position
    });

    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto cursor-default relative my-auto"
      >
        {/* Header */}
        <div className="sticky -top-6 -mt-6 pt-6 -mx-6 px-6 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">{t('newMemo')}</h2>
              <p className="text-xs text-slate-500">{t('memoSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer (Échap)"
            className="p-2 text-slate-500 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Fermer</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titles in Fr & Ar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('memoTitleField')} * (Français)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mise en place des horaires d'été"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('memoTitleField')} (العربية - اختياري)
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: اعتماد توقيت العمل الصيفي"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="administrative">{t('cat_administrative')}</option>
                <option value="technical">{t('cat_technical')}</option>
                <option value="security">{t('cat_security')}</option>
                <option value="hr">{t('cat_hr')}</option>
                <option value="event">{t('cat_event')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('memoTargetAudience')} *
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">{t('target_all')}</option>
                <option value="department">{t('target_department')}</option>
                <option value="managers">{t('target_managers')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date d'effet
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {targetAudience === 'department' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Département concerné *
              </label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Content French & Arabic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('memoContent')} * (Français)
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez le texte officiel de la note de service..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('memoContent')} (العربية - اختياري)
            </label>
            <textarea
              rows={3}
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              placeholder="نص المذكرة باللغة العربية..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
              dir="rtl"
            />
          </div>

          {/* Urgent checkbox & attachment */}
          <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex-wrap gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Marquer comme Note Urgente / Prioritaire</span>
              </span>
            </label>

            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Nom pièce jointe (ex: Reglement.pdf)"
                className="text-xs p-1.5 bg-white border border-purple-200 rounded-lg w-full sm:w-56"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('btnPublishMemo')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
