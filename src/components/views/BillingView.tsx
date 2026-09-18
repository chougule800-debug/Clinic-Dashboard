import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { BillingInvoice } from '../../types';

export interface BillItem {
  id: string;
  description: string;
  amount: number;
}

export interface ClinicBill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  paymentMode: 'UPI' | 'Cash' | 'Card';
  paymentStatus: 'Paid' | 'Unpaid';
  discount: number;
}
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
  QrCode
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { selectedPatient, patients } = useClinic();

  const [bills, setBills] = useState<ClinicBill[]>([
    {
      id: 'INV-2026-001',
      patientId: selectedPatient?.id || 'PT-1001',
      patientName: selectedPatient?.name || 'Rahul Sharma',
      date: '2026-03-16',
      items: [
        { id: '1', description: 'Consultation & System-wise Case Taking Fee', amount: 800 },
        { id: '2', description: 'Homeopathic Medicine (15 Days Dispensing)', amount: 450 },
        { id: '3', description: 'Computerized Repertorisation Analysis', amount: 250 }
      ],
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      discount: 0
    },
    {
      id: 'INV-2026-002',
      patientId: 'PT-1002',
      patientName: 'Sunita Patel',
      date: '2026-03-15',
      items: [
        { id: '1', description: 'Consultation Fee (Follow-up)', amount: 500 },
        { id: '2', description: 'Homeopathic Medicine (1 Month)', amount: 700 }
      ],
      paymentMode: 'Cash',
      paymentStatus: 'Paid',
      discount: 100
    }
  ]);

  const [activeInvoice, setActiveInvoice] = useState<ClinicBill>(bills[0]);
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  // New Invoice form
  const [newPatientId, setNewPatientId] = useState(selectedPatient?.id || patients[0]?.id || '');
  const [newItems, setNewItems] = useState<BillItem[]>([
    { id: '1', description: 'Doctor Consultation Fee', amount: 600 },
    { id: '2', description: 'Homeopathic Medicines (15 Days)', amount: 400 }
  ]);
  const [newDiscount, setNewDiscount] = useState(0);
  const [newMode, setNewMode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

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
    const pt = patients.find(p => p.id === newPatientId);
    if (!pt) return;

    const newBill = {
      id: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      patientId: pt.id,
      patientName: pt.name,
      date: new Date().toISOString().split('T')[0],
      items: newItems,
      paymentMode: newMode,
      paymentStatus: 'Paid' as const,
      discount: newDiscount
    };

    setBills([newBill, ...bills]);
    setActiveInvoice(newBill);
    setShowNewInvoice(false);
  };

  const calcSubtotal = (items: BillItem[]) =>
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

        <button
          onClick={() => setShowNewInvoice(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Invoice</span>
        </button>
      </div>

      {/* New Invoice Form */}
      {showNewInvoice && (
        <form onSubmit={handleCreateInvoice} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Generate Patient Invoice</h3>
            <button
              type="button"
              onClick={() => setShowNewInvoice(false)}
              className="text-slate-400 hover:text-slate-600"
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
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Discount (₹)</label>
              <input
                type="number"
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
          <h3 className="font-bold text-slate-900 text-sm">Recent Invoices</h3>
          <div className="space-y-2">
            {bills.map((b) => {
              const isSelected = activeInvoice?.id === b.id;
              const total = calcSubtotal(b.items) - b.discount;

              return (
                <button
                  key={b.id}
                  onClick={() => setActiveInvoice(b)}
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
                    <span>{b.id} • {b.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {b.paymentMode} ({b.paymentStatus})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Printable Bill Sheet */}
        <div className="lg:col-span-8">
          {activeInvoice && (
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
                  <div className="font-bold text-slate-900 text-sm">{activeInvoice.id}</div>
                  <div className="text-[11px] text-slate-500">Date: {activeInvoice.date}</div>
                  <button
                    onClick={() => window.print()}
                    className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                  </button>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Billed To:</span>
                  <strong className="text-slate-900 text-xs">{activeInvoice.patientName}</strong>
                  <div className="text-slate-500 text-[11px]">Patient ID: {activeInvoice.patientId}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase block">Payment Mode:</span>
                  <strong className="text-emerald-700">{activeInvoice.paymentMode}</strong>
                  <div className="text-[10px] text-slate-500">Status: {activeInvoice.paymentStatus}</div>
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
                  {activeInvoice.items.map((it) => (
                    <tr key={it.id}>
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
                    ₹{calcSubtotal(activeInvoice.items) - activeInvoice.discount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Computerized receipt. Thank you for visiting {CLINIC_CONFIG.appName}.</span>
                <span className="font-mono font-bold text-slate-700">{CLINIC_CONFIG.appName} Official Receipt</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
