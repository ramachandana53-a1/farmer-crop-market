import React, { useState } from 'react';
import { Order, OrderStatus, LanguageCode, CropReview, FarmerComplaint } from '../types';
import { CROP_IMAGE_MAP, DEFAULT_CROP_IMAGE } from '../data/cropImages';
import { t, translateCrop } from '../utils/translations';
import { 
  Package, 
  X, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Star, 
  AlertTriangle, 
  ReceiptText, 
  MapPin,
  Calendar,
  CreditCard,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface MyOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  buyerId: string;
  language?: LanguageCode;
  onTrackOrder?: (orderId: string) => void;
  onViewReceipt?: (orderId: string) => void;
  onOpenReviewModal?: (order: Order) => void;
  onOpenComplaintModal?: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onAddReview?: (newReview: CropReview) => void;
  onAddComplaint?: (newComplaint: FarmerComplaint) => void;
  reviews?: CropReview[];
  isAcademicMode?: boolean;
  userRole?: string;
  selectedOrderId?: string;
  setSelectedOrderId?: (orderId: string) => void;
}

export const MyOrdersDrawer: React.FC<MyOrdersDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  buyerId,
  language = 'en',
  onTrackOrder,
  onViewReceipt,
  onOpenReviewModal,
  onOpenComplaintModal,
  onUpdateOrderStatus,
  onAddReview,
  onAddComplaint,
  reviews = [],
  isAcademicMode = false,
  userRole = 'buyer',
  selectedOrderId,
  setSelectedOrderId,
}) => {
  // Filter active and past orders from the main orders list
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ACTIVE' | 'PAST'>('ALL');

  // Built-in Review Modal state
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHover, setReviewHover] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  // Built-in Complaint Modal state
  const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState<Order | null>(null);
  const [complaintCategory, setComplaintCategory] = useState<string>('Quality Dispute');
  const [complaintPriority, setComplaintPriority] = useState<'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [complaintDescription, setComplaintDescription] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter orders placed by this buyer
  const allBuyerOrders = orders.filter((o) => {
    if (o.buyerId === buyerId) return true;
    if (o.buyerId === 'BUY_ACTIVE') return true;
    if (buyerId === 'BUY_001' && (!o.buyerId || o.buyerId.startsWith('BUY_'))) return true;
    return false;
  });

  // Filter active and past orders from the main orders list
  const activeOrders = allBuyerOrders.filter((order) => 
    ['PLACED', 'PAID', 'PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(order.status)
  );

  const pastOrders = allBuyerOrders.filter((order) => 
    ['DELIVERED', 'CANCELLED'].includes(order.status)
  );

  // Display counts accurately:
  // Active Bar Badge count:
  const activeCount = activeOrders.length; 
  // Drawer / History Total count:
  const totalCount = allBuyerOrders.length;

  // Determine displayed list based on tab
  const displayedOrders = orderFilter === 'ACTIVE' 
    ? activeOrders 
    : orderFilter === 'PAST' 
    ? pastOrders 
    : allBuyerOrders;

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return 1;
      case 'PAID':
        return 2;
      case 'PACKED':
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  // Render advance status/dispatch controls ONLY for Admins or Sellers, or in Academic Mode
  const canAdvanceStatus = Boolean(
    userRole === 'ADMIN' || userRole === 'SELLER' || userRole === 'farmer' || isAcademicMode
  );

  const handleAdvanceSimulation = (order: Order) => {
    if (!onUpdateOrderStatus) return;
    if (order.status === 'PLACED') {
      onUpdateOrderStatus(order.orderId, 'PAID');
      showToast(`Order #${order.orderId} Confirmed by Farmer!`);
    } else if (order.status === 'PAID') {
      onUpdateOrderStatus(order.orderId, 'IN_TRANSIT');
      showToast(`Order #${order.orderId} Dispatched via Highway Corridor!`);
    } else if (order.status === 'PACKED' || order.status === 'IN_TRANSIT') {
      onUpdateOrderStatus(order.orderId, 'DELIVERED');
      showToast(`Order #${order.orderId} Delivered! Review & Complaint actions unlocked.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;

    const newRev: CropReview = {
      reviewId: `REV-${Date.now()}`,
      orderId: selectedOrderForReview.orderId,
      cropId: selectedOrderForReview.cropId,
      cropName: selectedOrderForReview.cropName,
      listingId: selectedOrderForReview.listingId,
      buyerId: selectedOrderForReview.buyerId,
      buyerName: selectedOrderForReview.buyerName,
      rating: reviewRating,
      qualityFeedback: reviewFeedback.trim() || 'Excellent produce quality verified at APMC terminal.',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    if (onAddReview) {
      onAddReview(newRev);
    }
    setSelectedOrderForReview(null);
    setReviewFeedback('');
    showToast(`⭐ ${reviewRating}★ Review submitted for ${selectedOrderForReview.cropName}! Catalog badge updated.`);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForComplaint) return;

    const newComplaint: FarmerComplaint = {
      complaintId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: selectedOrderForComplaint.farmerId,
      farmerName: selectedOrderForComplaint.farmerName,
      buyerId: selectedOrderForComplaint.buyerId,
      buyerName: selectedOrderForComplaint.buyerName,
      category: complaintCategory,
      orderId: selectedOrderForComplaint.orderId,
      listingId: selectedOrderForComplaint.listingId,
      cropName: selectedOrderForComplaint.cropName,
      subject: `${complaintCategory} - Order #${selectedOrderForComplaint.orderId}`,
      description: complaintDescription.trim() || 'Dispute regarding commodity lot fulfillment and APMC grading.',
      priority: complaintPriority,
      status: 'OPEN',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    if (onAddComplaint) {
      onAddComplaint(newComplaint);
    }
    setSelectedOrderForComplaint(null);
    setComplaintDescription('');
    showToast(`⚠️ Complaint ticket routed to Farmer ${selectedOrderForComplaint.farmerName}'s portal under Tab 4!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-[#1B4332] text-white px-4 py-3 rounded-xl border-2 border-[#E9C46A] shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#E9C46A] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Top Header */}
          <div className="p-4 sm:p-5 bg-[#1B4332] text-white flex items-center justify-between border-b-2 border-[#E9C46A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-[#E9C46A]/40 text-xl shrink-0">
                📦
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                  <span>My Orders & Purchases</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#1B4332] font-black">
                    {totalCount}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Real-time delivery progress & APMC verified receipts
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Filter Tabs: All Purchases, Active Orders, Past Orders */}
          <div className="p-2 bg-[#FAF7EE] border-b border-[#E2DAC5] grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setOrderFilter('ALL')}
              className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                orderFilter === 'ALL'
                  ? 'bg-[#1B4332] text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E2DAC5]'
              }`}
            >
              <span>All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                orderFilter === 'ALL' ? 'bg-[#E9C46A] text-[#1B4332]' : 'bg-stone-200 text-stone-700'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOrderFilter('ACTIVE')}
              className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                orderFilter === 'ACTIVE'
                  ? 'bg-[#2D6A4F] text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E2DAC5]'
              }`}
            >
              <span>Active</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                orderFilter === 'ACTIVE' ? 'bg-amber-300 text-stone-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOrderFilter('PAST')}
              className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                orderFilter === 'PAST'
                  ? 'bg-stone-700 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E2DAC5]'
              }`}
            >
              <span>Past</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                orderFilter === 'PAST' ? 'bg-stone-300 text-stone-900' : 'bg-stone-200 text-stone-700'
              }`}>
                {pastOrders.length}
              </span>
            </button>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/80">
            {displayedOrders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl">
                  📦
                </div>
                <h4 className="font-bold text-stone-800 text-sm">
                  {orderFilter === 'ACTIVE' 
                    ? 'No active orders in progress' 
                    : orderFilter === 'PAST' 
                    ? 'No delivered or past orders yet' 
                    : 'No orders placed yet'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Browse fresh crop listings and tap "Buy Now" or complete cart checkout. Your purchase will immediately appear here with real-time status tracking!
                </p>
              </div>
            ) : (
              displayedOrders.map((order) => {
                const step = getStepProgress(order.status);
                const isDelivered = order.status === 'DELIVERED';
                const cropImg = CROP_IMAGE_MAP[order.cropId] || DEFAULT_CROP_IMAGE;
                const hasReviewed = reviews.some((r) => r.orderId === order.orderId);
                const isSelected = selectedOrderId === order.orderId;

                return (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrderId?.(order.orderId)}
                    className={`bg-white border rounded-2xl p-4 shadow-xs transition space-y-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#2D6A4F] ring-2 ring-emerald-600/30 bg-emerald-50/15'
                        : 'border-[#E2DAC5] hover:border-[#2D6A4F]'
                    }`}
                  >
                    {/* Top Row: Crop Image, Name, Quantity & Price */}
                    <div className="flex gap-3 items-start">
                      <img
                        src={cropImg}
                        alt={order.cropName}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_CROP_IMAGE;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-sm text-[#1B4332] truncate">
                            {translateCrop(order.cropId, language)}
                          </h4>
                          <span className="font-mono font-bold text-sm text-[#2D6A4F]">
                            ₹{order.totalAmountInr.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#52796F] mt-0.5">
                          <span>Qty: <strong>{order.quantityKg} kg</strong> ({order.quantityQuintals} q)</span>
                          <span>&bull;</span>
                          <span>₹{order.pricePerKg}/kg</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">Farmer: <strong>{order.farmerName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Order ID & Date info */}
                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                      <span className="font-mono bg-[#FAF7EE] px-2 py-0.5 rounded border border-[#E2DAC5] text-stone-700 font-bold">
                        #{order.orderId}
                      </span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {order.placedAt}
                      </span>
                    </div>

                    {/* 4-Stage Visual Live Delivery Tracker */}
                    <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-stone-700 flex items-center gap-1.5">
                          <span>Status:</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            order.status === 'DELIVERED' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : order.status === 'IN_TRANSIT' || order.status === 'PACKED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : order.status === 'PAID'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                            {order.status === 'PLACED' && '🟡 Order Placed / Processing'}
                            {order.status === 'PAID' && '🔵 Confirmed by Farmer'}
                            {(order.status === 'PACKED' || order.status === 'IN_TRANSIT') && '🚚 In Transit'}
                            {order.status === 'DELIVERED' && '🟢 Delivered'}
                          </span>
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono font-bold">
                          Step {step} of 4
                        </span>
                      </div>

                      {/* Step Progress Bar */}
                      <div className="grid grid-cols-4 gap-1 items-center pt-1">
                        <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                        <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                        <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                        <div className={`h-1.5 rounded-full ${step >= 4 ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                      </div>

                      {/* Step Labels */}
                      <div className="grid grid-cols-4 text-[9px] text-stone-600 text-center font-medium">
                        <span className={step >= 1 ? 'text-emerald-800 font-bold' : ''}>🟡 Placed</span>
                        <span className={step >= 2 ? 'text-emerald-800 font-bold' : ''}>🔵 Confirmed</span>
                        <span className={step >= 3 ? 'text-emerald-800 font-bold' : ''}>🚚 In Transit</span>
                        <span className={step >= 4 ? 'text-emerald-800 font-bold' : ''}>🟢 Delivered</span>
                      </div>

                      {order.currentLocationNote && (
                        <p className="text-[10px] text-stone-500 italic mt-1 line-clamp-1">
                          📍 {order.currentLocationNote}
                        </p>
                      )}

                      {/* Simulation Advance Button (Controlled by Academic Mode / Admin / Seller permission) */}
                      {canAdvanceStatus && !isDelivered && onUpdateOrderStatus && (
                        <div className="pt-2 flex items-center justify-between border-t border-[#E2DAC5]/60 text-[10px]">
                          <span className="text-stone-500 font-medium">
                            {isAcademicMode ? '🔬 Academic Simulation:' : '👨‍🌾 Seller/Admin Action:'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceSimulation(order);
                            }}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-100 border border-[#2D6A4F] text-[#1B4332] font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Advance order to next lifecycle milestone"
                          >
                            <span>⚡</span>
                            {order.status === 'PLACED' && <span>Confirm (🔵)</span>}
                            {order.status === 'PAID' && <span>Dispatch (🚚)</span>}
                            {(order.status === 'PACKED' || order.status === 'IN_TRANSIT') && <span>Deliver (🟢)</span>}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions: Receipt, Track, Review & Complaint */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReceipt(order.orderId);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-[#E2DAC5] hover:bg-[#FAF7EE] text-[#1B4332] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="View GST / e-NAM Tax Receipt"
                          >
                            <ReceiptText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>Receipt</span>
                          </button>
                        )}
                        {onTrackOrder && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTrackOrder(order.orderId);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Open Full Screen Route Visualizer"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#E9C46A]" />
                            <span>Track Route</span>
                          </button>
                        )}
                      </div>

                      {/* Post-Delivery Actions: Unlocked ONLY when status is "🟢 Delivered" */}
                      {isDelivered ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenReviewModal) {
                                onOpenReviewModal(order);
                              } else {
                                setSelectedOrderForReview(order);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Write Quality Review (1-5 Stars)"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{hasReviewed ? '⭐ Reviewed' : '⭐ Write Review'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenComplaintModal) {
                                onOpenComplaintModal(order);
                              } else {
                                setSelectedOrderForComplaint(order);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Raise Complaint to Farmer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>⚠️ Complaint</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 italic">
                          <span>🔒 Reviews & Complaints unlock on delivery</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#FAF7EE] border-t border-[#E2DAC5] text-center text-xs text-[#52796F] flex items-center justify-between px-4">
            <span className="font-semibold flex items-center gap-1 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified e-NAM APMC
            </span>
            <span className="text-[11px]">
              Active: <strong>{activeCount}</strong> &bull; Total: <strong>{totalCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ================= BUILT-IN REVIEW MODAL ================= */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DAC5] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B4332]">Write Product Review</h3>
                  <p className="text-xs text-[#52796F]">
                    {selectedOrderForReview.cropName} &bull; Order #{selectedOrderForReview.orderId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReview(null)}
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
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Describe freshness, moisture, APMC grading, and delivery accuracy..."
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl p-3 text-xs text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-tight">
                <strong>Dynamic Badge Update:</strong> This rating instantly updates the crop's dynamic rating badge across the entire marketplace catalog!
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReview(null)}
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

      {/* ================= BUILT-IN RAISE COMPLAINT MODAL ================= */}
      {selectedOrderForComplaint && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DAC5] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B4332]">Raise Complaint Ticket</h3>
                  <p className="text-xs text-[#52796F]">
                    Order #{selectedOrderForComplaint.orderId} &bull; Farmer: {selectedOrderForComplaint.farmerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForComplaint(null)}
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
                  <option value="Quality Dispute">Quality Dispute (Damaged, Moisture, Grade Mismatch)</option>
                  <option value="Quantity Shortage">Quantity Shortage (Weight Missing at Weighbridge)</option>
                  <option value="Payment Issue">Payment Issue (Escrow Hold / Billing Discrepancy)</option>
                  <option value="Delivery Delay">Delivery Delay (Transit Vehicle Stoppage)</option>
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
                  placeholder="Provide precise details regarding moisture readings, weighing slip differences, or driver delay..."
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl p-3 text-xs text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>Direct Routing:</strong> This complaint ticket will instantly be routed to Farmer <strong>{selectedOrderForComplaint.farmerName}</strong>'s Portal under <em>"Tab 4: Complaints & Support"</em>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Farmer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
