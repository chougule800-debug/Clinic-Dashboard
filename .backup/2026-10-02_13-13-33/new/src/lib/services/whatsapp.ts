import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, ConversationStatus } from '../database.types';

export type ConversationRow = Tables<'whatsapp_conversations'>;
export type MessageRow = Tables<'whatsapp_messages'>;

export interface ConversationWithMessages extends ConversationRow {
  messages: MessageRow[];
}

export const whatsappService = {
  async listConversations(
    doctorId: string | null | undefined
  ): Promise<ConversationWithMessages[]> {
    requireUser(doctorId, 'list conversations');
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('*, whatsapp_messages(*)')
      .eq('doctor_id', doctorId!)
      .order('last_message_time', { ascending: false });
    if (error) throw new ServiceError('Fetch conversations failed', error);

    return (data ?? []).map(
      (conv: ConversationRow & { whatsapp_messages: MessageRow[] }) => ({
        ...conv,
        messages: (conv.whatsapp_messages ?? []).sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        )
      })
    );
  },

  async createConversation(
    doctorId: string | null | undefined,
    input: {
      patientId?: string | null;
      patientName: string;
      phone?: string | null;
      category?: string;
      lastMessage?: string;
    }
  ): Promise<ConversationRow> {
    requireUser(doctorId, 'create conversation');
    const payload: Inserts<'whatsapp_conversations'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId ?? null,
      patient_name: input.patientName,
      phone: input.phone ?? null,
      category: input.category ?? 'Patients',
      unread_count: 0,
      last_message: input.lastMessage ?? null,
      last_message_time: new Date().toISOString(),
      status: 'Pending'
    };
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create conversation failed', error);
    return data as ConversationRow;
  },

  async sendMessage(
    doctorId: string | null | undefined,
    conversationId: string,
    text: string,
    linkData?: Record<string, unknown>
  ): Promise<MessageRow> {
    requireUser(doctorId, 'send WhatsApp message');
    const payload: Inserts<'whatsapp_messages'> = {
      conversation_id: conversationId,
      doctor_id: doctorId!,
      sender: 'doctor',
      text,
      status: 'sent',
      link_data: (linkData ?? null) as never
    };
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Send message failed', error);

    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message: text,
        last_message_time: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('doctor_id', doctorId!);

    return data as MessageRow;
  },

  async appendIncomingMessage(
    conversationId: string,
    text: string,
    linkData?: Record<string, unknown>
  ): Promise<MessageRow> {
    const { data: conv, error: convErr } = await supabase
      .from('whatsapp_conversations')
      .select('doctor_id, unread_count')
      .eq('id', conversationId)
      .maybeSingle();
    if (convErr || !conv) throw new ServiceError('Conversation not found', convErr);

    const payload: Inserts<'whatsapp_messages'> = {
      conversation_id: conversationId,
      doctor_id: conv.doctor_id,
      sender: 'patient',
      text,
      link_data: (linkData ?? null) as never
    };
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Append message failed', error);

    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message: text,
        last_message_time: new Date().toISOString(),
        unread_count: (conv.unread_count ?? 0) + 1
      })
      .eq('id', conversationId);

    return data as MessageRow;
  },

  async markRead(
    doctorId: string | null | undefined,
    conversationId: string
  ): Promise<void> {
    requireUser(doctorId, 'mark conversation read');
    const { error } = await supabase
      .from('whatsapp_conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Mark conversation read');
  },

  async updateStatus(
    doctorId: string | null | undefined,
    conversationId: string,
    status: ConversationStatus
  ): Promise<void> {
    requireUser(doctorId, 'update conversation status');
    const { error } = await supabase
      .from('whatsapp_conversations')
      .update({ status })
      .eq('id', conversationId)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Update conversation status');
  }
};