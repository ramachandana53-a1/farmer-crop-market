import React, { useState, useMemo, useEffect } from 'react';
import { 
  Buyer, 
  CropListing, 
  Crop, 
  MarketZone, 
  TransitRoute, 
  Farmer, 
  UserProfile, 
  Order, 
  PaymentReceipt, 
  LanguageCode, 
  CartItem,
  CropReview,
  FarmerComplaint
} from '../types';
import { runDijkstra } from '../utils/dijkstra';
import { CROP_ICONS } from '../data/initialData';
import { CROP_IMAGE_MAP, DEFAULT_CROP_IMAGE } from '../data/cropImages';
import { t, translateCrop, translateStatus, translateCategory, translateUnit } from '../utils/translations';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Check, 
  Clock, 
  X, 
  Search, 
  Scale, 
  Tag, 
  ReceiptText,
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Wallet, 
  ShoppingBag, 
  CheckCircle2, 
  PackageCheck,
  Package,
  Heart,
  ShoppingCart,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Plus,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ArrowLeft,
  MessageSquare,
  Send,
  FileText
} from 'lucide-react';

interface BuyerPortalProps {
  buyers: Buyer[];
  farmers: Farmer[];
  crops: Crop[];
  zones: MarketZone[];
  listings: CropListing[];
  routes: TransitRoute[];
  userProfile?: UserProfile;
  language?: LanguageCode;
  activeBuyerId?: string;
  wishlistIds?: string[];
  cartItems?: CartItem[];
  orders?: Order[];
  reviews?: CropReview[];
  onAddReview?: (newReview: CropReview) => void;
  onAddComplaint?: (newComplaint: FarmerComplaint) => void;
  onToggleWishlist?: (listingId: string) => void;
  onAddToCart?: (listing: CropListing, quantityKg: number, deliveryDistrictId: string) => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
  onNavigateToRouteVisualizer?: (sourceZone: string, destZone: string) => void;
  onPlaceOrder?: (newOrder: Order, newReceipt: PaymentReceipt) => void;
  onTrackOrder?: (orderId: string) => void;
  onViewReceipt?: (orderId: string) => void;
}

type BuyerPortalSlide = 'all_crops' | 'my_district' | 'highly_demanded' | 'my_orders';

