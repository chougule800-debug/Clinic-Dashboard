import React, { useEffect, useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { customFormService, type QuestionDraft } from '../../lib/services/customForms';
import { shareTokenService } from '../../lib/services/shareTokens';
import type { ClinicalSystemKey, QuestionType } from '../../types';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Save,
  Eye,
  Share2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Lock,
  FileText,
  ListChecks,
  Upload,
  Type as TypeIcon,
  Calendar,
  Clock,
  Hash,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface CustomFormsBuilderProps {
  systemKey: ClinicalSystemKey;
  patientId?: string | null;
  onClose?: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'short_text', label: 'Short Text', icon: TypeIcon },
  { value: 'long_text', label: 'Long Text', icon: MessageSquare },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'time', label: 'Time', icon: Clock },
  { value: 'single_choice', label: 'Single Choice', icon: ListChecks },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: ListChecks },
  { value: 'dropdown', label: 'Dropdown', icon: ListChecks },
  { value: 'yes_no', label: 'Yes / No', icon: CheckCircle2 },
  { value: 'image_upload', label: 'Image Upload', icon: Upload },
  { value: 'multiple_image_upload', label: 'Multiple Images', icon: Upload },
  { value: 'file_upload', label: 'File Upload', icon: Upload },
  { value: 'section_text', label: 'Section Info', icon: FileText }
];

const defaultQuestionFor = (type: QuestionType): QuestionDraft => ({
  questionType: type,
  label: '',
  helpText: '',
  isRequired: false,
  options:
    type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown'
      ? [{ label: 'Option 1' }, { label: 'Option 2' }]
      : []
});

