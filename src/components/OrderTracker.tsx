import React, { useState } from 'react';
import { Order, OrderStatus, PaymentReceipt, LanguageCode, CropReview, FarmerComplaint } from '../types';
import { t } from '../utils/translations';
import { 
  Check, 
  Clock, 
  Truck, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  FileText, 
  RotateCcw,
  Navigation,
  Phone,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Star,
  AlertTriangle,
  X,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewReceipt: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  selectedOrderId?: string;
  language?: LanguageCode;
  isBuyer?: boolean;
  reviews?: CropReview[];
  onAddReview?: (newReview: CropReview) => void;
  onAddComplaint?: (newComplaint: FarmerComplaint) => void;
}

const STAGES: Array<{
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}> = [
  { key: 'PLACED', label: 'Placed', sublabel: 'Mandi lot reserved & order registered with status PLACED', icon: Clock },
  { key: 'PAID', label: 'Paid', sublabel: 'Payment verified via UPI / e-NAM APMC Escrow', icon: CreditCard },
  { key: 'PACKED', label: 'Dispatched via Dijkstra Route', sublabel: 'Inspected & dispatched via shortest highway corridor', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', sublabel: 'Arrived at destination zone terminal hub', icon: CheckCircle2 },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onUpdateOrderStatus,
  onViewReceipt,
  onCancelOrder,
  selectedOrderId,
  language = 'en',
  isBuyer = false,
  reviews = [],
  onAddReview,
  onAddComplaint,
}) => {
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || (orders.length > 0 ? orders[0].orderId : '')
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHover, setReviewHover] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Complaint Modal State
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [complaintCategory, setComplaintCategory] = useState<string>('Quality Dispute');
  const [complaintDescription, setComplaintDescription] = useState<string>('');
  const [complaintPriority, setComplaintPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentOrder = orders.find((o) => o.orderId === activeOrderId) || orders[0];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'PAID': return 1;
      case 'PACKED':
      case 'IN_TRANSIT': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  const handleAdvanceStage = () => {
    if (!currentOrder || currentOrder.status === 'CANCELLED') return;
    const currentIndex = getStageIndex(currentOrder.status);
    if (currentIndex < STAGES.length - 1) {
      const nextStatus = STAGES[currentIndex + 1].key;
      onUpdateOrderStatus(currentOrder.orderId, nextStatus);
    }
  };

  const handleResetStage = () => {
    if (!currentOrder) return;
    onUpdateOrderStatus(currentOrder.orderId, 'PLACED');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    const newRev: CropReview = {
      reviewId: `rev-${Date.now()}`,
      cropId: currentOrder.cropId,
      cropName: currentOrder.cropName,
      listingId: currentOrder.listingId,
      orderId: currentOrder.orderId,
      buyerId: currentOrder.buyerId,
      buyerName: currentOrder.buyerName || 'Buyer',
      rating: reviewRating,
      qualityFeedback: reviewComment.trim() || 'High quality harvest as described, timely fulfillment.',
      createdAt: new Date().toISOString()
    };
    if (onAddReview) {
      onAddReview(newRev);
    }
    setShowReviewModal(false);
    setReviewComment('');
    setToastMessage(`Review submitted successfully! Rating of ${reviewRating}★ applied to ${currentOrder.cropName}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    const newComp: FarmerComplaint = {
      complaintId: `CMP-${Date.now().toString().slice(-4)}`,
      orderId: currentOrder.orderId,
      listingId: currentOrder.listingId || `LOT-${currentOrder.cropId}`,
      cropName: currentOrder.cropName,
      buyerId: currentOrder.buyerId,
      buyerName: currentOrder.buyerName || 'Buyer',
      farmerId: currentOrder.farmerId,
      farmerName: currentOrder.farmerName || 'Farmer',
      category: complaintCategory,
      subject: `${complaintCategory} - Order ${currentOrder.orderId}`,
      description: complaintDescription.trim() || `Dispute raised regarding ${complaintCategory.toLowerCase()} for ${currentOrder.quantityKg} kg of ${currentOrder.cropName}.`,
      priority: complaintPriority,
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (onAddComplaint) {
      onAddComplaint(newComp);
    }
    setShowComplaintModal(false);
    setComplaintDescription('');
    setToastMessage(`Complaint ticket ${newComp.complaintId} routed directly to Farmer's Portal Tab 4!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  if (!currentOrder) {
    return (
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-12 text-center text-[#52796F]">
        <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-base font-bold text-[#1B4332]">No Orders Found</h3>
        <p className="text-xs text-stone-500 mt-1">Place an order in the Buyer Portal to track it here.</p>
      </div>
    );
  }

  const currentStageIndex = getStageIndex(currentOrder.status);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2DAC5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#FAF7EE] text-[#1B4332] px-2.5 py-1 rounded-md border border-[#E2DAC5]">
                {currentOrder.orderId}
              </span>
              <span className="text-xs text-stone-500">Tracking:</span>
              <span className="text-xs font-mono font-bold text-[#2D6A4F]">{currentOrder.trackingNumber}</span>
              {currentOrder.status === 'CANCELLED' && (
                <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                  CANCELLED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B4332] mt-1 flex items-center gap-2">
              <span>{currentOrder.cropIcon}</span>
              <span>{currentOrder.cropName}</span>
              <span className="text-sm font-semibold text-[#52796F]">
                ({currentOrder.quantityKg} kg / {currentOrder.quantityQuintals} q)
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewReceipt(currentOrder.orderId)}
              className="px-3.5 py-2 bg-white border border-[#E2DAC5] hover:border-[#2D6A4F] text-[#1B4332] rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#2D6A4F]" />
              <span>{t('viewReceipt', language)}</span>
            </button>

            {/* Post-Purchase Actions for Buyers: Write Review & Raise Complaint */}
            {(currentOrder.status === 'DELIVERED' || currentOrder.status === 'PAID' || isBuyer) && (
              <>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Submit star rating & feedback"
                >
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>⭐ {t('writeReview', language)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowComplaintModal(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Raise grievance to farmer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>⚠️ {t('raiseComplaint', language)}</span>
                </button>
              </>
            )}

            {/* Advance Status Button */}
            <button
              onClick={handleAdvanceStage}
              disabled={currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED'}
              className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>Advance Status</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Cancel Order Button before dispatch */}
            {onCancelOrder && currentOrder.status !== 'DELIVERED' && currentOrder.status !== 'IN_TRANSIT' && currentOrder.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="px-3.5 py-2 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Cancel order before dispatch & restock inventory"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Cancel Order</span>
              </button>
            )}

            {currentOrder.status === 'DELIVERED' && (
              <button
                onClick={handleResetStage}
                className="p-2 border border-[#E2DAC5] text-stone-500 hover:text-[#1B4332] rounded-xl hover:bg-[#FAF7EE] transition cursor-pointer"
                title="Reset simulation to Placed"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="my-3 p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Inline Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="my-4 p-4 bg-rose-50 border-2 border-rose-400 rounded-xl text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="font-bold text-sm block text-rose-900">Confirm Order Cancellation?</strong>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  Order <strong>{currentOrder.orderId}</strong> will be cancelled. <strong>{currentOrder.quantityKg.toLocaleString('en-IN')} kg</strong> of {currentOrder.cropName} will be automatically restocked to the farmer's listing inventory.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold hover:bg-stone-100 transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancelOrder) onCancelOrder(currentOrder.orderId);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Yes, Cancel & Restock</span>
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Notice Banner */}
        {currentOrder.status === 'CANCELLED' && (
          <div className="my-4 p-3.5 bg-rose-50 border-2 border-rose-400 rounded-xl text-xs text-rose-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="font-bold text-sm block">Order Cancelled by Buyer Before Dispatch</strong>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  Produce stock ({currentOrder.quantityKg} kg of {currentOrder.cropName}) has been automatically returned to active APMC inventory. Escrow refund issued to buyer.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-rose-200 text-rose-900 font-bold shrink-0">
              RESTOCKED TO FARMER
            </span>
          </div>
        )}

        {/* FLIPKART-STYLE STEPPER PROGRESS BAR */}
        <div className="py-6 sm:py-8">
          <div className="relative">
            {/* Horizontal Line behind steps */}
            <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
              <div 
                className="h-full bg-[#2D6A4F] transition-all duration-500"
                style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
              />
            </div>

            {/* Stepper Node Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const IconComp = stage.icon;

                return (
                  <div key={stage.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative z-10">
                    {/* Circle Node */}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#FAF7EE] border-[#2D6A4F] text-[#2D6A4F] ring-4 ring-[#2D6A4F]/20 animate-pulse'
                          : 'bg-white border-stone-300 text-stone-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <IconComp className="w-5 h-5" />
                      )}
                    </div>

                    {/* Label & Details */}
                    <div className="sm:mt-1">
                      <div className={`text-xs font-bold ${isCurrent ? 'text-[#2D6A4F]' : isCompleted ? 'text-[#1B4332]' : 'text-stone-400'}`}>
                        {stage.label}
                      </div>
                      <div className="text-[11px] text-stone-500 leading-tight hidden sm:block">
                        {stage.sublabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Transit & GPS Corridor Note */}
        <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#1B4332] block">Current Transit Milestone:</span>
              <p className="text-stone-700 mt-0.5">{currentOrder.currentLocationNote}</p>
              <div className="text-[11px] text-[#52796F] mt-1 font-mono">
                Vehicle: <strong>{currentOrder.vehicleLorryNumber}</strong> &bull; Highway: <strong>{currentOrder.highwayRef}</strong>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-[#E2DAC5] pt-2 md:pt-0 md:pl-4">
            <span className="text-stone-500 block text-[11px]">Total Landed Value</span>
            <span className="font-mono text-lg font-bold text-[#2D6A4F]">
              ₹{currentOrder.totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Dijkstra Routing & Order Party Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dijkstra Transit Route Visualization */}
        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E2DAC5]">
            <Truck className="w-4 h-4 text-[#2D6A4F]" />
            <h3 className="font-bold text-sm text-[#1B4332]">Dijkstra Shortest Transit Path</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5]">
              <div>
                <span className="text-stone-500 block text-[10px]">Origin District</span>
                <span className="font-bold text-[#1B4332]">{currentOrder.sourceZoneId}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <div>
                <span className="text-stone-500 block text-[10px]">Transit Route Sequence</span>
                <span className="font-mono font-bold text-[#2D6A4F]">
                  {currentOrder.dijkstraRoute.join(' ➔ ')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <div className="text-right">
                <span className="text-stone-500 block text-[10px]">Destination Hub</span>
                <span className="font-bold text-[#1B4332]">{currentOrder.destZoneId}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 text-[10px] block">Distance</span>
                <span className="font-bold text-[#1B4332] font-mono">{currentOrder.transitDistanceKm} km</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 text-[10px] block">Est. Time</span>
                <span className="font-bold text-[#1B4332] font-mono">{currentOrder.estimatedTransitHours} hrs</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 text-[10px] block">Freight Cost</span>
                <span className="font-bold text-[#2D6A4F] font-mono">₹{currentOrder.transitFreightCostInr.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stakeholder Contacts (Farmer & Buyer) */}
        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E2DAC5]">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
            <h3 className="font-bold text-sm text-[#1B4332]">Mandi Parties & Dispatch Ledger</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[10px] uppercase font-bold text-[#52796F] block">Producer (Farmer)</span>
              <p className="font-bold text-[#1B4332] mt-0.5">{currentOrder.farmerName}</p>
              <p className="text-stone-600 flex items-center gap-1 mt-1 text-[11px]">
                <Phone className="w-3 h-3 text-[#2D6A4F]" /> {currentOrder.farmerPhone}
              </p>
            </div>

            <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[10px] uppercase font-bold text-[#52796F] block">Buyer (Consignee)</span>
              <p className="font-bold text-[#1B4332] mt-0.5">{currentOrder.buyerName}</p>
              <p className="text-stone-600 flex items-center gap-1 mt-1 text-[11px]">
                <Phone className="w-3 h-3 text-[#2D6A4F]" /> {currentOrder.buyerPhone}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E2DAC5] flex items-center justify-between text-xs text-stone-600">
            <span>Order Placed Date: <strong>{currentOrder.placedAt}</strong></span>
            <span>Payment Ref: <strong className="font-mono text-[#2D6A4F]">{currentOrder.paymentRef}</strong></span>
          </div>
        </div>
      </div>

      {/* Orders Selection Switcher */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-sm text-[#1B4332] mb-3">All Active Market Orders ({orders.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {orders.map((o) => (
            <div
              key={o.orderId}
              onClick={() => setActiveOrderId(o.orderId)}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                o.orderId === activeOrderId
                  ? 'bg-[#FAF7EE] border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20'
                  : 'bg-white border-[#E2DAC5] hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-[#1B4332]">{o.orderId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  o.status === 'DELIVERED' 
                    ? 'bg-emerald-100 text-emerald-800'
                    : o.status === 'IN_TRANSIT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {o.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-800 truncate">
                {o.cropIcon} {o.cropName}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                <span>{o.quantityKg} kg</span>
                <span className="font-mono font-bold text-[#2D6A4F]">₹{o.totalAmountInr.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= POST-PURCHASE WRITE REVIEW MODAL ================= */}
      {showReviewModal && currentOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DAC5] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <h3 className="text-base font-bold text-[#1B4332]">{t('writeReview', language)}</h3>
                  <p className="text-xs text-[#52796F]">
                    {currentOrder.cropName} • {currentOrder.orderId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Rate Quality & Fulfillment (1 to 5 Stars):
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition transform hover:scale-125 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (reviewHover || reviewRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto font-mono font-bold text-sm text-[#1B4332]">
                    {reviewHover || reviewRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Quality Text Feedback:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe crop freshness, moisture level, packaging, and mandi delivery experience..."
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl p-3 text-xs text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Rating & Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= POST-PURCHASE RAISE COMPLAINT MODAL ================= */}
      {showComplaintModal && currentOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DAC5] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B4332]">{t('raiseComplaint', language)}</h3>
                  <p className="text-xs text-[#52796F]">
                    Order #{currentOrder.orderId} • Farmer: {currentOrder.farmerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Issue Type (Required):
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] text-[#1B4332] font-semibold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden cursor-pointer"
                >
                  <option value="Quality Dispute">Quality Dispute (Damage, Moisture, Pest)</option>
                  <option value="Quantity Shortage">Quantity Shortage (Net Weight Underdelivered)</option>
                  <option value="Payment Issue">Payment Issue (Escrow Hold / Billing Discrepancy)</option>
                  <option value="Delivery Delay">Delivery Delay (Corridor Toll / Driver Stoppage)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Priority / Severity:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setComplaintPriority(p)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        complaintPriority === p
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-[#FAF7EE] text-stone-700 border-[#E2DAC5]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Detailed Description:
                </label>
                <textarea
                  rows={3}
                  required
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  placeholder="Provide precise details regarding moisture meter readings, weighing slip differences, or driver delay..."
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl p-3 text-xs text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>Automatic APMC Routing:</strong> This complaint ticket will instantly be routed to Farmer <strong>{currentOrder.farmerName}</strong>'s Portal under <em>"Tab 4: Complaints & Support"</em> for prompt investigation and response.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Submit Complaint Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
