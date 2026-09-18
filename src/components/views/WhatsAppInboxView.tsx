import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ClinicalSystemKey } from '../../types';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import {
  MessageSquare,
  Send,
  Search,
  Share2,
  ExternalLink,
  Smartphone,
  CheckCheck,
  Paperclip,
  Clock,
  Sparkles,
  ClipboardList,
  User,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

export const WhatsAppInboxView: React.FC = () => {
  const {
    conversations,
    selectedPatient,
    patients,
    activeSystemFormKey,
    openWhatsAppShareDialog,
    openRemoteIntakeModal,
    sendWhatsAppMessage,
    selectPatient,
    setActiveTab
  } = useClinic();

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [filterTag, setFilterTag] = useState<string>('All');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const filteredConversations = conversations.filter(c => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = filterTag === 'All' || c.category === filterTag;

    return matchesSearch && matchesTag;
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !activeConv) return;

    sendWhatsAppMessage(activeConv.id, typedMessage);
    setTypedMessage('');
  };

  const sendQuickTemplate = (templateType: string) => {
    if (!activeConv) return;

    let text = '';
    const ptId = activeConv.patientId || selectedPatient?.id || 'PT-1001';
    const sysKey = activeSystemFormKey || 'headache';

    if (templateType === 'intake_link') {
      const url = `${window.location.origin}/?pt=${ptId}&system=${sysKey}&mode=intake`;
      text = `Namaste ${activeConv.patientName}, Dr. Anand Deshpande requests you to fill your structured ${activeConv.category || 'Headache'} Case Taking questionnaire prior to consultation: ${url}`;
    } else if (templateType === 'appointment_reminder') {
      text = `Namaste ${activeConv.patientName}, this is a gentle reminder for your scheduled clinical consultation at ClinicaPro with Dr. Anand Deshpande today. Please bring any prior medical reports.`;
    } else if (templateType === 'prescription_followup') {
      text = `Hello ${activeConv.patientName}, please update us on your response to the prescribed homeopathic medicine. Are your headaches better or worse?`;
    }

    if (text) {
      sendWhatsAppMessage(activeConv.id, text);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WATI-Style WhatsApp Business API Active
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">Live Webhook Synced</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Remote WhatsApp Case Taking & Patient Inbox
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (activeConv) {
                const ptId = activeConv.patientId || selectedPatient?.id || 'PT-1001';
                openWhatsAppShareDialog(ptId, activeSystemFormKey || 'headache');
              }
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate Intake Link</span>
          </button>

          <button
            onClick={() => {
              if (activeConv) {
                const ptId = activeConv.patientId || selectedPatient?.id || 'PT-1001';
                openRemoteIntakeModal(ptId, activeSystemFormKey || 'headache');
              }
            }}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Test Mobile Intake</span>
          </button>
        </div>
      </div>

      {/* 2-Column WATI Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Column (4 Cols): Conversation List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/40">
          {/* Search & Filters */}
          <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px] pb-1">
              {['All', 'Headache', 'Skin & Hair', 'Gastrointestinal', 'General Enquiry'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    filterTag === tag
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {conv.patientName.replace(/(Mrs\.|Mr\.|Ms\.|Dr\.)\s*/, '').charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {conv.patientName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 truncate mb-1">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{conv.phone}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 font-medium">
                        {conv.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 Cols): Active Chat Stream & Messenger */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col bg-slate-100/40">
            {/* Chat Top Bar */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {activeConv.patientName.replace(/(Mrs\.|Mr\.|Ms\.|Dr\.)\s*/, '').charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {activeConv.patientName}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                      {activeConv.patientId}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {activeConv.phone} • WhatsApp Business Channel
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    selectPatient(activeConv.patientId);
                    setActiveTab('case_taking');
                  }}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-lg transition-colors border border-teal-200 flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Open Chart</span>
                </button>

                <button
                  onClick={() => {
                    selectPatient(activeConv.patientId);
                    setActiveTab('case_summary');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Summary</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Template Buttons Bar */}
            <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-medium shrink-0 ml-1">Quick Actions:</span>
              <button
                onClick={() => sendQuickTemplate('intake_link')}
                className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3 h-3 text-emerald-600" />
                <span>Send WhatsApp Case Taking Form</span>
              </button>
              <button
                onClick={() => sendQuickTemplate('appointment_reminder')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 whitespace-nowrap transition-colors"
              >
                Appointment Reminder
              </button>
              <button
                onClick={() => sendQuickTemplate('prescription_followup')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 whitespace-nowrap transition-colors"
              >
                Follow-up Check
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeConv.messages.map((msg) => {
                const isDoctor = msg.sender === 'doctor';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs space-y-1 shadow-xs ${
                        isDoctor
                          ? 'bg-emerald-700 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      <div
                        className={`flex items-center justify-end gap-1 text-[9px] pt-1 ${
                          isDoctor ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isDoctor && <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type WhatsApp message to patient..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};
