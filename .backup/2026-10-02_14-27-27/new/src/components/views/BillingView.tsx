import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import {
  CreditCard, Plus, Trash2, Printer, IndianRupee, Receipt, Filter,
  MessageCircle, Loader2
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { selectedPatient, patients, invoices, saveInvoice, openWhatsAppBillingShareDialog } = useClinic();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [filterPatientOnly, setFilterPatientOnly] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayedInvoices = filterPatientOnly && selectedPatient
    ? invoices.filter(inv => inv.patientId === selectedPatient.id)
    : invoices;

  const activeInvoice =
    invoices.find(inv => inv.id === selectedInvoiceId) ||
    (selectedPatient ? invoices.find(inv => inv.patientId === selectedPatient.id) : undefined) ||
    invoices[0];

  const [newPatientId, setNewPatientId] = useState(selectedPatient?.id || patients[0]?.id || '');
  const [newItems, setNewItems] = useState([
    { id: '1', description: 'Consultation Fee', amount: CLINIC_CONFIG.consultationFee || 600 },
    { id: '2', description: 'Medicines', amount: 400 }
  ]);
  const [newDiscount, setNewDiscount] = useState(0);
  const [newMode, setNewMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

  const addItemRow = () => setNewItems([...newItems, { id: String(Date.now()), description: 'Additional charge', amount: 100 }]);
  const removeItemRow = (id: string) => setNewItems(newItems.filter(i => i.id !== id));

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const pt = patients.find(p => p.id === newPatientId);
    if (!pt) return;
    setSaving(true);
    try {
      const subtotal = newItems.reduce((a, it) => a + (Number(it.amount) || 0), 0);
      const total = Math.max(0, subtotal - newDiscount);
      const created = await saveInvoice({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        patientId: pt.id,
        patientName: pt.name,
        date: new Date().toISOString().split('T')[0],
        items: newItems.map(it => ({ description: it.description, amount: Number(it.amount) || 0 })),
        consultationFee: Math.round(total * 0.6),
        medicineCharges: Math.round(total * 0.4),
        discount: newDiscount,
        totalAmount: total,
        paymentMode: newMode,
        status: 'Paid'
      });
      setSelectedInvoiceId(created.id);
      setShowNewInvoice(false);
    } finally { setSaving(false); }
  };

  const calcSubtotal = (items: { amount: number }[]) => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />Billing &amp; Invoices
          </h2>
          <p className="text-xs text-slate-500">Consultation charges, medicine dispensing, and receipts.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedPatient && (
            <button
              onClick={() => setFilterPatientOnly(!filterPatientOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                filterPatientOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterPatientOnly ? `Only ${selectedPatient.name.split(' ')[0]}` : 'All Patients'}</span>
            </button>
          )}
          <button
            onClick={() => setShowNewInvoice(true)}
            disabled={patients.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /><span>New Invoice</span>
          </button>
        </div>
      </div>

      {patients.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No patients yet</h3>
          <p className="text-xs text-slate-500">Register patients to start generating invoices.</p>
        </div>
      )}

      {showNewInvoice && (
        <form onSubmit={handleCreateInvoice} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Generate Invoice</h3>
            <button type="button" onClick={() => setShowNewInvoice(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Patient</label>
              <select value={newPatientId} onChange={e => setNewPatientId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none">
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.mobile})</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
              <select value={newMode} onChange={e => setNewMode(e.target.value as typeof newMode)} className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none">
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Discount (₹)</label>
              <input type="number" min="0" value={newDiscount} onChange={e => setNewDiscount(Number(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Line Items</span>
              <button type="button" onClick={addItemRow} className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />Add line
              </button>
            </div>
            {newItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <input type="text" value={item.description} onChange={e => { const copy = [...newItems]; copy[idx].description = e.target.value; setNewItems(copy); }} className="flex-1 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none" />
                <input type="number" value={item.amount} onChange={e => { const copy = [...newItems]; copy[idx].amount = Number(e.target.value); setNewItems(copy); }} className="w-28 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none" />
                <button type="button" onClick={() => removeItemRow(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowNewInvoice(false)} className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Save Invoice
            </button>
          </div>
        </form>
      )}

      {patients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Invoices ({displayedInvoices.length})</h3>
            {displayedInvoices.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No invoices yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {displayedInvoices.map(b => {
                  const isSelected = activeInvoice?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedInvoiceId(b.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all ${
                        isSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{b.patientName}</span>
                        <span className="font-bold text-emerald-800">₹{b.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{b.invoiceNumber} • {b.date}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">{b.paymentMode}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {activeInvoice ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-slate-900">{CLINIC_CONFIG.appName}</h3>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {CLINIC_CONFIG.doctorName}
                      {CLINIC_CONFIG.qualifications && `, ${CLINIC_CONFIG.qualifications}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">{activeInvoice.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-500">Date: {activeInvoice.date}</div>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openWhatsAppBillingShareDialog(activeInvoice.patientId, activeInvoice.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                      </button>
                      <button onClick={() => window.print()} className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Printer className="w-3.5 h-3.5" />Print
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Billed To</span>
                    <strong className="text-slate-900 text-xs">{activeInvoice.patientName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase block">Payment Mode</span>
                    <strong className="text-emerald-700">{activeInvoice.paymentMode}</strong>
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-400 text-[10px] uppercase">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-slate-800 font-medium">{it.description}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900">₹{it.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono">₹{calcSubtotal(activeInvoice.items)}</span></div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600"><span>Discount:</span><span className="font-mono">- ₹{activeInvoice.discount}</span></div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid:</span><span className="text-emerald-800 font-mono">₹{activeInvoice.totalAmount}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Thank you for visiting {CLINIC_CONFIG.appName}.</span>
                  <span className="font-mono font-bold text-slate-700">Official Receipt</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                <IndianRupee className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">Select an invoice to preview</p>
              </div>
            )}
          </div>
        </div>
      )}
      <span className="hidden"><CreditCard /></span>
    </div>
  );
};