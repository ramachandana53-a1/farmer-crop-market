import React, { useState, useMemo, useEffect } from 'react';
import { 
  Farmer, 
  Crop, 
  CropListing, 
  MarketZone, 
  UserProfile, 
  Order, 
  OrderStatus, 
  FarmerComplaint, 
  FarmerPortalTab,
  LanguageCode
} from '../types';
import { t, translateCrop, translateStatus, translateCategory, translateUnit } from '../utils/translations';
import { calculateMLPrediction } from '../utils/mlPredictor';
import { 
  CROP_ICONS, 
  INDIAN_STATES_DATA, 
  getStateAgroRecommendation,
  INITIAL_COMPLAINTS
} from '../data/initialData';
import { AddCropModal } from './AddCropModal';
import { CropSelectionDrawer } from './CropSelectionDrawer';
import { getDistrictMarketProfile } from '../utils/districtAgroEngine';
import { 
  Sprout, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  CheckCircle,
  Sparkles,
  Tag,
  Scale,
  Package,
  ArrowRight,
  User,
  Check,
  Globe2,
  Trash2,
  AlertTriangle,
  LineChart,
  Truck,
  MessageSquare,
  Clock,
  CreditCard,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  Building2,
  RefreshCw,
  Phone,
  HelpCircle,
  Code2
} from 'lucide-react';

interface FarmerPortalProps {
  farmers: Farmer[];
  crops: Crop[];
  zones: MarketZone[];
  listings: CropListing[];
  onAddListing: (newListing: CropListing) => void;
  onDeleteListing?: (listingId: string) => void;
  onAddCrop?: (newCrop: Crop) => void;
  viewMode?: 'create' | 'inventory' | 'both';
  onNavigateToEstimator?: () => void;
  userProfile?: UserProfile;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onViewReceipt?: (orderId: string) => void;
  complaints?: FarmerComplaint[];
  onAddComplaint?: (newComplaint: FarmerComplaint) => void;
  onRespondComplaint?: (complaintId: string, response: string) => void;
  onResolveComplaint?: (complaintId: string, note?: string) => void;
  initialTab?: FarmerPortalTab;
  language?: LanguageCode;
}