export const CustomFormsBuilder: React.FC<CustomFormsBuilderProps> = ({
  systemKey,
  patientId,
  onClose
}) => {
  const { currentUser, patients, openWhatsAppShareDialog } = useClinic();

  const [forms, setForms] = useState<Array<{ id: string; title: string; description: string | null }>>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [title, setTitle] = useState('Custom Case Questions');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [shareMessage, setShareMessage] = useState<string>('');

  const loadForm = async (formId: string) => {
    setLoading(true);
    try {
      const form = await customFormService.getWithLatestVersion(formId);
      if (form) {
        setActiveFormId(form.id);
        setTitle(form.title);
        setDescription(form.description ?? '');
        const qs: QuestionDraft[] = (form.latest_version?.questions ?? []).map(q => ({
          id: q.id,
          questionType: q.question_type,
          label: q.label,
          helpText: q.help_text ?? '',
          isRequired: q.is_required,
          config: (q.config as Record<string, unknown>) ?? {},
          options: q.options.map(o => ({ id: o.id, label: o.label }))
        }));
        setQuestions(qs);
      }
    } catch (err) {
      console.warn('[CustomFormsBuilder] load failed', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormList = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await customFormService.listForDoctor(currentUser.id, systemKey);
      setForms(list.map(f => ({ id: f.id, title: f.title, description: f.description })));
      if (list.length > 0 && !activeFormId) {
        await loadForm(list[0].id);
      } else if (list.length === 0) {
        setActiveFormId(null);
        setTitle('Custom Case Questions');
        setDescription('');
        setQuestions([]);
      }
    } catch (err) {
      console.warn('[CustomFormsBuilder] list failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFormList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemKey, currentUser?.id]);

  const addQuestion = (type: QuestionType) => {
    setQuestions(prev => [...prev, defaultQuestionFor(type)]);
  };

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index: number) => {
    setQuestions(prev => {
      const copy: QuestionDraft = JSON.parse(JSON.stringify(prev[index]));
      copy.id = undefined;
      if (copy.options) copy.options = copy.options.map(o => ({ label: o.label }));
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  };

  const moveQuestion = (index: number, delta: number) => {
    setQuestions(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...(q.options ?? []), { label: `Option ${(q.options?.length ?? 0) + 1}` }] }
          : q
      )
    );
  };

  const updateOption = (qIndex: number, oIndex: number, label: string) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: (q.options ?? []).map((o, oi) => (oi === oIndex ? { ...o, label } : o))
            }
          : q
      )
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: (q.options ?? []).filter((_, oi) => oi !== oIndex) } : q
      )
    );
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError('Please enter a form title.');
      return;
    }
    const validQuestions = questions.filter(q => q.label.trim() || q.questionType === 'section_text');
    if (validQuestions.length === 0) {
      setError('Add at least one question.');
      return;
    }
    setSaving(true);
    try {
      const res = await customFormService.saveFormWithQuestions(currentUser.id, {
        formId: activeFormId ?? undefined,
        systemKey,
        title: title.trim(),
        description: description.trim() || undefined,
        questions: validQuestions,
        publish: true
      });
      setActiveFormId(res.form.id);
      setSuccess('Form saved. Patients will see this version on next share.');
      await loadFormList();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!currentUser || !activeFormId) {
      setError('Save the form first before sharing.');
      return;
    }
    if (!patientId) {
      setError('Select a patient first, then share this form.');
      return;
    }
    try {
      const tokenRow = await shareTokenService.create(currentUser.id, {
        patientId,
        systemKey,
        formId: activeFormId,
        shareType: 'custom_form',
        expiresInDays: 30
      });
      const origin = window.location.origin + window.location.pathname;
      const link = `${origin}?token=${encodeURIComponent(tokenRow.token)}&view=custom_form`;
      const patient = patients.find(p => p.id === patientId);
      const message =
        `Hello ${patient?.name ?? 'Patient'}, ${currentUser.name} has sent you a custom case form.\n\n` +
        `Please fill it here:\n${link}`;
      setShareLink(link);
      setShareMessage(message);
      setShowShareDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link.');
    }
  };

  const handlePreviewWhatsApp = async () => {
    if (!patientId) return;
    if (activeFormId) {
      await handleShare();
    } else {
      // legacy intake share
      await openWhatsAppShareDialog(patientId, systemKey);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Custom Form Builder</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create doctor-authored questions for this clinical system. Stored in cloud, saved per form version.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {forms.length > 0 && (
            <select
              value={activeFormId ?? ''}
              onChange={e => e.target.value && loadForm(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="">+ New Form</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveFormId(null);
              setTitle('Custom Case Questions');
              setDescription('');
              setQuestions([]);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 flex items-center justify-center text-xs text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading custom forms...
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Form title"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {questions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No questions yet. Add one from the palette below.
              </div>
            )}
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Q{qIdx + 1}
                  </span>
                  <select
                    value={q.questionType}
                    onChange={e =>
                      updateQuestion(qIdx, {
                        questionType: e.target.value as QuestionType
                      })
                    }
                    className="text-[11px] border border-slate-300 rounded-md px-1.5 py-0.5 bg-white"
                  >
                    {QUESTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIdx, -1)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIdx, 1)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateQuestion(qIdx)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.label}
                  onChange={e => updateQuestion(qIdx, { label: e.target.value })}
                  placeholder="Question text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />

                <input
                  type="text"
                  value={q.helpText ?? ''}
                  onChange={e => updateQuestion(qIdx, { helpText: e.target.value })}
                  placeholder="Helper text (optional)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none bg-white"
                />

                {(q.questionType === 'single_choice' ||
                  q.questionType === 'multiple_choice' ||
                  q.questionType === 'dropdown') && (
                  <div className="space-y-1.5 pl-2">
                    {(q.options ?? []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qIdx, oIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add option
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.isRequired ?? false}
                    onChange={e => updateQuestion(qIdx, { isRequired: e.target.checked })}
                    className="accent-indigo-600"
                  />
                  <span>Required field</span>
                </label>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">
              Add Question
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUESTION_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => addQuestion(t.value)}
                    className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Icon className="w-3 h-3 text-indigo-600" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 flex-wrap">
            {patientId && (
              <button
                type="button"
                onClick={handlePreviewWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share via WhatsApp
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      )}

      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                Share Custom Form
              </h3>
              <button
                onClick={() => setShowShareDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Secure token-based link. Patient sees only this form.
            </div>
            <input
              readOnly
              value={shareLink}
              className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
            />
            <textarea
              readOnly
              value={shareMessage}
              rows={4}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(shareLink);
                }}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-semibold"
              >
                Copy Link
              </button>
              <a
                href={`https://wa.me/${(patients.find(p => p.id === patientId)?.mobile ?? '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Open WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};