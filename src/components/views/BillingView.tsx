import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { BillingInvoice } from '../../types';
import {
  CreditCard,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  IndianRupee,
  Receipt,
  User,
  ShieldCheck,
  QrCode,
  Filter
} from 'lucide-react';

export interface BillItemForm {
  id: string;
  description: string;
  amount: number;
}

export const BillingView: React.FC = () => {
  const { selectedPatient, patients, invoices, saveInvoice } = useClinic();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [filterPatientOnly, setFilterPatientOnly] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  // Filtered invoices
  const displayedInvoices = filterPatientOnly && selectedPatient
    ? invoices.filter(inv => inv.patientId === selectedPatient.id)
    : invoices;

  // Active invoice resolution
  const activeInvoice: BillingInvoice | undefined =
    invoices.find(inv => inv.id === selectedInvoiceId) ||
    (selectedPatient ? invoices.find(inv => inv.patientId === selectedPatient.id) : undefined) ||
    invoices[0];

  // New Invoice form state
  const [newPatientId, setNewPatientId] = useState(selectedPatient?.id || patients[0]?.id || '');
  const [newItems, setNewItems] = useState<BillItemForm[]>([
    { id: '1', description: 'Doctor Consultation & Case Taking Fee', amount: 600 },
    { id: '2', description: 'Homeopathic Medicines (15 Days Dispensing)', amount: 400 }
  ]);
  const [newDiscount, setNewDiscount] = useState(0);
  const [newMode, setNewMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

  const addItemRow = () => {
    setNewItems([
      ...newItems,
      { id: String(Date.now()), description: 'Dispensing / Test Fee', amount: 300 }
    ]);
  };

  const removeItemRow = (id: string) => {
    setNewItems(newItems.filter(i => i.id !== id));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = patients.find(p => p.id === newPatientId) || selectedPatient || patients[0];
    if (!pt) return;

    const subtotal = newItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const finalTotal = Math.max(0, subtotal - newDiscount);

    const created = saveInvoice({
      invoiceNumber: `CP-INV-${1080 + invoices.length + 1}`,
      patientId: pt.id,
      patientName: pt.name,
      date: new Date().toISOString().split('T')[0],
      items: newItems.map(it => ({ description: it.description, amount: Number(it.amount) || 0 })),
      consultationFee: Math.round(finalTotal * 0.6),
      medicineCharges: Math.round(finalTotal * 0.4),
      discount: newDiscount,
      totalAmount: finalTotal,
      paymentMode: newMode,
      status: 'Paid'
    });

    setSelectedInvoiceId(created.id);
    setShowNewInvoice(false);
  };

  const calcSubtotal = (items: { amount: number }[]) =>
    items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Billing, Invoicing & OPD Accounts
          </h2>
          <p className="text-xs text-slate-500">
            Consultation charges, homeopathic dispensary fees, supportive medications, and instant receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedPatient && (
            <button
              onClick={() => setFilterPatientOnly(!filterPatientOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                filterPatientOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterPatientOnly ? `Only ${selectedPatient.name.split(' ')[0]}` : 'All Patients'}</span>
            </button>
          )}

          <button
            onClick={() => setShowNewInvoice(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* New Invoice Form */}
      {showNewInvoice && (
        <form onSubmit={handleCreateInvoice} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Generate Patient Invoice</h3>
            <button
              type="button"
              onClick={() => setShowNewInvoice(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Patient</label>
              <select
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
              <select
                value={newMode}
                onChange={(e) => setNewMode(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Bill Items</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            {newItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].description = e.target.value;
                    setNewItems(copy);
                  }}
                  className="flex-1 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  placeholder="Item description"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const copy = [...newItems];
                    copy[idx].amount = Number(e.target.value);
                    setNewItems(copy);
                  }}
                  className="w-28 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  placeholder="Amount ₹"
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewInvoice(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Save & Print Bill
            </button>
          </div>
        </form>
      )}

      {/* Invoices List & Printable Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: History */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Recent Invoices ({displayedInvoices.length})
            </h3>
            {filterPatientOnly && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Filtered
              </span>
            )}
          </div>

          {displayedInvoices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No invoices found</p>
              <p className="text-[11px] text-slate-500">
                Invoices generated at registration or billing will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {displayedInvoices.map((b) => {
                const isSelected = activeInvoice?.id === b.id;
                const total = b.totalAmount !== undefined ? b.totalAmount : (calcSubtotal(b.items) - b.discount);

                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedInvoiceId(b.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{b.patientName}</span>
                      <span className="font-bold text-emerald-800">₹{total}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{b.invoiceNumber || b.id} • {b.date}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        {b.paymentMode} ({b.status})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Printable Bill Sheet */}
        <div className="lg:col-span-8">
          {activeInvoice ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-slate-900">
                    {CLINIC_CONFIG.appName}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {CLINIC_CONFIG.doctorName}, {CLINIC_CONFIG.qualifications} • Reg. No: {CLINIC_CONFIG.regNo}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {CLINIC_CONFIG.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">{activeInvoice.invoiceNumber || activeInvoice.id}</div>
                  <div className="text-[11px] text-slate-500">Date: {activeInvoice.date}</div>
                  <button
                    onClick={() => window.print()}
                    className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto hover:bg-slate-800 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                  </button>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Billed To:</span>
                  <strong className="text-slate-900 text-xs">{activeInvoice.patientName}</strong>
                  <div className="text-slate-500 text-[11px]">Patient ID: {activeInvoice.patientId}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase block">Payment Mode:</span>
                  <strong className="text-emerald-700">{activeInvoice.paymentMode}</strong>
                  <div className="text-[10px] text-slate-500">Status: {activeInvoice.status}</div>
                </div>
              </div>

              {/* Items Table */}
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
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{it.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{calcSubtotal(activeInvoice.items)}</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono">- ₹{activeInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total Paid:</span>
                  <span className="text-emerald-800 font-mono">
                    ₹{activeInvoice.totalAmount || (calcSubtotal(activeInvoice.items) - (activeInvoice.discount || 0))}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Computerized receipt. Thank you for visiting {CLINIC_CONFIG.appName}.</span>
                <span className="font-mono font-bold text-slate-700">{CLINIC_CONFIG.appName} Official Receipt</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Select an invoice to preview receipt</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
