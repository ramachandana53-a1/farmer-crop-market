import React, { useState } from 'react';
import { PaymentReceipt } from '../types';
import { FileText, Search, Printer, Download, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PaymentReceiptsViewProps {
  receipts: PaymentReceipt[];
  onOpenReceiptModal: (receipt: PaymentReceipt) => void;
}

export const PaymentReceiptsView: React.FC<PaymentReceiptsViewProps> = ({
  receipts,
  onOpenReceiptModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceipts = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.paymentId.toLowerCase().includes(q) ||
      r.transactionRef.toLowerCase().includes(q) ||
      r.cropName.toLowerCase().includes(q) ||
      r.buyerName.toLowerCase().includes(q) ||
      r.farmerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>e-NAM & APMC Clearing Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
            Official Payment Vouchers & Tax Invoices
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Downloadable & printable transaction receipts compliant with Andhra Pradesh APMC regulations
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Txn, Crop, Party..."
            className="w-full pl-9 pr-4 py-2 border border-[#E2DAC5] rounded-xl text-xs bg-[#FAF7EE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7EE] border-b border-[#E2DAC5] text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt No. / Txn Ref</th>
                <th className="py-3 px-4">Commodity & Quantity</th>
                <th className="py-3 px-4">Parties (Buyer & Farmer)</th>
                <th className="py-3 px-4 text-right">Freight (Dijkstra)</th>
                <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DAC5]/60 text-stone-700">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400">
                    No matching payment receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcpt) => (
                  <tr key={rcpt.paymentId} className="hover:bg-[#FAF7EE]/50 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[#1B4332] block">{rcpt.paymentId}</span>
                      <span className="text-[10px] text-[#52796F]">{rcpt.transactionRef}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1B4332] block">{rcpt.cropName}</span>
                      <span className="text-stone-500 text-[11px]">
                        {rcpt.quantityKg} kg ({rcpt.quantityQuintals} q) @ ₹{rcpt.unitPricePerKg}/kg
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div>
                        <span className="text-stone-400">Buyer: </span>
                        <strong className="text-stone-800">{rcpt.buyerName}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400">Farmer: </span>
                        <strong className="text-stone-800">{rcpt.farmerName}</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-stone-600">
                      ₹{rcpt.transitFreightInr.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#2D6A4F]">
                      ₹{rcpt.totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{rcpt.paymentStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenReceiptModal(rcpt)}
                        className="px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#2D6A4F] text-[#1B4332] hover:text-white border border-[#E2DAC5] rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