// Flipkart-style 4-stage tracking workflow
const TRACKER_STAGES: Array<{
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}> = [
  { key: 'PLACED', label: 'Order Placed', sublabel: 'Mandi harvest lot reserved by buyer', icon: Clock },
  { key: 'PAID', label: 'Payment Verified', sublabel: 'Escrow secured via UPI / e-NAM APMC', icon: CreditCard },
  { key: 'PACKED', label: 'Dispatched via Dijkstra Route', sublabel: 'Weighbridge cleared & loaded on carrier truck', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', sublabel: 'Arrived and settled at destination hub', icon: CheckCircle2 },
];

export const FarmerPortal: React.FC<FarmerPortalProps> = ({
  farmers,
  crops,
  zones,
  listings,
  onAddListing,
  onDeleteListing,
  onAddCrop,
  userProfile,
  orders = [],
  onUpdateOrderStatus,
  onViewReceipt,
  complaints: initialComplaintsProp,
  onAddComplaint,
  onRespondComplaint,
  onResolveComplaint,
  initialTab = 'add_listing',
  language = 'en',
}) => {
  // 4 Focused Sections State
  const [activeTab, setActiveTab] = useState<FarmerPortalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Pan-India State & District Cascading Selection
  const [selectedState, setSelectedState] = useState<string>(
    userProfile?.state || 'Punjab'
  );
  const [farmerDistrictId, setFarmerDistrictId] = useState<string>(
    userProfile?.districtId || 'PB_LUDHIANA'
  );
  const [farmerName, setFarmerName] = useState<string>(
    userProfile?.name || 'Sardar Harpreet Singh'
  );

  // Selected crop for listing
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.cropId || 'C_WHEAT');
  
  // Dual-unit Quantity handling: kgs vs Quintals (1 Quintal = 100 kg)
  const [quantityUnit, setQuantityUnit] = useState<'kg' | 'quintal'>('quintal');
  const [rawQuantity, setRawQuantity] = useState<number>(120); // in current unit

  // Pricing Units & Modes
  const [priceUnit, setPriceUnit] = useState<'kg' | 'quintal'>('quintal');
  const [pricingMode, setPricingMode] = useState<'accept_market' | 'custom_price'>('accept_market');
  const [rawCustomPrice, setRawCustomPrice] = useState<number>(2450); // in current price unit

  // Silent Background ML Regression Engine Parameters
  // (Automated defaults derived from crop agronomic targets & district profile)
  const [isCalculatingML, setIsCalculatingML] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [isCropDrawerOpen, setIsCropDrawerOpen] = useState<boolean>(false);

  // Academic Debug Mode Toggle (to inspect OLS math and Dijkstra invariants without cluttering main UI)
  const [academicMode, setAcademicMode] = useState<boolean>(false);

  // Support & Complaints State
  const [localComplaints, setLocalComplaints] = useState<FarmerComplaint[]>(
    initialComplaintsProp && initialComplaintsProp.length > 0 ? initialComplaintsProp : INITIAL_COMPLAINTS
  );

  useEffect(() => {
    if (initialComplaintsProp) {
      setLocalComplaints(initialComplaintsProp);
    }
  }, [initialComplaintsProp]);

  const [complaintFilter, setComplaintFilter] = useState<'ALL' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'>('ALL');
  const [isNewComplaintModalOpen, setIsNewComplaintModalOpen] = useState<boolean>(false);
  const [complaintCategory, setComplaintCategory] = useState<FarmerComplaint['category']>('PAYMENT_DISPUTE');
  const [complaintSubject, setComplaintSubject] = useState<string>('');
  const [complaintDesc, setComplaintDesc] = useState<string>('');
  const [complaintPriority, setComplaintPriority] = useState<FarmerComplaint['priority']>('MEDIUM');
  const [complaintOrderId, setComplaintOrderId] = useState<string>('');
  const [respondingComplaintId, setRespondingComplaintId] = useState<string | null>(null);
  const [responseInputText, setResponseInputText] = useState<string>('');

  // Orders Tab Filter & Selected Order for detail view
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Most Demanded Tab District Filter
  const [demandScope, setDemandScope] = useState<'district' | 'state'>('district');

  // Sync with userProfile if available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setFarmerName(userProfile.name);
      if (userProfile.state && INDIAN_STATES_DATA[userProfile.state]) {
        setSelectedState(userProfile.state);
      }
      if (userProfile.districtId) {
        setFarmerDistrictId(userProfile.districtId);
      }
    }
  }, [userProfile]);

  // List of all Indian states from state registry
  const stateList = useMemo(() => {
    return Object.keys(INDIAN_STATES_DATA).sort();
  }, []);

  // Available districts for the currently selected state
  const availableDistrictsForState = useMemo(() => {
    const stateMeta = INDIAN_STATES_DATA[selectedState];
    const registeredDistricts = stateMeta?.districts || [];
    
    const matchingZones = zones.filter(
      (z) => z.state && z.state.toLowerCase() === selectedState.toLowerCase()
    );

    const districtOptions: Array<{ id: string; name: string }> = [];

    matchingZones.forEach((z) => {
      districtOptions.push({ id: z.zoneId, name: `${z.districtRegion} (APMC Terminal Hub)` });
    });

    registeredDistricts.forEach((dist) => {
      const generatedId = `${selectedState.substring(0, 2).toUpperCase()}_${dist.toUpperCase().replace(/\s+/g, '_')}`;
      if (!districtOptions.some((d) => d.name.toLowerCase().includes(dist.toLowerCase()))) {
        districtOptions.push({ id: generatedId, name: `${dist} APMC District` });
      }
    });

    return districtOptions.length > 0 ? districtOptions : [
      { id: 'DIST_DEFAULT', name: `${selectedState} Central APMC Mandi` }
    ];
  }, [selectedState, zones]);

  // Update district when state changes if current district doesn't belong
  useEffect(() => {
    if (availableDistrictsForState.length > 0) {
      const exists = availableDistrictsForState.some((d) => d.id === farmerDistrictId);
      if (!exists) {
        setFarmerDistrictId(availableDistrictsForState[0].id);
      }
    }
  }, [availableDistrictsForState, farmerDistrictId]);

  // Active crop object
  const activeCrop = useMemo(() => {
    return crops.find((c) => c.cropId === selectedCropId) || crops[0];
  }, [crops, selectedCropId]);

  // Active zone object
  const activeZone = useMemo(() => {
    return (
      zones.find((z) => z.zoneId === farmerDistrictId) || {
        zoneId: farmerDistrictId,
        zoneName: `${selectedState} Agro Hub`,
        districtRegion: availableDistrictsForState.find((d) => d.id === farmerDistrictId)?.name.replace(' (APMC Terminal Hub)', '') || selectedState,
        state: selectedState,
        soilType: 'Alluvial/Loamy Soil',
        annualRainfallMm: 750,
        transitCostPerQuintal: 8,
        latitude: 20.0,
        longitude: 78.0,
        hubCapacityQuintals: 250000,
        x: 100,
        y: 100
      }
    );
  }, [zones, farmerDistrictId, selectedState, availableDistrictsForState]);

  // District-level Agro-Market Intelligence Profile
  const districtProfile = useMemo(() => {
    return getDistrictMarketProfile(farmerDistrictId, selectedState);
  }, [farmerDistrictId, selectedState]);

  // Derived standardized units
  const quantityInQuintals = useMemo(() => {
    return quantityUnit === 'quintal' ? rawQuantity : Math.round((rawQuantity / 100) * 100) / 100;
  }, [rawQuantity, quantityUnit]);

  const quantityInKgs = useMemo(() => {
    return quantityUnit === 'kg' ? rawQuantity : Math.round(rawQuantity * 100);
  }, [rawQuantity, quantityUnit]);

  // SILENT BACKGROUND ML REGRESSION ENGINE
  // Uses automated agronomic defaults from active crop & district weather data
  const bgRainfallMm = activeCrop?.optimalRainfallMm || 650;
  const bgSoilQuality = activeCrop?.optimalSoilScore || 85;
  const bgSoilPh = 7.1;
  const bgMandiDemand = districtProfile?.demandIndex || 1.08;

  const mlEstimate = useMemo(() => {
    return calculateMLPrediction(
      bgRainfallMm,
      bgSoilQuality,
      activeCrop.basePricePerQuintal,
      5, // standard 5 ha reference
      activeCrop.optimalRainfallMm,
      bgSoilPh,
      bgMandiDemand
    );
  }, [bgRainfallMm, bgSoilQuality, activeCrop, bgSoilPh, bgMandiDemand]);

  const mlPredictedPerQuintal = mlEstimate.predictedPricePerQuintal;
  const mlPredictedPerKg = Math.round((mlPredictedPerQuintal / 100) * 100) / 100;

  // Sync initial custom price with ML rate when crop changes
  useEffect(() => {
    if (pricingMode === 'accept_market') {
      if (priceUnit === 'kg') {
        setRawCustomPrice(mlPredictedPerKg);
      } else {
        setRawCustomPrice(mlPredictedPerQuintal);
      }
    } else {
      if (priceUnit === 'kg') {
        setRawCustomPrice(Math.round((activeCrop.basePricePerQuintal / 100) * 100) / 100);
      } else {
        setRawCustomPrice(activeCrop.basePricePerQuintal);
      }
    }
  }, [activeCrop, priceUnit, pricingMode, mlPredictedPerKg, mlPredictedPerQuintal]);

  // Standardized custom farmer price in both units
  const customFarmerPricePerQuintal = useMemo(() => {
    return priceUnit === 'quintal' ? rawCustomPrice : Math.round(rawCustomPrice * 100);
  }, [rawCustomPrice, priceUnit]);

  const customFarmerPricePerKg = useMemo(() => {
    return priceUnit === 'kg' ? rawCustomPrice : Math.round((rawCustomPrice / 100) * 100) / 100;
  }, [rawCustomPrice, priceUnit]);

  // Effective asking prices based on chosen pricing mode
  const askingPricePerQuintal = useMemo(() => {
    return pricingMode === 'accept_market' ? mlPredictedPerQuintal : customFarmerPricePerQuintal;
  }, [pricingMode, mlPredictedPerQuintal, customFarmerPricePerQuintal]);

  const askingPricePerKg = useMemo(() => {
    return pricingMode === 'accept_market' ? mlPredictedPerKg : customFarmerPricePerKg;
  }, [pricingMode, mlPredictedPerKg, customFarmerPricePerKg]);

  // Extra demand variance vs ML Mandi Price
  const extraDemandAmountPerQuintal = useMemo(() => {
    return askingPricePerQuintal - mlPredictedPerQuintal;
  }, [askingPricePerQuintal, mlPredictedPerQuintal]);

  const extraDemandAmountPerKg = useMemo(() => {
    return Math.round((askingPricePerKg - mlPredictedPerKg) * 100) / 100;
  }, [askingPricePerKg, mlPredictedPerKg]);

  const totalLotProduceValueINR = useMemo(() => {
    return Math.round(quantityInQuintals * askingPricePerQuintal);
  }, [quantityInQuintals, askingPricePerQuintal]);

  // Farmer's active inventory (Strict Multi-Account Isolation)
  const farmerListings = useMemo(() => {
    return listings.filter((l) => {
      if (userProfile?.id && l.farmerId === userProfile.id) return true;
      if (l.farmerName && l.farmerName.toLowerCase() === farmerName.toLowerCase()) return true;
      return false;
    });
  }, [listings, userProfile, farmerName]);

  // Orders for this farmer account only (Strict Multi-Account Isolation)
  const farmerOrders = useMemo(() => {
    return orders.filter((o) => {
      if (userProfile?.id && o.farmerId === userProfile.id) return true;
      if (o.farmerName && o.farmerName.toLowerCase() === farmerName.toLowerCase()) return true;
      return false;
    });
  }, [orders, userProfile, farmerName]);

  const displayOrders = farmerOrders;

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'ALL') return displayOrders;
    if (orderFilter === 'PENDING') return displayOrders.filter((o) => o.status === 'PLACED' || o.status === 'PAID');
    if (orderFilter === 'IN_TRANSIT') return displayOrders.filter((o) => o.status === 'PACKED' || o.status === 'IN_TRANSIT');
    if (orderFilter === 'DELIVERED') return displayOrders.filter((o) => o.status === 'DELIVERED');
    return displayOrders;
  }, [displayOrders, orderFilter]);

  // Order stage index helper
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

  // Farmer Quick Action to Advance Order Status
  const handleAdvanceOrderStatus = (order: Order) => {
    if (!onUpdateOrderStatus) return;
    const curIdx = getStageIndex(order.status);
    if (curIdx < TRACKER_STAGES.length - 1) {
      const nextStage = TRACKER_STAGES[curIdx + 1].key;
      onUpdateOrderStatus(order.orderId, nextStage);
      setPublishSuccess(`Order #${order.orderId} status advanced to "${TRACKER_STAGES[curIdx + 1].label}". Dijkstra route and notifications synchronized.`);
      setTimeout(() => setPublishSuccess(null), 5000);
    }
  };

  // Interactive Crop Selection Handler
  const handleSelectCrop = (crop: Crop) => {
    setSelectedCropId(crop.cropId);
    if (priceUnit === 'kg') {
      setRawCustomPrice(Math.round((crop.basePricePerQuintal / 100) * 100) / 100);
    } else {
      setRawCustomPrice(crop.basePricePerQuintal);
    }

    setIsCalculatingML(true);
    setTimeout(() => {
      setIsCalculatingML(false);
    }, 250);

    setPublishSuccess(`Selected "${crop.cropName}". Live ML pricing & benchmark data loaded.`);
    setTimeout(() => setPublishSuccess(null), 4000);
  };

  // Handle Quick List from Tab 2 (Most Demanded)
  const handleQuickListFromDemand = (crop: Crop) => {
    handleSelectCrop(crop);
    setPricingMode('accept_market');
    setActiveTab('add_listing');
  };

  // Create Listing Handler
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantityInQuintals <= 0) {
      alert('Please enter a valid harvest quantity greater than 0.');
      return;
    }

    if (askingPricePerQuintal <= 0) {
      alert('Please enter a valid asking price.');
      return;
    }

    const newId = `LST_${Date.now().toString().slice(-4)}`;

    const newListing: CropListing = {
      listingId: newId,
      farmerId: userProfile?.id || `FARM_${Math.floor(100 + Math.random() * 900)}`,
      farmerName,
      cropId: activeCrop.cropId,
      zoneId: farmerDistrictId,
      quantityQuintals: quantityInQuintals,
      quantityAvailableKg: quantityInKgs,
      askingPricePerQuintal,
      askingPricePerKg,
      mlPredictedPricePerQuintal: mlPredictedPerQuintal,
      mlPredictedPricePerKg: mlPredictedPerKg,
      customFarmerPricePerQuintal,
      customFarmerPricePerKg,
      extraDemandAmountPerQuintal,
      extraDemandAmountPerKg,
      isCustomPrice: pricingMode === 'custom_price',
      expectedYieldQuintals: mlEstimate.totalHarvestQuintals,
      rainfallInputMm: bgRainfallMm,
      soilQualityIndex: bgSoilQuality,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      quantityTons: Math.round((quantityInQuintals / 10) * 10) / 10,
      askingPricePerTon: askingPricePerQuintal * 10,
      mlPredictedPricePerTon: mlPredictedPerQuintal * 10,
      expectedYieldTons: Math.round((mlEstimate.totalHarvestQuintals / 10) * 10) / 10,
    };

    onAddListing(newListing);

    setPublishSuccess(`Harvest listing published successfully! ${activeCrop.cropName} (${quantityInKgs.toLocaleString('en-IN')} kg) is now active in ${selectedState} Mandi network.`);
    setTimeout(() => setPublishSuccess(null), 6000);
  };

  // Submit Complaint Handler
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      alert('Please provide a subject and detailed description of the issue.');
      return;
    }

    const newComplaint: FarmerComplaint = {
      complaintId: `CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      farmerId: userProfile?.id || 'FARM_001',
      farmerName,
      category: complaintCategory,
      orderId: complaintOrderId || undefined,
      subject: complaintSubject,
      description: complaintDesc,
      priority: complaintPriority,
      status: 'OPEN',
      createdAt: 'Just now',
      assignedOfficer: `${activeZone.districtRegion} Mandi Arbitration Officer`
    };

    if (onAddComplaint) {
      onAddComplaint(newComplaint);
    }
    setLocalComplaints((prev) => [newComplaint, ...prev]);

    setComplaintSubject('');
    setComplaintDesc('');
    setComplaintOrderId('');
    setIsNewComplaintModalOpen(false);

    setPublishSuccess(`Complaint #${newComplaint.complaintId} lodged successfully! Assigned to APMC officer for review.`);
    setTimeout(() => setPublishSuccess(null), 6000);
  };

  // Respond to Buyer Handler
  const handleRespondToBuyer = (complaintId: string, responseText: string) => {
    if (!responseText.trim()) return;
    if (onRespondComplaint) {
      onRespondComplaint(complaintId, responseText);
    }
    const formattedTime = 'Just now';
    setLocalComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? {
              ...c,
              status: 'UNDER_REVIEW',
              farmerResponse: responseText,
              farmerRespondedAt: formattedTime
            }
          : c
      )
    );
    setRespondingComplaintId(null);
    setResponseInputText('');
    setPublishSuccess(`Response sent to buyer for Ticket #${complaintId}. Status updated to "Under Investigation".`);
    setTimeout(() => setPublishSuccess(null), 5000);
  };

  // Resolve Complaint Handler
  const handleMarkResolved = (complaintId: string) => {
    const note = 'Resolved after APMC Mandi verification and mutual farmer-buyer settlement.';
    if (onResolveComplaint) {
      onResolveComplaint(complaintId, note);
    }
    setLocalComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? { ...c, status: 'RESOLVED', resolvedAt: 'Just now', resolutionNote: note }
          : c
      )
    );
    setPublishSuccess(`Ticket #${complaintId} marked as RESOLVED.`);
    setTimeout(() => setPublishSuccess(null), 4000);
  };

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    if (complaintFilter === 'ALL') return localComplaints;
    return localComplaints.filter((c) => c.status === complaintFilter);
  }, [localComplaints, complaintFilter]);

  // Most Demanded Crops Calculation (Derived from district and state metrics)
  const mostDemandedCropsList = useMemo(() => {
    return crops.slice(0, 8).map((crop, idx) => {
      const isTopDistrict = districtProfile.topSellingCropIds.includes(crop.cropId);
      const demandMultiplier = isTopDistrict ? 1.25 : 1.05 + (idx % 3) * 0.05;
      const baseQPrice = crop.basePricePerQuintal;
      const avgSellingPriceQ = Math.round(baseQPrice * demandMultiplier);
      const avgSellingPriceKg = Math.round((avgSellingPriceQ / 100) * 100) / 100;
      const purchasedKg = 1200 + idx * 750 + (isTopDistrict ? 2400 : 0);
      const trendPct = +(3.5 + (idx * 1.2)).toFixed(1);
      const isRising = idx % 4 !== 3;

      return {
        crop,
        isTopDistrict,
        demandScore: isTopDistrict ? 98 : Math.max(78, 95 - idx * 3),
        statusBadge: isTopDistrict ? '🔥 High Demand / Sellable Now' : '⚡ Active Market Interest',
        purchasedKg,
        purchasedQuintals: Math.round(purchasedKg / 100),
        avgSellingPriceQ,
        avgSellingPriceKg,
        trendPct,
        isRising,
        deficitAlert: isTopDistrict 
          ? 'Buyer demand exceeds current district APMC arrivals by 32% (High Liquidity)' 
          : 'Regular APMC terminal trade with steady daily procurement',
        topBuyers: ['ITC Choupal', 'Tata Consumer Agri', 'South India Flour Mills', 'Local Mandi Millers'][idx % 4]
      };
    });
  }, [crops, districtProfile]);

  return (
    <div className="space-y-6">
      {/* 1. TOP FARMER HEADER & IDENTITY BAR */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-[#FAF7EE] flex items-center justify-center text-2xl font-bold shadow-xs shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#1B4332]">
                {farmerName} &bull; Farmer Portal
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#1B4332]">
                APMC Registered Farmer
              </span>
            </div>
            <p className="text-xs text-[#52796F] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <strong>{activeZone.districtRegion}</strong>, {selectedState}
              </span>
              <span>&bull;</span>
              <span>APMC Terminal Hub: <strong>{activeZone.zoneName}</strong></span>
              <span>&bull;</span>
              <span className="font-mono text-[#2D6A4F] font-bold">Currency: ₹ INR</span>
            </p>
          </div>
        </div>

        {/* District Switcher & Academic Mode Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick District Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D8CDB2] rounded-xl px-3 py-1.5 shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <select
              value={farmerDistrictId}
              onChange={(e) => setFarmerDistrictId(e.target.value)}
              className="text-xs font-semibold text-[#1B4332] bg-transparent focus:outline-none cursor-pointer"
            >
              {availableDistrictsForState.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. FOUR FOCUSED SECTION TABS (Clean distraction-free 4-tab navigation) */}
      <div className="border border-[#E2DAC5] bg-white rounded-2xl p-1.5 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('add_listing')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'add_listing'
                ? 'bg-[#2D6A4F] text-white shadow-xs ring-1 ring-[#1B4332]'
                : 'text-[#52796F] hover:bg-[#FAF7EE] hover:text-[#1B4332]'
            }`}
            title={t('tooltipFarmerAdd', language)}
          >
            <Sprout className="w-4 h-4 text-[#E9C46A]" />
            <span>[🌾 {t('addProduce', language)}]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('most_demanded')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'most_demanded'
                ? 'bg-[#2D6A4F] text-white shadow-xs ring-1 ring-[#1B4332]'
                : 'text-[#52796F] hover:bg-[#FAF7EE] hover:text-[#1B4332]'
            }`}
            title="Local market demand trends & high liquidity crops"
          >
            <TrendingUp className="w-4 h-4 text-[#E9C46A]" />
            <span>[🔥 {t('mostDemandedCrops', language)}]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders_tracker')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 relative ${
              activeTab === 'orders_tracker'
                ? 'bg-[#2D6A4F] text-white shadow-xs ring-1 ring-[#1B4332]'
                : 'text-[#52796F] hover:bg-[#FAF7EE] hover:text-[#1B4332]'
            }`}
            title={t('tooltipTrackOrder', language)}
          >
            <Truck className="w-4 h-4 text-[#E9C46A]" />
            <span>[🚚 {t('myOrdersTracker', language)}]</span>
            {displayOrders.filter((o) => o.status === 'PLACED').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complaints_support')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'complaints_support'
                ? 'bg-[#2D6A4F] text-white shadow-xs ring-1 ring-[#1B4332]'
                : 'text-[#52796F] hover:bg-[#FAF7EE] hover:text-[#1B4332]'
            }`}
            title="APMC Mandi Grievance Redressal & Support"
          >
            <MessageSquare className="w-4 h-4 text-[#E9C46A]" />
            <span>[💬 Complaints & Support]</span>
          </button>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 bg-[#2D6A4F]/10 border-2 border-[#2D6A4F] rounded-2xl text-xs text-[#1B4332] font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-[#2D6A4F] shrink-0" />
          <div className="flex-1">{publishSuccess}</div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION TAB 1: 🌾 ADD CROP LISTING                                        */}
      {/* ========================================================================= */}
      {activeTab === 'add_listing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Streamlined Clean Farmer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DAC5]">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#2D6A4F]" />
                  <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                    {t('addNewCropListing', language)}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#52796F]">
                  Mandi Hub: <strong className="text-[#1B4332]">{activeZone.districtRegion}</strong>
                </span>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4">
                {/* 1. Select Crop */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                      <span>{t('selectCrop', language)}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCropDrawerOpen(true)}
                      className="text-[11px] font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                    >
                      {t('browseAllCrops', language)} ({crops.length}) &rarr;
                    </button>
                  </div>

                  {/* Horizontal Quick-Select Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {crops.slice(0, 4).map((c) => {
                      const isSel = c.cropId === selectedCropId;
                      return (
                        <button
                          key={c.cropId}
                          type="button"
                          onClick={() => handleSelectCrop(c)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                            isSel
                              ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                              : 'bg-[#FAF7EE] hover:bg-stone-50 text-[#1B4332] border-[#D8CDB2]'
                          }`}
                        >
                          <span className="text-xl shrink-0">{CROP_ICONS[c.cropId] || '🌱'}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">{translateCrop(c.cropId, language)}</span>
                            <span className={`text-[10px] font-mono ${isSel ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                              ₹{c.basePricePerQuintal.toLocaleString('en-IN')}/q
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown for All Crops */}
                  <select
                    value={selectedCropId}
                    onChange={(e) => {
                      const c = crops.find((cr) => cr.cropId === e.target.value);
                      if (c) handleSelectCrop(c);
                    }}
                    className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 text-xs font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none cursor-pointer"
                  >
                    {crops.map((c) => (
                      <option key={c.cropId} value={c.cropId}>
                        {CROP_ICONS[c.cropId] || '🌱'} {translateCrop(c.cropId, language)} ({translateCategory(c.category, language)}) &bull; Base ₹{c.basePricePerQuintal.toLocaleString('en-IN')}/q
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Enter Quantity in kg or Quintals */}
                <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t('enterQuantity', language)}</span>
                    </label>

                    {/* Unit Toggle */}
                    <div className="inline-flex bg-[#EAE6D6] p-0.5 rounded-lg border border-[#D8CDB2] text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantityUnit !== 'quintal') {
                            setQuantityUnit('quintal');
                            setRawQuantity(quantityInQuintals);
                          }
                        }}
                        className={`px-3 py-0.5 rounded font-bold cursor-pointer transition ${
                          quantityUnit === 'quintal'
                            ? 'bg-[#2D6A4F] text-white shadow-2xs'
                            : 'text-[#40534C] hover:text-[#1B4332]'
                        }`}
                      >
                        {t('quintalsUnit', language)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (quantityUnit !== 'kg') {
                            setQuantityUnit('kg');
                            setRawQuantity(quantityInKgs);
                          }
                        }}
                        className={`px-3 py-0.5 rounded font-bold cursor-pointer transition ${
                          quantityUnit === 'kg'
                            ? 'bg-[#2D6A4F] text-white shadow-2xs'
                            : 'text-[#40534C] hover:text-[#1B4332]'
                        }`}
                      >
                        {t('kgsUnit', language)}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      required
                      min="1"
                      step={quantityUnit === 'kg' ? '1' : '0.1'}
                      value={rawQuantity}
                      onChange={(e) => setRawQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#D8CDB2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    />
                    <span className="font-bold text-xs text-[#2D6A4F] shrink-0 font-mono">
                      {quantityUnit === 'kg' ? 'KG' : 'QUINTALS'}
                    </span>
                  </div>

                  {/* Quick Increment Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-[#52796F] font-bold">Quick set:</span>
                    {[
                      { label: '60 kg (Buyer Standard)', q: quantityUnit === 'kg' ? 60 : 0.6 },
                      { label: '100 kg (1 q)', q: quantityUnit === 'kg' ? 100 : 1 },
                      { label: '500 kg (5 q)', q: quantityUnit === 'kg' ? 500 : 5 },
                      { label: '1,200 kg (12 q)', q: quantityUnit === 'kg' ? 1200 : 12 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setRawQuantity(chip.q)}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#D8CDB2] text-[10px] font-semibold text-[#1B4332] hover:bg-stone-50 cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Dual Unit Equivalence */}
                  <div className="flex items-center justify-between text-[11px] text-[#52796F] px-1 font-mono pt-1">
                    <span>Equivalence: <strong>{quantityInKgs.toLocaleString('en-IN')} kg</strong></span>
                    <span>= <strong>{quantityInQuintals.toLocaleString('en-IN')} Quintals</strong></span>
                  </div>
                </div>

                {/* 3. CLEAN SYSTEM RECOMMENDED PRICE BADGE (PREDICTED BY ML ENGINE) */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-[#FAF7EE] to-emerald-50 rounded-xl border-2 border-emerald-400 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                        {t('estimatedMandiRate', language)}:
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                      Auto Mandi Rate
                    </span>
                  </div>

                  {/* Clean Prominent Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-emerald-200">
                    <div>
                      <div className="text-base font-bold font-mono text-emerald-900 flex items-center gap-2">
                        <span>₹{mlPredictedPerQuintal.toLocaleString('en-IN')} / Quintal</span>
                        <span className="text-xs font-normal text-emerald-700 font-mono">
                          (₹{mlPredictedPerKg.toFixed(2)}/kg)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Calibrated from historical Mandi arrivals & local agro-climatic trends.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMode('accept_market');
                          if (priceUnit === 'kg') {
                            setRawCustomPrice(mlPredictedPerKg);
                          } else {
                            setRawCustomPrice(mlPredictedPerQuintal);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          pricingMode === 'accept_market'
                            ? 'bg-[#2D6A4F] text-white shadow-xs'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {pricingMode === 'accept_market' ? '✓ Accepted' : 'Accept ML Price'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Enter Asking Price */}
                <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t('askingPrice', language)}:</span>
                    </label>

                    {/* Unit Selector */}
                    <div className="inline-flex bg-[#EAE6D6] p-0.5 rounded-lg border border-[#D8CDB2] text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (priceUnit !== 'quintal') {
                            setPriceUnit('quintal');
                            setRawCustomPrice(customFarmerPricePerQuintal);
                          }
                        }}
                        className={`px-3 py-0.5 rounded font-bold cursor-pointer transition ${
                          priceUnit === 'quintal'
                            ? 'bg-[#2D6A4F] text-white shadow-2xs'
                            : 'text-[#40534C] hover:text-[#1B4332]'
                        }`}
                      >
                        ₹ / Quintal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (priceUnit !== 'kg') {
                            setPriceUnit('kg');
                            setRawCustomPrice(customFarmerPricePerKg);
                          }
                        }}
                        className={`px-3 py-0.5 rounded font-bold cursor-pointer transition ${
                          priceUnit === 'kg'
                            ? 'bg-[#2D6A4F] text-white shadow-2xs'
                            : 'text-[#40534C] hover:text-[#1B4332]'
                        }`}
                      >
                        ₹ / kg
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-2 text-sm font-bold text-[#52796F]">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step={priceUnit === 'kg' ? '0.01' : '1'}
                        value={rawCustomPrice}
                        onChange={(e) => {
                          setPricingMode('custom_price');
                          setRawCustomPrice(parseFloat(e.target.value) || 0);
                        }}
                        className="w-full bg-white border border-[#D8CDB2] rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      />
                    </div>
                    <span className="font-bold text-xs text-[#2D6A4F] shrink-0 font-mono">
                      {priceUnit === 'kg' ? '₹ / kg' : '₹ / quintal'}
                    </span>
                  </div>

                  {/* Asking vs ML Comparison Status Tag */}
                  <div className="flex items-center justify-between text-xs px-1 pt-1">
                    <span className="text-[#52796F]">
                      Est. Total Produce Value: <strong className="text-[#1B4332] font-mono">₹{totalLotProduceValueINR.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      extraDemandAmountPerKg > 0 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : extraDemandAmountPerKg < 0 
                        ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {extraDemandAmountPerKg > 0 
                        ? `+₹${extraDemandAmountPerKg.toFixed(2)}/kg premium` 
                        : extraDemandAmountPerKg < 0 
                        ? `-₹${Math.abs(extraDemandAmountPerKg).toFixed(2)}/kg discount` 
                        : '✓ Matches ML Mandi Estimate'}
                    </span>
                  </div>
                </div>

                {/* 5. Post Listing Action Button */}
                <button
                  type="submit"
                  disabled={isCalculatingML}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#143326] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Package className="w-4 h-4 text-[#E9C46A]" />
                  <span>{isCalculatingML ? t('calculatingML', language) : t('publishCrop', language)}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Farmer's Active Listings (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#2D6A4F]" />
                  <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                    {t('activeProduceListings', language)}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#2D6A4F] border border-[#E2DAC5]">
                  {farmerListings.length} Active Lots
                </span>
              </div>

              {farmerListings.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#52796F] space-y-2">
                  <Sprout className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="font-semibold text-[#1B4332]">No active crop listings yet.</p>
                  <p className="text-[11px]">Fill the form on the left to publish your harvest to the mandi network.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {farmerListings.map((lot) => {
                    const cropInfo = crops.find((c) => c.cropId === lot.cropId);
                    const qtyKgs = lot.quantityAvailableKg || (lot.quantityQuintals * 100);
                    const askingPerKg = lot.askingPricePerKg || (lot.askingPricePerQuintal / 100);

                    return (
                      <div
                        key={lot.listingId}
                        className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] hover:border-[#2D6A4F] transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{CROP_ICONS[lot.cropId] || '🌱'}</span>
                            <div>
                              <h4 className="text-xs font-bold text-[#1B4332]">
                                {translateCrop(lot.cropId, language)}
                              </h4>
                              <span className="text-[10px] font-mono text-[#52796F]">
                                Lot #{lot.listingId} &bull; {lot.zoneId}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {translateStatus(lot.status, language)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E2DAC5]/70">
                          <div>
                            <span className="text-[10px] text-[#52796F] block">Quantity:</span>
                            <span className="font-bold font-mono text-[#1B4332]">
                              {qtyKgs.toLocaleString('en-IN')} kg
                            </span>
                            <span className="text-[10px] text-[#52796F] block">
                              ({lot.quantityQuintals} Quintals)
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#52796F] block">Asking Rate:</span>
                            <span className="font-bold font-mono text-[#2D6A4F]">
                              ₹{askingPerKg.toFixed(2)}/kg
                            </span>
                            <span className="text-[10px] text-[#52796F] block">
                              (₹{lot.askingPricePerQuintal.toLocaleString('en-IN')}/q)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#E2DAC5]/70 text-[11px]">
                          <span className="text-[#52796F] font-mono">
                            Total: <strong>₹{Math.round(lot.quantityQuintals * lot.askingPricePerQuintal).toLocaleString('en-IN')}</strong>
                          </span>
                          {onDeleteListing && (
                            <button
                              type="button"
                              onClick={() => onDeleteListing(lot.listingId)}
                              className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION TAB 2: 🔥 MOST DEMANDED CROPS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'most_demanded' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-[#FAF7EE] to-emerald-500/10 border-2 border-amber-400/50 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="text-sm font-bold text-[#1B4332]">
                  Real-Time Crop Demand Metrics & Buyer Procurement Trends
                </h3>
              </div>
              <p className="text-xs text-[#52796F] mt-1 max-w-2xl">
                Track commodities in highest demand by buyers across {selectedState} and your local APMC district. 
                Derived from buyer transaction orders, mandi arrivals, and interstate wholesale inquiries.
              </p>
            </div>

            {/* Scope Filter */}
            <div className="inline-flex bg-white p-1 rounded-xl border border-[#D8CDB2] shadow-2xs text-xs font-bold">
              <button
                type="button"
                onClick={() => setDemandScope('district')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  demandScope === 'district'
                    ? 'bg-[#2D6A4F] text-white shadow-2xs'
                    : 'text-[#52796F] hover:text-[#1B4332]'
                }`}
              >
                📍 {activeZone.districtRegion}
              </button>
              <button
                type="button"
                onClick={() => setDemandScope('state')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  demandScope === 'state'
                    ? 'bg-[#2D6A4F] text-white shadow-2xs'
                    : 'text-[#52796F] hover:text-[#1B4332]'
                }`}
              >
                🇮🇳 {selectedState} State
              </button>
            </div>
          </div>

          {/* Demanded Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostDemandedCropsList.map((item) => (
              <div
                key={item.crop.cropId}
                className="bg-white border-2 border-[#E2DAC5] hover:border-[#2D6A4F] rounded-2xl p-4.5 shadow-xs transition space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5]">
                        {CROP_ICONS[item.crop.cropId] || '🌱'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#1B4332] leading-tight">
                          {item.crop.cropName}
                        </h4>
                        <span className="text-[10px] font-semibold text-[#52796F]">
                          {item.crop.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isTopDistrict
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {item.statusBadge}
                  </span>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E2DAC5] text-xs">
                    <div>
                      <span className="text-[10px] text-[#52796F] block">Avg Mandi Price:</span>
                      <span className="font-bold font-mono text-[#1B4332]">
                        ₹{item.avgSellingPriceKg.toFixed(2)}/kg
                      </span>
                      <span className="text-[10px] text-[#52796F] block">
                        (₹{item.avgSellingPriceQ.toLocaleString('en-IN')}/q)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#52796F] block">Season Procured:</span>
                      <span className="font-bold font-mono text-[#2D6A4F]">
                        {item.purchasedKg.toLocaleString('en-IN')} kg
                      </span>
                      <span className="text-[10px] text-[#52796F] block">
                        ({item.purchasedQuintals} Quintals)
                      </span>
                    </div>
                  </div>

                  {/* 7-Day Trend */}
                  <div className="flex items-center justify-between text-[11px] bg-[#FAF7EE] p-2 rounded-lg border border-[#E2DAC5]">
                    <span className="text-[#52796F] font-semibold flex items-center gap-1">
                      <LineChart className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      7-Day Trend:
                    </span>
                    <span className="font-bold font-mono text-emerald-700 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{item.trendPct}%
                    </span>
                  </div>

                  {/* Deficit / Liquidity Note */}
                  <p className="text-[10px] text-[#52796F] leading-tight">
                    {item.deficitAlert}
                  </p>
                </div>

                {/* Quick List Action */}
                <button
                  type="button"
                  onClick={() => handleQuickListFromDemand(item.crop)}
                  className="w-full py-2 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>Quick List This Crop</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION TAB 3: 🚚 MY ORDERS & DELIVERY TRACKER (FLIPKART STYLE)          */}
      {/* ========================================================================= */}
      {activeTab === 'orders_tracker' && (
        <div className="space-y-5">
          {/* Header & Filter Controls */}
          <div className="bg-white border border-[#E2DAC5] rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2D6A4F]" />
                <h3 className="text-sm font-bold text-[#1B4332]">
                  Flipkart-Style Mandi Order Progress & Dijkstra Logistics Tracker
                </h3>
              </div>
              <p className="text-xs text-[#52796F] mt-0.5">
                Track status across: <code>[Order Placed] &rarr; [Payment Verified] &rarr; [Dispatched] &rarr; [In Transit via Dijkstra Route] &rarr; [Delivered]</code>.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex bg-[#FAF7EE] p-1 rounded-xl border border-[#D8CDB2] text-xs font-bold gap-1">
              {[
                { id: 'ALL', label: `All (${displayOrders.length})` },
                { id: 'PENDING', label: 'Pending Dispatch' },
                { id: 'IN_TRANSIT', label: 'In Transit' },
                { id: 'DELIVERED', label: 'Delivered' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOrderFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    orderFilter === f.id
                      ? 'bg-[#2D6A4F] text-white shadow-2xs'
                      : 'text-[#52796F] hover:text-[#1B4332]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List with Flipkart-Style Steppers */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-[#E2DAC5] rounded-2xl p-12 text-center text-[#52796F] space-y-2">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="text-sm font-bold text-[#1B4332]">No Orders Found in this view</h4>
              <p className="text-xs text-[#52796F]">Orders placed by buyers will appear here in real time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const curIdx = getStageIndex(order.status);
                const isDelivered = order.status === 'DELIVERED';
                const isCancelled = order.status === 'CANCELLED';

                return (
                  <div
                    key={order.orderId}
                    className="bg-white border-2 border-[#E2DAC5] rounded-2xl p-5 shadow-xs space-y-4"
                  >
                    {/* Top Row: Order ID, Buyer, and Cost */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DAC5]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5]">
                          {order.cropIcon || '🌾'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#FAF7EE] text-[#1B4332] rounded border border-[#E2DAC5]">
                              {order.orderId}
                            </span>
                            <span className="text-xs font-bold text-[#1B4332]">
                              {order.cropName} &bull; {order.quantityKg} kg ({order.quantityQuintals} q)
                            </span>
                          </div>
                          <p className="text-[11px] text-[#52796F] mt-0.5">
                            Buyer: <strong>{order.buyerName}</strong> &bull; Destination: <strong>{order.destZoneId}</strong> &bull; Placed: {order.placedAt}
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-[#E2DAC5] sm:pl-4">
                        <span className="text-[10px] text-[#52796F] block uppercase font-bold">Total Invoiced</span>
                        <span className="text-base font-bold font-mono text-[#2D6A4F]">
                          ₹{order.totalAmountInr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#52796F] block font-mono">
                          (Produce ₹{order.produceCostInr.toLocaleString('en-IN')} + Transit ₹{order.transitFreightCostInr})
                        </span>
                      </div>
                    </div>

                    {/* Flipkart-Style Visual Stepper */}
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 relative">
                        {/* Connecting Progress Line */}
                        <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-stone-200 -z-0">
                          <div 
                            className="h-full bg-[#2D6A4F] transition-all duration-500"
                            style={{ width: `${(curIdx / (TRACKER_STAGES.length - 1)) * 100}%` }}
                          />
                        </div>

                        {TRACKER_STAGES.map((stage, sIdx) => {
                          const isDone = sIdx <= curIdx;
                          const isCurrent = sIdx === curIdx;
                          const IconComp = stage.icon;

                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                                  isDone
                                    ? 'bg-[#2D6A4F] text-white ring-4 ring-emerald-100 shadow-xs'
                                    : 'bg-stone-100 text-stone-400 border border-stone-300'
                                }`}
                              >
                                {isDone && !isCurrent ? (
                                  <Check className="w-4 h-4 text-[#E9C46A]" />
                                ) : (
                                  <IconComp className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`text-[11px] font-bold mt-2 ${
                                isCurrent ? 'text-[#1B4332]' : isDone ? 'text-emerald-800' : 'text-stone-400'
                              }`}>
                                {stage.label}
                              </span>
                              <span className="text-[9px] text-[#52796F] hidden sm:block max-w-[130px] leading-tight mt-0.5">
                                {stage.sublabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Row: Dijkstra Transit Waybill Details & Farmer Action */}
                    <div className="pt-3 border-t border-[#E2DAC5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#52796F] font-mono text-[11px] flex-wrap">
                        <span className="flex items-center gap-1 text-[#2D6A4F] font-bold">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dijkstra Shortest Corridor:</span>
                        </span>
                        <span>{order.highwayRef || 'Interstate Highway Corridor'}</span>
                        <span>&bull;</span>
                        <span>{order.transitDistanceKm} km</span>
                        <span>&bull;</span>
                        <span className="text-[#1B4332]">Carrier: {order.vehicleLorryNumber || 'APMC Approved Lorry'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(order.orderId)}
                            className="px-3 py-1.5 rounded-lg bg-[#FAF7EE] hover:bg-stone-100 text-[#1B4332] text-xs font-bold transition flex items-center gap-1.5 border border-[#D8CDB2] cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>View GST Receipt</span>
                          </button>
                        )}

                        {!isDelivered && !isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceOrderStatus(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-[#E9C46A]" />
                            <span>
                              {curIdx === 0 ? 'Confirm & Pack Lot' : curIdx === 1 ? 'Dispatch via Dijkstra Route' : 'Mark Delivered'}
                            </span>
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
      )}

      {/* ========================================================================= */}
      {/* SECTION TAB 4: 💬 COMPLAINTS & SUPPORT                                    */}
      {/* ========================================================================= */}
      {activeTab === 'complaints_support' && (
        <div className="space-y-5">
          {/* Header & Lodge Complaint Action */}
          <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                <h3 className="text-sm font-bold text-[#1B4332]">
                  Farmer Support Portal & APMC Dispute Resolution Desk
                </h3>
              </div>
              <p className="text-xs text-[#52796F] mt-0.5">
                Track buyer payment disputes, logistics delivery delays, weighbridge tare issues, or lodge platform complaints.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewComplaintModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#E9C46A]" />
              <span>Lodge New Complaint / Ticket</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#52796F]">Filter Status:</span>
            {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setComplaintFilter(status)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  complaintFilter === status
                    ? 'bg-[#2D6A4F] text-white shadow-2xs'
                    : 'bg-white hover:bg-stone-50 text-[#52796F] border border-[#D8CDB2]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Complaints Cards List */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white border border-[#E2DAC5] rounded-2xl p-12 text-center text-[#52796F] space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#1B4332]">No Complaints Found in this Category</h4>
              <p className="text-xs text-[#52796F]">All transactions and mandi logistics are running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((item) => (
                <div
                  key={item.complaintId}
                  className="bg-white border-2 border-[#E2DAC5] rounded-2xl p-5 shadow-xs space-y-3.5"
                >
                  {/* Top Status & Badge Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2DAC5]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#FAF7EE] text-[#1B4332] border border-[#E2DAC5]">
                        #{item.complaintId}
                      </span>
                      
                      {/* Status Badges: [🟡 Open] / [🔵 Under Investigation] / [🟢 Resolved] */}
                      {item.status === 'RESOLVED' ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                          <span>🟢</span>
                          <span>{t('statusResolved', language) || 'Resolved'}</span>
                        </span>
                      ) : item.status === 'UNDER_REVIEW' ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
                          <span>🔵</span>
                          <span>{t('statusUnderInvestigation', language) || 'Under Investigation'}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                          <span>🟡</span>
                          <span>{t('statusOpen', language) || 'Open'}</span>
                        </span>
                      )}

                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        item.category.includes('Quality') || item.category === 'CROP_QUALITY'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : item.category.includes('Shortage') || item.category === 'WEIGHING_MANDI_ISSUE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.category.includes('Payment') || item.category === 'PAYMENT_DISPUTE'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#52796F]">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono text-[11px]">{item.createdAt}</span>
                    </div>
                  </div>

                  {/* 4 Required Metadata Fields: Buyer Name, Crop Lot ID, Order ID, Issue Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF7EE] p-3 rounded-xl border border-[#E2DAC5] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                        {t('buyerName', language) || 'Buyer Name'}
                      </span>
                      <strong className="text-[#1B4332] text-xs block truncate mt-0.5">
                        {item.buyerName || 'ITC Agri-Business Division'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                        {t('cropLotId', language) || 'Crop Lot ID'}
                      </span>
                      <strong className="text-[#2D6A4F] font-mono text-xs block mt-0.5">
                        {item.listingId || 'LST-APMC-001'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                        {t('orderId', language) || 'Order ID'}
                      </span>
                      <strong className="text-[#1B4332] font-mono text-xs block mt-0.5">
                        {item.orderId || 'ORD-IND-2026-1001'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                        {t('issueCategory', language) || 'Issue Category'}
                      </span>
                      <strong className="text-amber-900 text-xs block mt-0.5">
                        {item.category.replace(/_/g, ' ')}
                      </strong>
                    </div>
                  </div>

                  {/* Subject & Description */}
                  <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80 space-y-1">
                    <h4 className="text-xs font-bold text-[#1B4332]">
                      {item.subject}
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Farmer Existing Response Banner if present */}
                  {item.farmerResponse && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span>💬</span>
                          <span>{t('farmerResponse', language) || 'Farmer Response to Buyer'}:</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700">
                          {item.farmerRespondedAt || 'Recently'}
                        </span>
                      </div>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {item.farmerResponse}
                      </p>
                    </div>
                  )}

                  {/* Inline Response Form for this specific complaint */}
                  {respondingComplaintId === item.complaintId && (
                    <div className="p-3.5 bg-blue-50 border-2 border-blue-300 rounded-xl space-y-2.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>✍️ {t('respondToBuyer', language) || 'Respond to Buyer'} ({item.buyerName || 'Buyer'})</span>
                        <span className="text-[10px] text-blue-700 font-mono">Lot #{item.listingId || item.orderId}</span>
                      </div>
                      <textarea
                        value={responseInputText}
                        onChange={(e) => setResponseInputText(e.target.value)}
                        placeholder="Explain resolution actions taken, replacement produce lot dispatch, weighbridge tare adjustments..."
                        rows={2}
                        className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-xs text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRespondingComplaintId(null);
                            setResponseInputText('');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                        >
                          {t('close', language) || 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespondToBuyer(item.complaintId, responseInputText)}
                          disabled={!responseInputText.trim()}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Response (Mark Under Investigation)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Resolution Notes & Bottom Actions Row */}
                  <div className="pt-2 border-t border-[#E2DAC5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[11px] text-[#52796F]">
                      {item.assignedOfficer && (
                        <span>Assigned Officer: <strong className="text-[#1B4332]">{item.assignedOfficer}</strong></span>
                      )}
                      {item.resolutionNote && (
                        <p className="text-emerald-800 font-semibold mt-0.5">
                          ✓ Resolution: {item.resolutionNote}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: [Respond to Buyer] and [Mark as Resolved] */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status !== 'RESOLVED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRespondingComplaintId(item.complaintId);
                              setResponseInputText(item.farmerResponse || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Respond to buyer with dispatch details, tare slip, or clarification"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                            <span>{t('respondToBuyer', language) || 'Respond to Buyer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkResolved(item.complaintId)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Mark this ticket as resolved and settled"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('markAsResolved', language) || 'Mark as Resolved'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL: LODGE NEW COMPLAINT */}
      {isNewComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2DAC5] p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DAC5]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                <h3 className="text-sm font-bold text-[#1B4332]">
                  Lodge Support Ticket / Mandi Dispute
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewComplaintModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Dispute Category:</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as any)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                >
                  <option value="PAYMENT_DISPUTE">Payment Dispute (UPI / Escrow delay)</option>
                  <option value="DELIVERY_ISSUE">Delivery Issue (Transit delay / Truck hold)</option>
                  <option value="WEIGHING_MANDI_ISSUE">Weighing / Mandi Tare Discrepancy</option>
                  <option value="CROP_QUALITY">Crop Quality Contestations</option>
                  <option value="PLATFORM_SUPPORT">Platform & Account Support</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Associated Order ID (Optional):</label>
                <select
                  value={complaintOrderId}
                  onChange={(e) => setComplaintOrderId(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                >
                  <option value="">-- No Specific Order Attached --</option>
                  {displayOrders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderId} &bull; {o.cropName} ({o.buyerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Subject / Issue Summary:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Buyer payment delayed after weighbridge acknowledgment"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what occurred, including truck details or payment transaction numbers..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Priority:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setComplaintPriority(p)}
                      className={`py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                        complaintPriority === p
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'bg-[#FAF7EE] text-[#52796F] border-[#D8CDB2]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setIsNewComplaintModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8CDB2] text-stone-600 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DRAWERS & MODALS */}
      <AddCropModal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        onAddCrop={(newCrop) => {
          if (onAddCrop) onAddCrop(newCrop);
          handleSelectCrop(newCrop);
          setIsAddCropModalOpen(false);
        }}
      />

      <CropSelectionDrawer
        isOpen={isCropDrawerOpen}
        onClose={() => setIsCropDrawerOpen(false)}
        crops={crops}
        selectedCropId={selectedCropId}
        onSelectCrop={(c) => {
          handleSelectCrop(c);
          setIsCropDrawerOpen(false);
        }}
        recommendedCropIds={districtProfile.topSellingCropIds}
        onOpenAddCropModal={() => {
          setIsCropDrawerOpen(false);
          setIsAddCropModalOpen(true);
        }}
      />
    </div>
  );
};
