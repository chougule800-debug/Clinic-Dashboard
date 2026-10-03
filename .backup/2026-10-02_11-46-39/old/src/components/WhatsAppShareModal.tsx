import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  FileText,
  Receipt,
  Lock
} from 'lucide-react';

export const WhatsAppShareModal: React.FC = () => {
  const {
    whatsAppShareDialog,
    closeWhatsAppShareDialog,
    patients,
    openRemoteIntakeModal
  } = useClinic();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!whatsAppShareDialog || !whatsAppShareDialog.isOpen) return null;

  const {
    type = 'intake',
    patientId,
    system = 'headache',
    phone,
    link,
    messageText,
    title,
    subtitle
  } = whatsAppShareDialog;

  const patient = patients.find(p => p.id === patientId);

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'prescription':
        return <FileText className="w-5 h-5" />;
      case 'billing':
        return <Receipt className="w-5 h-5" />;
      default:
        return <Share2 className="w-5 h-5" />;
    }
  };

  const getHeaderTheme = () => {
    switch (type) {
      case 'prescription':
        return 'bg-teal-700';
      case 'billing':
        return 'bg-emerald-800';
      default:
        return 'bg-emerald-700';
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;
    switch (type) {
      case 'prescription':
        return 'WhatsApp Digital Prescription Link';
      case 'billing':
        return 'WhatsApp Billing Receipt Link';
      default:
        return 'WhatsApp Remote Case Taking Link';
    }
  };

  const getDefaultSubtitle = () => {
    if (subtitle) return subtitle;
    switch (type) {
      case 'prescription':
        return `Official prescription for ${patient?.name || 'Patient'}`;
      case 'billing':
        return `Official invoice receipt for ${patient?.name || 'Patient'}`;
      default:
        return `Remote symptom intake for ${patient?.name || 'Patient'} (${system.replace('_', ' ')})`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div
        id="modal-whatsapp-share-link"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`px-5 py-4 ${getHeaderTheme()} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="font-bold text-base">{getDefaultTitle()}</h3>
              <p className="text-xs text-emerald-100">
                {getDefaultSubtitle()}
              </p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppShareDialog}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Patient Details & Phone */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Recipient Patient</div>
              <div className="font-bold text-slate-800 text-sm">{patient?.name}</div>
              <div className="text-slate-500 text-xs">WhatsApp: {phone || 'Not recorded'}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 capitalize">
              {type === 'prescription'
                ? 'Prescription Only'
                : type === 'billing'
                ? 'Billing Receipt Only'
                : `${system.replace('_', ' ')} Form`}
            </span>
          </div>

          {/* Shareable Link Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Patient Standalone Link (Opens ONLY this {type === 'prescription' ? 'prescription' : type === 'billing' ? 'receipt' : 'form'})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link}
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Formatted WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Pre-formatted WhatsApp Message</label>
              <button
                onClick={handleCopyMessage}
                className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 text-[11px]"
              >
                {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Copied Message' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-36 overflow-y-auto">
              {messageText}
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="pt-2 space-y-2">
            {/* Primary WhatsApp Direct Send */}
            <a
              id="link-open-whatsapp-web"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs text-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp ({phone})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Test Standalone Patient View in a new tab */}
            <a
              id="btn-preview-patient-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>
                {type === 'prescription'
                  ? 'Preview Patient Prescription View (New Tab)'
                  : type === 'billing'
                  ? 'Preview Patient Receipt View (New Tab)'
                  : 'Preview Patient Case Form View (New Tab)'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <div className="text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/80 flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Patient Privacy Guarantee:</strong> When the patient opens this link, <strong>only</strong> this {type === 'prescription' ? 'prescription' : type === 'billing' ? 'receipt' : 'form'} is displayed. The doctor dashboard, sidebar, and other patient records are completely hidden.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
