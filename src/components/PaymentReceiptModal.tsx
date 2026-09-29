import React, { useRef } from 'react';
import { PaymentReceipt } from '../types';
import { X, Printer, Download, CheckCircle2, Copy, ShieldCheck, MapPin, Building2, Calendar, FileText } from 'lucide-react';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(receipt.transactionRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textContent = `
============================================================
ANDHRA PRADESH AGRICULTURAL PRODUCE MARKET COMMITTEE (APMC)
OFFICIAL e-NAM CLEARING & SETTLEMENT RECEIPT
============================================================
Receipt No:      ${receipt.paymentId}
Transaction Ref: ${receipt.transactionRef}
Order ID:        ${receipt.orderId}
Settlement Date: ${receipt.paidAt}
Payment Mode:    ${receipt.paymentMode}
Status:          ${receipt.paymentStatus}

PARTY DETAILS:
Buyer:           ${receipt.buyerName} (${receipt.buyerDistrict})
Farmer/Seller:   ${receipt.farmerName} (${receipt.farmerDistrict})

COMMODITY & WEIGHT:
Commodity:       ${receipt.cropName}
Quantity:        ${receipt.quantityKg.toLocaleString('en-IN')} kg (${receipt.quantityQuintals} Quintals)
Rate per kg:     ₹${receipt.unitPricePerKg.toFixed(2)}

FINANCIAL BREAKDOWN:
Produce Subtotal: ₹${receipt.produceAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Transit Freight:  ₹${receipt.transitFreightInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
APMC Cess (1%):   ₹${receipt.apmcCessInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
------------------------------------------------------------
TOTAL PAID (INR): ₹${receipt.totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
------------------------------------------------------------
Dijkstra Route:   ${receipt.dijkstraCorridor}

This is a computer generated certificate approved by APMC Direct Clearing.
============================================================
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APMC-Receipt-${receipt.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2DAC5] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-[#1B4332] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E9C46A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E9C46A]" />
            <span className="font-bold text-sm sm:text-base">APMC e-NAM Official Payment Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div ref={receiptRef} className="p-6 bg-white print:p-0">
          {/* Official Letterhead */}
          <div className="text-center pb-4 border-b border-[#E2DAC5]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF7EE] border border-[#E2DAC5] text-2xl mb-2">
              🌾
            </div>
            <h2 className="text-lg font-bold text-[#1B4332] tracking-tight">
              AGRICULTURAL PRODUCE MARKET COMMITTEE (APMC)
            </h2>
            <p className="text-xs text-[#52796F] font-medium">
              e-NAM Digital Clearing & Settlement Portal &bull; GST Tax Invoice
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-stone-500 font-mono">
              <span>GSTIN: <strong>37AAACG1234F1Z8</strong></span>
              <span>&bull;</span>
              <span>ARN: <strong>AA3709240019284</strong></span>
              <span>&bull;</span>
              <span>HSN Code: <strong>1001 / 0904</strong></span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{receipt.paymentStatus === 'COMPLETED' ? 'GST TAX INVOICE & ESCROW SETTLED' : 'ESCROW SECURED'}</span>
            </div>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 gap-3 py-4 border-b border-[#E2DAC5] text-xs">
            <div>
              <span className="text-stone-500 block">Receipt Voucher No.</span>
              <span className="font-mono font-bold text-[#1B4332]">{receipt.paymentId}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Transaction Reference</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-[#2D6A4F] text-[11px] truncate">
                  {receipt.transactionRef}
                </span>
                <button
                  onClick={handleCopyTxn}
                  title="Copy Transaction Reference"
                  className="text-stone-400 hover:text-[#1B4332] transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
            </div>
            <div>
              <span className="text-stone-500 block">Associated Order</span>
              <span className="font-mono font-bold text-[#1B4332]">{receipt.orderId}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Settlement Timestamp</span>
              <span className="font-semibold text-stone-700">{receipt.paidAt}</span>
            </div>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-[#E2DAC5] text-xs">
            <div className="bg-[#FAF7EE] p-3 rounded-lg border border-[#E2DAC5]/60">
              <span className="text-[10px] uppercase font-bold text-[#52796F] block mb-1">
                Buyer / Consignee
              </span>
              <p className="font-bold text-[#1B4332]">{receipt.buyerName}</p>
              <p className="text-stone-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" /> {receipt.buyerDistrict}
              </p>
            </div>
            <div className="bg-[#FAF7EE] p-3 rounded-lg border border-[#E2DAC5]/60">
              <span className="text-[10px] uppercase font-bold text-[#52796F] block mb-1">
                Farmer / Producer
              </span>
              <p className="font-bold text-[#1B4332]">{receipt.farmerName}</p>
              <p className="text-stone-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" /> {receipt.farmerDistrict}
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="py-4 border-b border-[#E2DAC5]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-500 border-b border-[#E2DAC5]/60 pb-1">
                  <th className="text-left font-semibold pb-1.5">Description</th>
                  <th className="text-right font-semibold pb-1.5">Rate / Unit</th>
                  <th className="text-right font-semibold pb-1.5">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5]/40 text-stone-700">
                <tr>
                  <td className="py-2">
                    <span className="font-bold text-[#1B4332]">{receipt.cropName}</span>
                    <span className="block text-[11px] text-stone-500">
                      Quantity: {receipt.quantityKg.toLocaleString('en-IN')} kg ({receipt.quantityQuintals} q)
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    ₹{receipt.unitPricePerKg.toFixed(2)} / kg
                  </td>
                  <td className="py-2 text-right font-mono font-semibold text-[#1B4332]">
                    ₹{receipt.produceAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-stone-600">
                    <div>Transit Freight (Dijkstra Shortest Route)</div>
                    <div className="text-[10px] text-stone-400 font-mono">{receipt.dijkstraCorridor}</div>
                  </td>
                  <td className="py-2 text-right text-stone-500">Distance-based</td>
                  <td className="py-2 text-right font-mono text-stone-700">
                    ₹{receipt.transitFreightInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-stone-500">
                    <span>GST on Freight (5% - CGST 2.5% + SGST 2.5%)</span>
                    <span className="block text-[10px] text-stone-400">Raw agri-produce 0% GST (Nil-rated Sec 11)</span>
                  </td>
                  <td className="py-1 text-right text-stone-500">5.0% GST</td>
                  <td className="py-1 text-right font-mono text-stone-600">
                    ₹{(receipt.transitFreightInr * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-stone-500">APMC Mandi Statutory Cess (1%)</td>
                  <td className="py-1.5 text-right text-stone-500">1.0% Cess</td>
                  <td className="py-1.5 text-right font-mono text-stone-600">
                    ₹{receipt.apmcCessInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-t-2 border-[#1B4332]">
                  <td className="pt-2 font-bold text-sm text-[#1B4332]">Total Paid Amount (INR)</td>
                  <td className="pt-2 text-right text-xs text-stone-500">All Inclusive</td>
                  <td className="pt-2 text-right font-mono font-bold text-base text-[#2D6A4F]">
                    ₹{receipt.totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method Footnote */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
            <span>Payment Mode: <strong>{receipt.paymentMode}</strong></span>
            <span>Digital Clearing Stamp: <strong>VERIFIED</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#FAF7EE] border-t border-[#E2DAC5] flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E2DAC5] rounded-xl text-xs font-semibold text-stone-700 hover:bg-white transition"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 bg-white border border-[#E2DAC5] hover:border-[#2D6A4F] rounded-xl text-xs font-semibold text-[#1B4332] flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Download Text</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
