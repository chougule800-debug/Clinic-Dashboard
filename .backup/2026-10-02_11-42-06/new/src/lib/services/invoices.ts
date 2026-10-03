import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, PaymentMode, PaymentStatus } from '../database.types';

export type InvoiceRow = Tables<'invoices'>;
export type InvoiceItemRow = Tables<'invoice_items'>;

export interface InvoiceWithItems extends InvoiceRow {
  invoice_items: InvoiceItemRow[];
}

export interface InvoiceCreateInput {
  patientId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  items?: { description: string; amount: number }[];
  consultationFee?: number;
  medicineCharges?: number;
  discount?: number;
  totalAmount?: number;
  paymentMode?: PaymentMode;
  status?: PaymentStatus;
}

const invoiceSelect = '*, invoice_items(*)';

async function nextInvoiceNumber(doctorId: string): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) return `INV-${Date.now()}`;
  const last = data?.[0]?.invoice_number ?? '';
  const match = last.match(/(\d+)$/);
  const next = match ? parseInt(match[1], 10) + 1 : 1001;
  return `INV-${next}`;
}

export const invoiceService = {
  async list(doctorId: string | null | undefined): Promise<InvoiceWithItems[]> {
    requireUser(doctorId, 'list invoices');
    const { data, error } = await supabase
      .from('invoices')
      .select(invoiceSelect)
      .eq('doctor_id', doctorId!)
      .order('invoice_date', { ascending: false });
    return (handle(data ?? [], error, 'Fetch invoices') as InvoiceWithItems[]) ?? [];
  },

  async listForPatient(
    doctorId: string | null | undefined,
    patientId: string
  ): Promise<InvoiceWithItems[]> {
    requireUser(doctorId, 'list patient invoices');
    const { data, error } = await supabase
      .from('invoices')
      .select(invoiceSelect)
      .eq('doctor_id', doctorId!)
      .eq('patient_id', patientId)
      .order('invoice_date', { ascending: false });
    return (handle(data ?? [], error, 'Fetch patient invoices') as InvoiceWithItems[]) ?? [];
  },

  async getByShareTokenId(tokenId: string): Promise<InvoiceWithItems | null> {
    const { data: tokenRow, error: tokenError } = await supabase
      .from('share_tokens')
      .select('related_id')
      .eq('id', tokenId)
      .maybeSingle();
    if (tokenError || !tokenRow?.related_id) return null;

    const { data, error } = await supabase
      .from('invoices')
      .select(invoiceSelect)
      .eq('id', tokenRow.related_id)
      .maybeSingle();
    if (error) return null;
    return (data as InvoiceWithItems) ?? null;
  },

  async create(
    doctorId: string | null | undefined,
    input: InvoiceCreateInput
  ): Promise<InvoiceWithItems> {
    requireUser(doctorId, 'create invoice');
    const invoiceNumber = input.invoiceNumber ?? (await nextInvoiceNumber(doctorId!));

    const items = input.items ?? [];
    const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const discount = input.discount ?? 0;
    const computedTotal = Math.max(0, subtotal - discount);

    const payload: Inserts<'invoices'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId,
      invoice_number: invoiceNumber,
      invoice_date: input.invoiceDate ?? new Date().toISOString().slice(0, 10),
      consultation_fee: input.consultationFee ?? Math.round(computedTotal * 0.6),
      medicine_charges: input.medicineCharges ?? Math.round(computedTotal * 0.4),
      discount,
      total_amount: input.totalAmount ?? computedTotal,
      payment_mode: input.paymentMode ?? 'Cash',
      status: input.status ?? 'Paid'
    };

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(payload)
      .select('id')
      .single();
    if (error || !invoice) throw new ServiceError('Create invoice failed', error);

    if (items.length > 0) {
      const itemRows: Inserts<'invoice_items'>[] = items.map((it, idx) => ({
        invoice_id: invoice.id,
        description: it.description,
        amount: Number(it.amount) || 0,
        display_order: idx
      }));
      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemRows);
      if (itemsErr) handle(null, itemsErr, 'Insert invoice items');
    }

    const { data: full, error: reloadErr } = await supabase
      .from('invoices')
      .select(invoiceSelect)
      .eq('id', invoice.id)
      .single();
    if (reloadErr || !full) throw new ServiceError('Reload invoice failed', reloadErr);
    return full as InvoiceWithItems;
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete invoice');
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete invoice');
  }
};