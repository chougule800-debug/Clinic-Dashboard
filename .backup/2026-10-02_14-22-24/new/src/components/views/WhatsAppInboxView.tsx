import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  MessageSquare, Send, Search, Smartphone, CheckCheck, Clock,
  ClipboardList, ChevronRight, Loader2
} from 'lucide-react';

const CATEGORY_TAGS = ['All', 'Patients', 'New enquiries', 'Follow-up', 'Appointment', 'Completed'];

export const WhatsAppInboxView: React.FC = () => {
  const {
    conversations, selectedPatient, activeSystemFormKey, openRemoteIntakeModal,
    sendWhatsAppMessage, markConversationAsRead, selectPatient, setActiveTab,
    setActiveSystemFormKey, currentUser
  } = useClinic();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [filterTag, setFilterTag] = useState<string>('All');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!activeConvId && conversations.length > 0) setActiveConvId(conversations[0].id);
  }, [conversations, activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? conversations[0] ?? null;

  useEffect(() => {
    if (activeConv && activeConv.unreadCount > 0) void markConversationAsRead(activeConv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'All' || c.category === filterTag;
    return matchesSearch && matchesTag;
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      await sendWhatsAppMessage(activeConv.id, typedMessage);
      setTypedMessage('');
    } finally {
      setSending(false);
    }
  };

  const sendQuickTemplate = async (templateType: string) => {
    if (!activeConv) return;
    const docName = currentUser?.name || 'Doctor';
    if (templateType === 'appointment_reminder') {
      await sendWhatsAppMessage(activeConv.id, `Namaste ${activeConv.patientName}, gentle reminder for your consultation with ${docName} today.`);
    } else if (templateType === 'prescription_followup') {
      await sendWhatsAppMessage(activeConv.id, `Hello ${activeConv.patientName}, please update us on your response to the prescribed medicine.`);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">No conversations yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Conversations appear here automatically when patients are registered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />Patient Messages
          </h2>
          <p className="text-xs text-slate-500">Send reminders and follow-up messages.</p>
        </div>
        {activeConv && activeConv.patientId && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openRemoteIntakeModal(activeConv.patientId!, activeSystemFormKey)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" /><span>Preview Form</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/40">
          <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto text-[11px] pb-1">
              {CATEGORY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    filterTag === tag ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No matching chats.</div>}
            {filteredConversations.map(conv => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {conv.patientName.replace(/(Mrs\.|Mr\.|Ms\.|Dr\.)\s*/, '').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{conv.patientName}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mb-1">{conv.lastMessage}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{conv.phone}</span>
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px]">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeConv ? (
          <div className="md:col-span-8 flex flex-col bg-slate-100/40">
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {activeConv.patientName.replace(/(Mrs\.|Mr\.|Ms\.|Dr\.)\s*/, '').charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{activeConv.patientName}</h3>
                  <div className="text-[11px] text-slate-500">{activeConv.phone}</div>
                </div>
              </div>
              {activeConv.patientId && (
                <button
                  onClick={() => { selectPatient(activeConv.patientId!); setActiveTab('case_taking'); }}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-lg border border-teal-200 flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />Open Chart
                </button>
              )}
            </div>

            <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-medium shrink-0 ml-1">Quick:</span>
              <button onClick={() => sendQuickTemplate('appointment_reminder')} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 whitespace-nowrap">
                Appointment Reminder
              </button>
              <button onClick={() => sendQuickTemplate('prescription_followup')} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 whitespace-nowrap">
                Follow-up Check
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeConv.messages.map(msg => {
                const isDoctor = msg.sender === 'doctor';
                return (
                  <div key={msg.id} className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs space-y-1 shadow-xs ${
                      isDoctor ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      {!isDoctor && msg.linkData?.type === 'case_intake' && (
                        <div className="pt-2 border-t border-slate-100 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const ptId = msg.linkData?.patientId || activeConv.patientId;
                              if (ptId) selectPatient(ptId);
                              if (msg.linkData?.system) setActiveSystemFormKey(msg.linkData.system);
                              setActiveTab('case_summary');
                            }}
                            className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />View Case Summary<ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className={`flex items-center justify-end gap-1 text-[9px] pt-1 ${isDoctor ? 'text-emerald-200' : 'text-slate-400'}`}>
                        <Clock className="w-2.5 h-2.5" /><span>{msg.timestamp}</span>
                        {isDoctor && <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={e => setTypedMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" disabled={sending || !typedMessage.trim()} className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">Select a conversation to start chatting.</div>
        )}
      </div>
      <span className="hidden">{selectedPatient?.id}</span>
    </div>
  );
};