// Deterministic rating generator for cards
function getListingRating(listingId: string): { rating: string; count: number } {
  let hash = 0;
  for (let i = 0; i < listingId.length; i++) {
    hash = (hash << 5) - hash + listingId.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const ratingValue = (4.5 + (abs % 5) * 0.1).toFixed(1);
  const reviewCount = 85 + (abs % 450);
  return { rating: ratingValue, count: reviewCount };
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  buyers,
  farmers,
  crops,
  zones,
  listings,
  routes,
  userProfile,
  language = 'en',
  activeBuyerId,
  wishlistIds = [],
  cartItems = [],
  orders = [],
  reviews = [],
  onAddReview,
  onAddComplaint,
  onToggleWishlist,
  onAddToCart,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onNavigateToRouteVisualizer,
  onPlaceOrder,
  onTrackOrder,
  onViewReceipt,
}) => {
  // Session-aware Buyer identity and destination
  const [buyerName, setBuyerName] = useState<string>(userProfile?.name || 'Amaravati Agri Processors');
  const [buyerDistrictId, setBuyerDistrictId] = useState<string>(userProfile?.districtId || 'AP_GUNTUR');

  // Clean 4-Slide View (All Crops, District, High Demand, My Purchases)
  const [activeSlide, setActiveSlide] = useState<BuyerPortalSlide>('all_crops');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>('ALL');

  // Selected Card for Product Details Slide-over / Modal
  const [selectedListingForModal, setSelectedListingForModal] = useState<CropListing | null>(null);

  // Modal Interactive Form States (Quantity, Delivery Address / District)
  const [modalQuantityKg, setModalQuantityKg] = useState<number>(60); // Default 60 kg
  const [modalDeliveryDistrictId, setModalDeliveryDistrictId] = useState<string>(buyerDistrictId);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [addedToCartToast, setAddedToCartToast] = useState<string | null>(null);

  // Post-Purchase Review Modal State
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [modalReviewRating, setModalReviewRating] = useState<number>(5);
  const [modalReviewHover, setModalReviewHover] = useState<number>(0);
  const [modalReviewFeedback, setModalReviewFeedback] = useState<string>('');

  // Post-Purchase Raise Complaint Modal State
  const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState<Order | null>(null);
  const [modalComplaintCategory, setModalComplaintCategory] = useState<string>('Quality Dispute');
  const [modalComplaintDescription, setModalComplaintDescription] = useState<string>('');
  const [modalComplaintPriority, setModalComplaintPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  // My Orders Tab Filter
  const [myOrdersFilter, setMyOrdersFilter] = useState<'ALL' | 'DELIVERED' | 'PAID' | 'IN_TRANSIT'>('ALL');

  // Sync with userProfile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setBuyerName(userProfile.name);
      if (userProfile.districtId) {
        setBuyerDistrictId(userProfile.districtId);
        setModalDeliveryDistrictId(userProfile.districtId);
      }
    }
  }, [userProfile]);

  const buyerZone = useMemo(() => {
    return zones.find((z) => z.zoneId === buyerDistrictId) || zones[0];
  }, [zones, buyerDistrictId]);

  const allZoneIds = useMemo(() => zones.map((z) => z.zoneId), [zones]);

  // Total cart items count calculation
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + 1, 0);
  }, [cartItems]);

  // High Demand listings logic
  const highlyDemandedListings = useMemo(() => {
    return listings.filter((l) => {
      if (l.status !== 'AVAILABLE') return false;
      const isHighStatus = l.sellabilityStatus === 'HIGH_DEMAND';
      const isRisingTrend = l.priceTrend7d === 'RISING';
      const isGenerallyPopular = ['C_CHILLI', 'C_COTTON', 'C_TURMERIC', 'C_PADDY', 'C_WHEAT'].includes(l.cropId);
      return isHighStatus || isRisingTrend || isGenerallyPopular;
    });
  }, [listings]);

  // Slide Counts
  const countsPerSlide = useMemo(() => {
    const totalAvail = listings.filter((l) => l.status === 'AVAILABLE').length;
    let districtAvail = listings.filter((l) => l.status === 'AVAILABLE' && l.zoneId === buyerDistrictId).length;
    if (districtAvail === 0) {
      const sameStateCount = listings.filter((l) => {
        const z = zones.find((zn) => zn.zoneId === l.zoneId);
        return l.status === 'AVAILABLE' && z?.state === buyerZone.state;
      }).length;
      districtAvail = sameStateCount > 0 ? sameStateCount : Math.min(totalAvail, 4);
    }
    const highDemandAvail = highlyDemandedListings.length;
    return {
      all: totalAvail,
      myDistrict: districtAvail,
      highDemand: highDemandAvail,
      myOrders: orders.length
    };
  }, [listings, buyerDistrictId, highlyDemandedListings, zones, buyerZone, orders]);

  // Matched listings according to active slide and search filters
  const matchedListings = useMemo(() => {
    const result = listings.filter((listing) => {
      if (listing.status !== 'AVAILABLE') return false;

      // Slide 1: All Available Crops (National Marketplace)
      // Slide 2: Crops in My District (Local Harvest)
      if (activeSlide === 'my_district' && listing.zoneId !== buyerDistrictId) {
        return false;
      }

      // Slide 3: High Demand / Best Market Rates
      if (activeSlide === 'highly_demanded') {
        const isHigh = highlyDemandedListings.some((hl) => hl.listingId === listing.listingId);
        if (!isHigh) return false;
      }

      const crop = crops.find((c) => c.cropId === listing.cropId);

      // Category filter
      if (selectedCropCategory !== 'ALL') {
        const cat = (crop?.category || '').toLowerCase();
        const target = selectedCropCategory.toLowerCase();
        const matches = cat === target ||
          (target === 'commercial' && (cat === 'cash crop' || cat === 'commercial')) ||
          (target === 'food grains' && (cat === 'food grains' || cat === 'grains' || cat === 'cereal')) ||
          (target === 'pulses' && (cat === 'pulses' || cat === 'pulse')) ||
          (target === 'spices' && cat === 'spices') ||
          (target === 'vegetables' && (cat === 'horticulture/vegetables' || cat === 'vegetables' || cat === 'horticulture'));
        if (!matches) return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const cropMatch = crop?.cropName.toLowerCase().includes(q) || false;
        const farmerMatch = (listing.farmerName || '').toLowerCase().includes(q);
        const zoneMatch = listing.zoneId.toLowerCase().includes(q) || 
          (zones.find((z) => z.zoneId === listing.zoneId)?.districtRegion || '').toLowerCase().includes(q);
        if (!cropMatch && !farmerMatch && !zoneMatch) {
          return false;
        }
      }

      return true;
    });

    // GUARANTEE: "Slide 2: Crops in My District" never shows an empty state ("No Crops Found")
    if (activeSlide === 'my_district' && result.length === 0) {
      // 1. Check all lots in the district (ignoring strict category/search filters)
      const districtAny = listings.filter((l) => l.status === 'AVAILABLE' && l.zoneId === buyerDistrictId);
      if (districtAny.length > 0) {
        return districtAny;
      }

      // 2. Fall back to regional state lots
      const sameStateListings = listings.filter((l) => {
        if (l.status !== 'AVAILABLE') return false;
        const z = zones.find((zn) => zn.zoneId === l.zoneId);
        return z && z.state === buyerZone.state;
      });
      if (sameStateListings.length > 0) {
        return sameStateListings;
      }

      // 3. Fall back to nearest available harvest lots
      return listings.filter((l) => l.status === 'AVAILABLE').slice(0, 6);
    }

    return result;
  }, [listings, activeSlide, buyerDistrictId, selectedCropCategory, searchQuery, crops, highlyDemandedListings, zones, buyerZone]);

  // Standardized buyer catalog card records
  const catalogCards = useMemo(() => {
    return matchedListings.map((listing) => {
      const crop = crops.find((c) => c.cropId === listing.cropId);
      const originZone = zones.find((z) => z.zoneId === listing.zoneId) || zones[0];
      const farmer = farmers.find((f) => f.farmerId === listing.farmerId);

      const availableQ = listing.quantityQuintals ?? (listing.quantityTons ?? 0) * 10;
      const availableKg = listing.quantityAvailableKg ?? availableQ * 100;

      // Official Mandi Market Rate in bold (₹185 / kg or ₹18,500 / q)
      const officialMandiRatePerKg = listing.askingPricePerKg || Math.round(listing.askingPricePerQuintal / 100);
      const officialMandiRatePerQ = listing.askingPricePerQuintal || officialMandiRatePerKg * 100;

      const isHighDemand = highlyDemandedListings.some((hl) => hl.listingId === listing.listingId);
      const isLocal = originZone.zoneId === buyerDistrictId;
      const isWishlisted = wishlistIds.includes(listing.listingId);
      const defaultRating = getListingRating(listing.listingId);
      const matchingReviews = (reviews || []).filter(
        (r) => (r.listingId && r.listingId === listing.listingId) || r.cropId === listing.cropId
      );
      let calculatedRating = defaultRating.rating;
      let calculatedCount = defaultRating.count;
      if (matchingReviews.length > 0) {
        const sum = matchingReviews.reduce((acc, r) => acc + r.rating, 0);
        calculatedRating = (sum / matchingReviews.length).toFixed(1);
        calculatedCount = matchingReviews.length + 85;
      }
      const ratingInfo = {
        rating: calculatedRating,
        count: calculatedCount,
        hasUserReviews: matchingReviews.length > 0
      };
      const imageUrl = CROP_IMAGE_MAP[listing.cropId] || DEFAULT_CROP_IMAGE;

      return {
        listing,
        crop,
        originZone,
        farmer,
        availableKg,
        availableQ,
        officialMandiRatePerKg,
        officialMandiRatePerQ,
        isHighDemand,
        isLocal,
        isWishlisted,
        ratingInfo,
        imageUrl,
      };
    });
  }, [matchedListings, crops, zones, farmers, buyerDistrictId, highlyDemandedListings, wishlistIds, reviews]);

  // Open Details Modal for a selected card
  const handleOpenDetailsModal = (listing: CropListing) => {
    setSelectedListingForModal(listing);
    setModalQuantityKg(60); // standard default 60 kg
    setModalDeliveryDistrictId(buyerDistrictId);
    setOrderConfirmed(false);
  };

  // Calculation for the open modal
  const modalCalculations = useMemo(() => {
    if (!selectedListingForModal) return null;
    const listing = selectedListingForModal;
    const crop = crops.find((c) => c.cropId === listing.cropId);
    const originZone = zones.find((z) => z.zoneId === listing.zoneId) || zones[0];
    const destZone = zones.find((z) => z.zoneId === modalDeliveryDistrictId) || buyerZone;
    const farmer = farmers.find((f) => f.farmerId === listing.farmerId);

    // Official Mandi Rate
    const mandiRatePerKg = listing.askingPricePerKg || Math.round(listing.askingPricePerQuintal / 100);
    const mandiRatePerQ = listing.askingPricePerQuintal || mandiRatePerKg * 100;

    const qtyKg = Math.max(1, modalQuantityKg);
    const qtyQuintals = Math.round((qtyKg / 100) * 100) / 100;

    // Produce Cost = Quantity x Mandi Rate
    const produceCostINR = Math.round(qtyKg * mandiRatePerKg);

    // Delivery Fee via Shortest Road Corridor (Dijkstra algorithm)
    const dijkstraResult = runDijkstra(routes, allZoneIds, originZone.zoneId, destZone.zoneId);
    const isLocalDelivery = originZone.zoneId === destZone.zoneId;
    const freightRatePerQ = isLocalDelivery ? 0 : (dijkstraResult.totalCostPerQuintal || 0);
    const transportFreightINR = Math.round(qtyQuintals * freightRatePerQ);

    // APMC Mandi Cess (1%)
    const apmcCessINR = Math.round(produceCostINR * 0.01 * 100) / 100;

    // Total Amount Payable = Crop Produce Cost + Delivery Fee
    const totalAmountPayableINR = produceCostINR + transportFreightINR;

    const availableKg = listing.quantityAvailableKg ?? (listing.quantityQuintals * 100);
    const isSufficientStock = availableKg >= qtyKg;

    return {
      listing,
      crop,
      originZone,
      destZone,
      farmer,
      mandiRatePerKg,
      mandiRatePerQ,
      qtyKg,
      qtyQuintals,
      produceCostINR,
      transportFreightINR,
      apmcCessINR,
      totalAmountPayableINR,
      dijkstraResult,
      isLocalDelivery,
      availableKg,
      isSufficientStock
    };
  }, [selectedListingForModal, modalQuantityKg, modalDeliveryDistrictId, crops, zones, farmers, routes, allZoneIds, buyerZone]);

  // Execute Direct Order Placement (Buy Now)
  const handleExecutePlaceOrder = () => {
    if (!modalCalculations) return;
    const { 
      listing, 
      crop, 
      originZone, 
      destZone, 
      farmer, 
      qtyKg, 
      qtyQuintals, 
      mandiRatePerKg, 
      produceCostINR, 
      transportFreightINR, 
      totalAmountPayableINR, 
      dijkstraResult 
    } = modalCalculations;

    const poNumber = `ORD-AP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `PAY-APMC-${Math.floor(100 + Math.random() * 900)}`;
    const txnRef = `TXN-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`;

    setConfirmedOrderId(poNumber);
    setOrderConfirmed(true);

    const newOrder: Order = {
      orderId: poNumber,
      listingId: listing.listingId,
      cropId: crop?.cropId || 'C_CHILLI',
      cropName: crop?.cropName || 'Commodity Produce',
      cropIcon: CROP_ICONS[listing.cropId] || '🌾',
      farmerId: listing.farmerId,
      farmerName: listing.farmerName || 'AP Producer',
      farmerPhone: farmer?.phone || '+91 94401 00000',
      buyerId: userProfile?.id || activeBuyerId || 'BUY_001',
      buyerName: buyerName,
      buyerPhone: '+91 98480 99999',
      sourceZoneId: originZone.zoneId,
      destZoneId: destZone.zoneId,
      quantityKg: qtyKg,
      quantityQuintals: qtyQuintals,
      pricePerKg: mandiRatePerKg,
      produceCostInr: produceCostINR,
      transitFreightCostInr: transportFreightINR,
      totalAmountInr: totalAmountPayableINR,
      status: 'PLACED',
      dijkstraRoute: dijkstraResult.path,
      highwayRef: dijkstraResult.hopDetails[0]?.highway || 'NH-16 Coastal Trunk',
      trackingNumber: `TRK-APMC-${Math.floor(100000 + Math.random() * 900000)}`,
      transitDistanceKm: dijkstraResult.totalDistanceKm,
      estimatedTransitHours: dijkstraResult.totalDurationHours || 3.5,
      placedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentRef: txnRef,
      vehicleLorryNumber: `AP ${Math.floor(10 + Math.random() * 20)} TC ${Math.floor(1000 + Math.random() * 9000)}`,
      currentLocationNote: `Order registered with status 'PLACED'. Preparing for inspection at ${originZone.zoneName}.`
    };

    const cess = Math.round(produceCostINR * 0.01 * 100) / 100;
    const newReceipt: PaymentReceipt = {
      paymentId: paymentId,
      transactionRef: txnRef,
      orderId: poNumber,
      buyerName: buyerName,
      buyerDistrict: destZone.districtRegion,
      farmerName: listing.farmerName || 'AP Producer',
      farmerDistrict: originZone.districtRegion,
      cropName: crop?.cropName || 'Commodity Produce',
      quantityKg: qtyKg,
      quantityQuintals: qtyQuintals,
      unitPricePerKg: mandiRatePerKg,
      produceAmountInr: produceCostINR,
      transitFreightInr: transportFreightINR,
      apmcCessInr: cess,
      totalAmountInr: totalAmountPayableINR + cess,
      paymentMode: 'UPI Instant Mandi Settlement (e-NAM / PhonePe)',
      paymentStatus: 'COMPLETED',
      paidAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dijkstraCorridor: `${dijkstraResult.path.join(' -> ')} (${dijkstraResult.totalDistanceKm} km)`
    };

    if (onPlaceOrder) {
      onPlaceOrder(newOrder, newReceipt);
    }
  };

  // Add to cart from modal or card
  const handleAddToCartQuick = (listing: CropListing, quantityKg: number = 60) => {
    if (onAddToCart) {
      onAddToCart(listing, quantityKg, buyerDistrictId);
      const crop = crops.find((c) => c.cropId === listing.cropId);
      setAddedToCartToast(`${crop?.cropName || 'Crop'} (${quantityKg} kg) ${t('addedToCart', language)}`);
      setTimeout(() => setAddedToCartToast(null), 3000);
    }
  };

  // Filtered orders for "My Orders & Purchases" slide
  const filteredBuyerOrders = useMemo(() => {
    return orders.filter((o) => {
      if (myOrdersFilter === 'ALL') return true;
      if (myOrdersFilter === 'DELIVERED') return o.status === 'DELIVERED';
      if (myOrdersFilter === 'PAID') return o.status === 'PAID';
      if (myOrdersFilter === 'IN_TRANSIT') return o.status === 'IN_TRANSIT' || o.status === 'PACKED';
      return true;
    });
  }, [orders, myOrdersFilter]);

  // Review submission handler
  const handleBuyerSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    const newRev: CropReview = {
      reviewId: `rev-${Date.now()}`,
      cropId: selectedOrderForReview.cropId,
      cropName: selectedOrderForReview.cropName,
      listingId: selectedOrderForReview.listingId,
      orderId: selectedOrderForReview.orderId,
      buyerId: selectedOrderForReview.buyerId,
      buyerName: buyerName || selectedOrderForReview.buyerName || 'Buyer',
      rating: modalReviewRating,
      qualityFeedback: modalReviewFeedback.trim() || 'Fresh lot received as promised, verified APMC grade standard.',
      createdAt: new Date().toISOString()
    };
    if (onAddReview) {
      onAddReview(newRev);
    }
    setSelectedOrderForReview(null);
    setModalReviewFeedback('');
    setAddedToCartToast(`⭐ Review submitted! Rating of ${modalReviewRating}★ updated in dynamic catalog.`);
    setTimeout(() => setAddedToCartToast(null), 4000);
  };

  // Complaint submission handler
  const handleBuyerSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForComplaint) return;
    const newComp: FarmerComplaint = {
      complaintId: `CMP-${Date.now().toString().slice(-4)}`,
      orderId: selectedOrderForComplaint.orderId,
      listingId: selectedOrderForComplaint.listingId || `LOT-${selectedOrderForComplaint.cropId}`,
      cropName: selectedOrderForComplaint.cropName,
      buyerId: selectedOrderForComplaint.buyerId,
      buyerName: buyerName || selectedOrderForComplaint.buyerName || 'Buyer',
      farmerId: selectedOrderForComplaint.farmerId,
      farmerName: selectedOrderForComplaint.farmerName || 'Farmer',
      category: modalComplaintCategory,
      subject: `${modalComplaintCategory} - Order #${selectedOrderForComplaint.orderId}`,
      description: modalComplaintDescription.trim() || `Dispute raised regarding ${modalComplaintCategory.toLowerCase()} for ${selectedOrderForComplaint.quantityKg} kg of ${selectedOrderForComplaint.cropName}.`,
      priority: modalComplaintPriority,
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (onAddComplaint) {
      onAddComplaint(newComp);
    }
    setSelectedOrderForComplaint(null);
    setModalComplaintDescription('');
    setAddedToCartToast(`⚠️ Complaint ticket ${newComp.complaintId} routed to Farmer's Portal Tab 4!`);
    setTimeout(() => setAddedToCartToast(null), 5000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {addedToCartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#E9C46A] flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#E9C46A] shrink-0" />
          <span className="text-xs font-bold">{addedToCartToast}</span>
        </div>
      )}

      {/* ======================================================================
          1. TOP STICKY HEADER (Flipkart & Meesho Inspired Mobile App Header)
          - Left back/menu icon
          - Large central search bar with placeholder: "Search crops, grains, pulses, districts..."
          - Top Right Shopping Cart Icon (🛒) with a red item counter badge
          - Wishlist Icon (❤️)
         ====================================================================== */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-[#E2DAC5] rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left Back / Filter Reset Icon */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCropCategory('ALL');
              setActiveSlide('all_crops');
            }}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition cursor-pointer shrink-0"
            title="Reset Filters & Back to All"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
          </button>

          {/* Large Central Search Bar with Placeholder */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#52796F] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops, grains, pulses, districts..."
              className="w-full bg-[#FAF7EE] hover:bg-[#F4F1DE]/60 border border-[#D8CDB2] text-[#1B4332] font-semibold rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#52796F] hover:text-[#1B4332] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Top Right Wishlist & Shopping Cart Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wishlist Heart Icon */}
            {onOpenWishlist && (
              <button
                type="button"
                onClick={onOpenWishlist}
                className="relative p-2 rounded-xl border border-stone-200 hover:border-red-400 bg-white hover:bg-red-50 text-stone-700 hover:text-red-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={t('tooltipWishlist', language)}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-100" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                    {wishlistIds.length}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Icon (🛒) with Red Counter Badge */}
            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm ring-1 ring-emerald-600/30"
                title={t('tooltipCart', language)}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9C46A]" />
                <span className="hidden md:inline text-xs font-bold">{t('cart', language)}</span>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

            {/* My Orders (📦) Button with Live Purchase Counter */}
            <button
              type="button"
              onClick={() => {
                if (onOpenOrders) {
                  onOpenOrders();
                } else {
                  setActiveSlide('my_orders');
                }
              }}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-[#E9C46A]/40"
              title="My Orders & Purchases (📦)"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9C46A]" />
              <span className="hidden md:inline text-xs font-bold">Orders</span>
              {orders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-amber-500 text-[#1B4332] text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Location Region Selector Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E2DAC5]/60 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700 font-semibold truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-[#52796F]">{t('selectRegion', language)}:</span>
            <select
              value={buyerDistrictId}
              onChange={(e) => setBuyerDistrictId(e.target.value)}
              className="bg-transparent text-emerald-950 font-bold border-b border-emerald-600 focus:outline-hidden cursor-pointer text-xs"
              title={t('tooltipDeliveryDistrict', language)}
            >
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.districtRegion} ({z.state})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
            ✓ Verified APMC Hub
          </span>
        </div>
      </div>

      {/* ======================================================================
          2. CLEAN 4-SLIDE CATALOG
          - Slide 1: All Available Crops (National Marketplace)
          - Slide 2: Crops in My District (Local Harvest)
          - Slide 3: High Demand / Best Market Rates
          - Slide 4: My Orders & Purchases (Ratings & Complaints)
         ====================================================================== */}
      <div className="bg-white border-2 border-[#2D6A4F]/20 rounded-2xl p-2 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Slide 1: All Available Crops */}
          <button
            type="button"
            onClick={() => setActiveSlide('all_crops')}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer border ${
              activeSlide === 'all_crops'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#E9C46A]/50'
                : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#1B4332] border-[#E2DAC5]'
            }`}
            title={t('tooltipSlideAll', language)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">🌾</span>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold truncate">
                  {t('allAvailableCrops', language)}
                </div>
                <p className={`text-[10px] sm:text-[11px] truncate ${activeSlide === 'all_crops' ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                  {t('nationalMarketplace', language)}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
              activeSlide === 'all_crops' ? 'bg-[#E9C46A] text-[#1B4332]' : 'bg-[#EAE6D6] text-[#1B4332]'
            }`}>
              {countsPerSlide.all}
            </span>
          </button>

          {/* Slide 2: Crops in My District */}
          <button
            type="button"
            onClick={() => setActiveSlide('my_district')}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer border ${
              activeSlide === 'my_district'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#E9C46A]/50'
                : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#1B4332] border-[#E2DAC5]'
            }`}
            title={t('tooltipSlideDistrict', language)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">📍</span>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold truncate">
                  {t('cropsInMyDistrict', language)}
                </div>
                <p className={`text-[10px] sm:text-[11px] truncate ${activeSlide === 'my_district' ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                  {buyerZone.districtRegion.replace(' District', '')} &bull; {t('localHarvest', language)}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
              activeSlide === 'my_district' ? 'bg-[#E9C46A] text-[#1B4332]' : 'bg-[#EAE6D6] text-[#1B4332]'
            }`}>
              {countsPerSlide.myDistrict}
            </span>
          </button>

          {/* Slide 3: High Demand / Best Market Rates */}
          <button
            type="button"
            onClick={() => setActiveSlide('highly_demanded')}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer border ${
              activeSlide === 'highly_demanded'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#E9C46A]/50'
                : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#1B4332] border-[#E2DAC5]'
            }`}
            title={t('tooltipSlideDemand', language)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">🔥</span>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold truncate">
                  {t('highDemandCrops', language)}
                </div>
                <p className={`text-[10px] sm:text-[11px] truncate ${activeSlide === 'highly_demanded' ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                  {t('bestMarketRates', language)}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
              activeSlide === 'highly_demanded' ? 'bg-amber-400 text-stone-900 font-black' : 'bg-[#EAE6D6] text-[#1B4332]'
            }`}>
              {countsPerSlide.highDemand}
            </span>
          </button>

          {/* Slide 4: My Orders & Purchases */}
          <button
            type="button"
            onClick={() => setActiveSlide('my_orders')}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer border ${
              activeSlide === 'my_orders'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#E9C46A]/50'
                : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#1B4332] border-[#E2DAC5]'
            }`}
            title="View delivered and paid orders, submit ratings & complaints"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">📦</span>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold truncate">
                  {t('myOrdersPurchases', language)}
                </div>
                <p className={`text-[10px] sm:text-[11px] truncate ${activeSlide === 'my_orders' ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                  Ratings & Complaints
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
              activeSlide === 'my_orders' ? 'bg-[#E9C46A] text-[#1B4332]' : 'bg-[#EAE6D6] text-[#1B4332]'
            }`}>
              {countsPerSlide.myOrders}
            </span>
          </button>
        </div>
      </div>

      {activeSlide === 'my_orders' ? (
        /* ================= MY ORDERS & PURCHASES HUB ================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2DAC5] p-4 rounded-2xl shadow-xs">
            <div>
              <h3 className="text-base font-bold text-[#1B4332] flex items-center gap-2">
                <span>📦</span>
                <span>{t('myOrdersPurchases', language)}</span>
                <span className="text-xs font-mono font-bold bg-[#FAF7EE] text-[#2D6A4F] px-2.5 py-0.5 rounded-full border border-[#E2DAC5]">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h3>
              <p className="text-xs text-[#52796F] mt-0.5">
                Rate crop lots or raise grievances directly routed to responsible APMC farmers.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'DELIVERED', 'PAID', 'IN_TRANSIT'] as const).map((flt) => {
                const isSelected = myOrdersFilter === flt;
                const count = orders.filter((o) => {
                  if (flt === 'ALL') return true;
                  if (flt === 'DELIVERED') return o.status === 'DELIVERED';
                  if (flt === 'PAID') return o.status === 'PAID';
                  if (flt === 'IN_TRANSIT') return o.status === 'IN_TRANSIT' || o.status === 'PACKED';
                  return true;
                }).length;
                return (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setMyOrdersFilter(flt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                        : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-stone-700 border-[#E2DAC5]'
                    }`}
                  >
                    <span>{flt === 'ALL' ? 'All' : flt === 'DELIVERED' ? t('orderStatusDelivered', language) : flt === 'PAID' ? t('orderStatusPaid', language) : t('orderStatusInTransit', language)}</span>
                    <span className="ml-1.5 text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredBuyerOrders.length === 0 ? (
            <div className="bg-white border border-[#E2DAC5] rounded-2xl p-10 text-center space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="text-sm font-bold text-[#1B4332]">No Orders in This View</h3>
              <p className="text-xs text-[#52796F] max-w-md mx-auto">
                No purchases matching filter "{myOrdersFilter}". Browse harvest lots in "All Available Crops" to place new orders.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMyOrdersFilter('ALL');
                  setActiveSlide('all_crops');
                }}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold transition hover:bg-[#1B4332] cursor-pointer"
              >
                Browse Crop Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBuyerOrders.map((o) => {
                const isDeliveredOrPaid = o.status === 'DELIVERED' || o.status === 'PAID';
                const matchingReview = (reviews || []).find((r) => r.orderId === o.orderId || (r.cropId === o.cropId && r.buyerId === o.buyerId));

                return (
                  <div
                    key={o.orderId}
                    className="bg-white border border-[#E2DAC5] hover:border-[#2D6A4F] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition space-y-3.5"
                  >
                    {/* Order Top Bar: Order ID, Date, and Status Badge */}
                    <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#FAF7EE] text-[#1B4332] px-2 py-0.5 rounded-md border border-[#E2DAC5]">
                          {o.orderId}
                        </span>
                        <span className="text-[11px] text-[#52796F]">{o.placedAt}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : o.status === 'PAID'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : o.status === 'IN_TRANSIT' || o.status === 'PACKED'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-stone-100 text-stone-700 border-stone-300'
                      }`}>
                        {translateStatus(o.status, language)}
                      </span>
                    </div>

                    {/* Produce Details */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5]">
                          {o.cropIcon || CROP_ICONS[o.cropId] || '🌾'}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#1B4332]">
                            {o.cropName}
                          </h4>
                          <p className="text-xs text-[#52796F]">
                            Quantity: <strong className="text-[#1B4332] font-mono">{o.quantityKg.toLocaleString('en-IN')} kg</strong> ({o.quantityQuintals} Quintals)
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Farmer: <strong>{o.farmerName}</strong> &bull; APMC Hub: {o.sourceZoneId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#52796F] block">Total Amount</span>
                        <span className="text-base font-bold font-mono text-[#1B4332]">
                          ₹{o.totalAmountInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Review Badge if already submitted */}
                    {matchingReview && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">⭐ {matchingReview.rating}.0 / 5.0</span>
                          <span className="text-stone-700 italic truncate max-w-xs">
                            "{matchingReview.qualityFeedback}"
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          Reviewed ✓
                        </span>
                      </div>
                    )}

                    {/* ACTION BUTTONS: Each delivered or paid order must have [⭐ Write Review] and [⚠️ Raise Complaint] */}
                    <div className="pt-2 border-t border-[#E2DAC5] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isDeliveredOrPaid ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForReview(o);
                                setModalReviewRating(5);
                                setModalReviewFeedback('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Write a 1-5 star review with quality feedback"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>⭐ {t('writeReview', language)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForComplaint(o);
                                setModalComplaintCategory('Quality Dispute');
                                setModalComplaintDescription('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Raise complaint ticket directly to responsible farmer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>⚠️ {t('raiseComplaint', language)}</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-stone-500 italic">
                            Order currently {translateStatus(o.status, language).toLowerCase()}. Review & Complaint unlock on payment/delivery.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(o.orderId)}
                            className="p-1.5 rounded-lg border border-[#E2DAC5] hover:bg-[#FAF7EE] text-[#1B4332] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="View Payment Receipt"
                          >
                            <ReceiptText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>
                        )}
                        {onTrackOrder && (
                          <button
                            type="button"
                            onClick={() => onTrackOrder(o.orderId)}
                            className="p-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Track Live Transit"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#E9C46A]" />
                            <span className="hidden sm:inline">Track</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'Food Grains', 'Commercial', 'Pulses', 'Spices', 'Vegetables'].map((cat) => {
          const isSelected = selectedCropCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCropCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#1B4332] text-[#E9C46A] shadow-xs font-bold ring-1 ring-[#1B4332]'
                  : 'bg-white text-stone-700 hover:bg-[#FAF7EE] border border-stone-200'
              }`}
            >
              {cat === 'ALL' ? '🌾 All Commodities' : cat}
            </button>
          );
        })}
      </div>

      {/* ======================================================================
          3. CLEAN 2-COLUMN PRODUCT GRID (Meesho & Flipkart Mobile Shopping UI)
          - Render crop listings in a modern 2-column mobile card layout:
            grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
          - Crop Image occupying top half
          - Floating Wishlist Heart Icon (🤍 turns red ❤️ when clicked) on top-right
          - Rating Badge on bottom-left of image (e.g., "4.8 ★")
          - Bold Crop Title (e.g., "Guntur Red Chilli - Teja")
          - Farmer Name & District Location (e.g., "Samba Rao • Guntur")
          - Official Mandi Market Rate in bold (e.g., "₹185 / kg")
          - Stock Availability Tag (e.g., "In Stock" or "Only few Quintals left")
         ====================================================================== */}
      {catalogCards.length === 0 ? (
        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-10 text-center space-y-3">
          <div className="text-4xl">🌾</div>
          <h3 className="text-sm font-bold text-[#1B4332]">No Crops Found</h3>
          <p className="text-xs text-[#52796F] max-w-md mx-auto">
            {activeSlide === 'my_district'
              ? `No active farmer lots found in ${buyerZone.districtRegion}. Switch to "${t('allAvailableCrops', language)}" to browse harvest lots with direct delivery.`
              : 'Try clearing your search query or switching to another category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCropCategory('ALL');
              setActiveSlide('all_crops');
            }}
            className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold transition hover:bg-[#1B4332] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {catalogCards.map((card) => {
            const { 
              listing, 
              crop, 
              originZone, 
              availableKg, 
              officialMandiRatePerKg, 
              officialMandiRatePerQ,
              isHighDemand, 
              isWishlisted,
              ratingInfo,
              imageUrl,
            } = card;

            return (
              <div
                key={listing.listingId}
                className="bg-white border border-[#E2DAC5] hover:border-[#2D6A4F] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group relative"
              >
                {/* TOP HALF: Crop Image / Thumbnail with Floating Heart & Rating Badge */}
                <div 
                  className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenDetailsModal(listing)}
                >
                  <img
                    src={imageUrl}
                    alt={crop?.cropName || 'Crop'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if image network fails
                      (e.target as HTMLImageElement).src = DEFAULT_CROP_IMAGE;
                    }}
                  />
                  {/* Subtle Gradient Overlay for badge contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

                  {/* Top-Left Category Icon & Commodity Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    <span>{CROP_ICONS[listing.cropId] || '🌾'}</span>
                    <span className="hidden sm:inline">{translateCategory(crop?.category || 'Commercial', language)}</span>
                  </div>

                  {/* Top-Right Floating Wishlist Heart Icon (🤍 turns red ❤️ when clicked) */}
                  {onToggleWishlist && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(listing.listingId);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition cursor-pointer shadow-md ${
                        isWishlisted 
                          ? 'bg-white text-red-600 scale-110' 
                          : 'bg-black/40 text-white hover:bg-white hover:text-red-500'
                      }`}
                      title={t('tooltipWishlist', language)}
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} 
                      />
                    </button>
                  )}

                  {/* Bottom-Left Rating Badge (e.g., "4.8 ★") */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-700/90 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black shadow-sm">
                    <span>{ratingInfo.rating}</span>
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span className="text-[9px] text-emerald-100 font-normal hidden sm:inline">
                      ({ratingInfo.count})
                    </span>
                  </div>

                  {/* Bottom-Right High Demand Tag */}
                  {isHighDemand && (
                    <div className="absolute bottom-2 right-2 bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-xs">
                      🔥 {t('highDemand', language)}
                    </div>
                  )}
                </div>

                {/* BOTTOM HALF: Product Details, Farmer Location & Mandi Rates */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    {/* Bold Crop Title (e.g., "Guntur Red Chilli - Teja") */}
                    <h3 
                      onClick={() => handleOpenDetailsModal(listing)}
                      className="text-xs sm:text-sm font-bold text-[#1B4332] line-clamp-1 hover:text-[#2D6A4F] transition cursor-pointer leading-tight"
                      title={crop?.cropName || listing.cropId}
                    >
                      {translateCrop(listing.cropId, language)}
                    </h3>

                    {/* Farmer Name & District Location (e.g., "Samba Rao • Guntur") */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#52796F] truncate">
                      <MapPin className="w-3 h-3 text-[#2D6A4F] shrink-0" />
                      <span className="truncate font-medium">
                        {listing.farmerName || 'AP Farmer'} &bull; {originZone.districtRegion.replace(' District', '')}
                      </span>
                    </div>

                    {/* Stock Availability Tag (e.g., "In Stock" or "Only few Quintals left") */}
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      {availableKg > 2000 ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          ✓ {t('inStock', language)}
                        </span>
                      ) : (
                        <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                          ⚡ {t('onlyFewLeft', language)}
                        </span>
                      )}
                      <span className="font-mono text-[#52796F] text-[10px]">
                        {availableKg.toLocaleString('en-IN')} kg
                      </span>
                    </div>

                    {/* Official Mandi Market Rate in Bold (₹/kg and ₹/q) */}
                    <div className="pt-1.5 border-t border-[#FAF7EE] flex items-baseline justify-between">
                      <span className="text-[10px] text-[#52796F] truncate">{t('mandiRate', language)}:</span>
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-extrabold font-mono text-[#1B4332]">
                          ₹{officialMandiRatePerKg.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#52796F] font-semibold"> / kg</span>
                        <div className="text-[9px] text-[#2D6A4F] font-bold font-mono">
                          (₹{officialMandiRatePerQ.toLocaleString('en-IN')}/q)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons: "+ Cart" & "Buy Now / View Details" */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddToCartQuick(listing, 60)}
                      className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 text-[11px] sm:text-xs font-bold transition border border-stone-200 hover:border-emerald-300 flex items-center justify-center gap-1 cursor-pointer"
                      title={t('tooltipAddToCart', language)}
                    >
                      <Plus className="w-3 h-3 text-emerald-700" />
                      <span>{t('cart', language)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDetailsModal(listing)}
                      className="py-1.5 px-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#143326] text-white text-[11px] sm:text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      title={t('tooltipViewDetails', language)}
                    >
                      <ShoppingBag className="w-3 h-3 text-[#E9C46A]" />
                      <span>{t('buyNow', language)}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* ======================================================================
          4. PRODUCT CLICK & CHECKOUT MODAL (Clean Detail & Buying Slide-Over)
          - Select Weight/Quantity (e.g., 60 kg, 100 kg, 5 Quintals)
          - Calculated Total Price = Weight x Mandi Rate
          - Transport Freight Fee (calculated via Java ADSA Dijkstra graph route)
          - "Add to Cart" and "Buy Now" buttons
         ====================================================================== */}
      {selectedListingForModal && modalCalculations && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 border-[#2D6A4F] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] flex items-center justify-center text-3xl overflow-hidden">
                  {CROP_ICONS[modalCalculations.listing.cropId] || '🌾'}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1B4332]">
                    {orderConfirmed ? t('orderPlaced', language) : translateCrop(modalCalculations.listing.cropId, language)}
                  </h3>
                  <p className="text-xs text-[#52796F]">
                    {orderConfirmed 
                      ? `Order ID: ${confirmedOrderId}` 
                      : `From ${modalCalculations.listing.farmerName} &bull; ${modalCalculations.originZone.districtRegion}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListingForModal(null)}
                className="p-1.5 rounded-lg hover:bg-[#FAF7EE] text-[#52796F] cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderConfirmed ? (
              /* Order Confirmation Screen (Clean 2-button row & summary box) */
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xs border border-gray-100 space-y-4">
                {/* Alert banner */}
                <p className="text-sm text-gray-600">
                  Instant alert sent to farmer <strong>{modalCalculations.listing.farmerName}</strong> for <strong>{modalCalculations.qtyKg} kg ({modalCalculations.qtyQuintals} q)</strong> of <strong>{translateCrop(modalCalculations.listing.cropId, language)}</strong>.
                </p>

                {/* Specific Item Summary Box */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-semibold text-emerald-600">🟡 PLACED / Processing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Produce Cost:</span>
                    <span>₹{modalCalculations.produceCostINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Fee:</span>
                    <span>{modalCalculations.isLocalDelivery ? '₹0 (Intradistrict)' : `₹${modalCalculations.transportFreightINR.toLocaleString('en-IN')}`}</span>
                  </div>
                  <hr className="my-2 border-gray-200" />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Final Total Payable:</span>
                    <span className="text-emerald-800">₹{modalCalculations.totalAmountPayableINR.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions: Clean 2-button row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  {onTrackOrder && (
                    <button 
                      type="button"
                      onClick={() => {
                        const oid = confirmedOrderId;
                        setSelectedListingForModal(null);
                        onTrackOrder(oid);
                      }}
                      className="w-full sm:flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <span>🚚</span>
                      <span>Track This Order</span>
                    </button>
                  )}

                  {onViewReceipt && (
                    <button 
                      type="button"
                      onClick={() => {
                        const oid = confirmedOrderId;
                        setSelectedListingForModal(null);
                        onViewReceipt(oid);
                      }}
                      className="w-full sm:flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <span>📄</span>
                      <span>View Receipt</span>
                    </button>
                  )}
                </div>

                {onOpenOrders && (
                  <div className="text-center pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedListingForModal(null);
                        onOpenOrders();
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <span>📦</span>
                      <span>View All Purchases in My Orders Drawer &rarr;</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Modal Checkout Form */
              <div className="space-y-4 text-xs">
                {/* a) Full Crop Description & Official Mandi Rate */}
                <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#52796F] block">{t('mandiMarketRate', language)}:</span>
                    <span className="text-base font-bold font-mono text-[#1B4332]">
                      ₹{modalCalculations.mandiRatePerKg.toFixed(2)} / kg
                    </span>
                    <span className="text-[10px] text-[#52796F] block font-mono">
                      (₹{modalCalculations.mandiRatePerQ.toLocaleString('en-IN')} / Quintal)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#52796F] block">{t('inStockQuantity', language)}:</span>
                    <span className="text-xs font-bold font-mono text-[#2D6A4F]">
                      {modalCalculations.availableKg.toLocaleString('en-IN')} kg
                    </span>
                  </div>
                </div>

                {/* b) Select Weight/Quantity (e.g. 60 kg, 100 kg, 5 Quintals) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#1B4332] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t('enterQuantity', language)}:</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#52796F]">
                      {modalCalculations.qtyQuintals} {t('quintalsUnit', language)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={modalCalculations.availableKg}
                      value={modalQuantityKg}
                      onChange={(e) => setModalQuantityKg(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full bg-[#FAF7EE] border border-[#D8CDB2] text-[#1B4332] font-mono font-bold rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                      title={t('tooltipWeightInput', language)}
                    />
                    <span className="absolute right-3 top-2 font-bold text-xs text-[#2D6A4F] font-mono pointer-events-none">
                      KG
                    </span>
                  </div>

                  {/* Quantity Presets */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[10px] text-[#52796F]">Quick Presets:</span>
                    {[25, 60, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setModalQuantityKg(preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          modalQuantityKg === preset
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#FAF7EE] text-[#1B4332] border border-[#D8CDB2]'
                        }`}
                      >
                        {preset >= 100 ? `${preset / 100} Q (${preset} kg)` : `${preset} kg`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* c) Delivery Address / District Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#1B4332] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{t('deliveryAddress', language)}:</span>
                  </label>
                  <select
                    value={modalDeliveryDistrictId}
                    onChange={(e) => setModalDeliveryDistrictId(e.target.value)}
                    className="w-full bg-white border border-[#D8CDB2] text-[#1B4332] font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden cursor-pointer"
                    title={t('tooltipDeliveryDistrict', language)}
                  >
                    {zones.map((z) => (
                      <option key={z.zoneId} value={z.zoneId}>
                        {z.districtRegion} ({z.state})
                      </option>
                    ))}
                  </select>
                </div>

                {/* d) Delivery Fee Breakdown in ₹ (Dijkstra Calculation) */}
                <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2 font-mono">
                  <div className="flex justify-between font-sans">
                    <span className="text-[#52796F]">
                      Produce Price ({modalCalculations.qtyKg} kg &times; ₹{modalCalculations.mandiRatePerKg}):
                    </span>
                    <strong className="text-[#1B4332]">₹{modalCalculations.produceCostINR.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="flex justify-between font-sans">
                    <span className="text-[#52796F]">
                      {t('deliveryFee', language)}:
                    </span>
                    <strong className="text-[#264653]">
                      {modalCalculations.isLocalDelivery ? '₹0 (Intradistrict Pickup)' : `+₹${modalCalculations.transportFreightINR.toLocaleString('en-IN')}`}
                    </strong>
                  </div>

                  {/* Delivery Route / Corridors */}
                  <div className="text-[10px] text-[#52796F] bg-white p-2 rounded-lg border border-[#E2DAC5]">
                    {modalCalculations.isLocalDelivery ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Intradistrict delivery (Same day pickup from local yard)
                      </span>
                    ) : (
                      <div>
                        <span>Route: {modalCalculations.dijkstraResult.path.map((p) => p.replace('AP_', '')).join(' ➔ ')}</span>
                        <div className="text-[9px] text-[#52796F]">
                          Distance: {modalCalculations.dijkstraResult.totalDistanceKm} km along national highways
                        </div>
                      </div>
                    )}
                  </div>

                  {/* e) Final Total Payable Amount */}
                  <div className="pt-2 border-t border-[#D8CDB2] flex items-baseline justify-between font-sans">
                    <span className="font-bold text-[#1B4332] text-xs uppercase">
                      {t('finalTotalPayable', language)}:
                    </span>
                    <span className="text-lg font-bold font-mono text-[#1B4332]">
                      ₹{modalCalculations.totalAmountPayableINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* f) Buttons: Add to Cart & Buy Now */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2DAC5]">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCartQuick(modalCalculations.listing, modalCalculations.qtyKg);
                      setSelectedListingForModal(null);
                    }}
                    className="py-2.5 px-3 rounded-xl border-2 border-[#2D6A4F] text-[#1B4332] hover:bg-emerald-50 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title={t('tooltipAddToCart', language)}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#2D6A4F]" />
                    <span>{t('addToCart', language)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExecutePlaceOrder}
                    className="py-2.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#143326] text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40"
                    title={t('tooltipBuyNow', language)}
                  >
                    <Check className="w-4 h-4 text-[#E9C46A]" />
                    <span>{t('buyNow', language)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= POST-PURCHASE WRITE REVIEW MODAL ================= */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DAC5] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <h3 className="text-base font-bold text-[#1B4332]">{t('writeReview', language)}</h3>
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

            <form onSubmit={handleBuyerSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Rate Quality & Fulfillment (1 to 5 Stars):
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setModalReviewHover(star)}
                      onMouseLeave={() => setModalReviewHover(0)}
                      onClick={() => setModalReviewRating(star)}
                      className="p-1 transition transform hover:scale-125 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (modalReviewHover || modalReviewRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto font-mono font-bold text-sm text-[#1B4332]">
                    {modalReviewHover || modalReviewRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Quality Text Feedback:
                </label>
                <textarea
                  rows={3}
                  value={modalReviewFeedback}
                  onChange={(e) => setModalReviewFeedback(e.target.value)}
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

      {/* ================= POST-PURCHASE RAISE COMPLAINT MODAL ================= */}
      {selectedOrderForComplaint && (
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

            <form onSubmit={handleBuyerSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Issue Type (Required):
                </label>
                <select
                  value={modalComplaintCategory}
                  onChange={(e) => setModalComplaintCategory(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] text-[#1B4332] font-semibold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden cursor-pointer"
                >
                  <option value="Quality Dispute">{t('qualityDispute', language)} (Damaged, Moisture, Grade Mismatch)</option>
                  <option value="Quantity Shortage">{t('quantityShortage', language)} (Weight Missing at Weighbridge)</option>
                  <option value="Payment Issue">{t('paymentIssue', language)} (Escrow Hold / Billing Discrepancy)</option>
                  <option value="Delivery Delay">{t('deliveryDelay', language)} (Transit Vehicle Stoppage)</option>
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
                      onClick={() => setModalComplaintPriority(p)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        modalComplaintPriority === p
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
                  value={modalComplaintDescription}
                  onChange={(e) => setModalComplaintDescription(e.target.value)}
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
