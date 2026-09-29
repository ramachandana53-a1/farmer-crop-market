/**
 * Shared Type Definitions for the Farmer-Crop-Market System (Andhra Pradesh, India)
 * Standardized on Indian Rupees (₹) and Quintals (1 Quintal = 100 kg)
 */

export interface MarketZone {
  zoneId: string;
  zoneName: string;
  districtRegion: string; // e.g., 'Guntur District', 'Ludhiana District', 'Nashik District'
  stateRegion: string;    // e.g., 'Punjab', 'Maharashtra', 'Andhra Pradesh'
  state: string;          // Standardized State Name
  hubCapacityQuintals: number;
  latitude: number;
  longitude: number;
  x: number; // For visual SVG graph canvas coordinate
  y: number; // For visual SVG graph canvas coordinate
  annualRainfallMm?: number;
  icarZoneCode?: string; // e.g., 'ICAR_ZONE_06'
  icarZoneName?: string; // e.g., 'Trans-Gangetic Plain Region'
  soilType?: string;     // e.g., 'Alluvial Soil', 'Black Cotton Soil'
  majorCommodities?: string[];
}

export interface IcarZone {
  zoneNumber: number; // 1 to 15
  zoneCode: string;
  zoneName: string;
  shortName: string;
  statesCovered: string[];
  soilType: string;
  annualRainfallMm: string;
  recommendedCropIds: string[];
  description: string;
  keyRecommendation: string;
}

export interface IndianState {
  code: string;
  name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Union Territory';
  primaryIcarZone: string;
  soilProfile: string;
  districts: string[];
  recommendedCropIds: string[];
}

export type LanguageCode = 
  | 'en' // English
  | 'te' // Telugu
  | 'hi' // Hindi
  | 'ta' // Tamil
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'bn' // Bengali
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as' // Assamese
  | 'ur' // Urdu
  | 'sa' // Sanskrit
  | 'mai' // Maithili
  | 'sat' // Santali
  | 'ks' // Kashmiri
  | 'ne' // Nepali
  | 'kok' // Konkani
  | 'sd' // Sindhi
  | 'doi' // Dogri
  | 'mni' // Manipuri (Meitei)
  | 'brx'; // Bodo

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  role: 'farmer' | 'buyer' | 'academic';
  state: string;
  districtId: string;
  phone?: string;
  gstNumber?: string;
  preferredLanguage?: LanguageCode;
}

export interface CartItem {
  id: string; // unique cart item id
  listingId: string;
  cropId: string;
  cropName: string;
  cropIcon: string;
  farmerName: string;
  farmerDistrict: string;
  sourceZoneId: string;
  destZoneId: string;
  quantityKg: number;
  unitPricePerKg: number;
  produceCostInr: number;
  deliveryFeeInr: number;
  totalAmountInr: number;
  transitDistanceKm: number;
  dijkstraRoute: string[];
  highwayRef: string;
}

export interface Farmer {
  farmerId: string;
  fullName: string;
  phone: string;
  email: string;
  zoneId: string;
  landAreaHectares: number;
}

export interface Buyer {
  buyerId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  zoneId: string;
  buyerType: 'Wholesaler' | 'Retailer' | 'Processor' | 'Exporter';
}

export type CropCategory = 
  | 'Grains' 
  | 'Food Grains'
  | 'Spices' 
  | 'Pulses' 
  | 'Commercial' 
  | 'Cash Crop'
  | 'Horticulture'
  | 'Horticulture/Vegetables' 
  | 'Plantation'
  | 'Plantation Crops'
  | 'Oilseeds'
  | 'Oilseed'
  | 'Fruits'
  | 'Cereal'
  | 'Pulse';

export type SellabilityStatus = 'HIGH_DEMAND' | 'MODERATE' | 'OVER_SUPPLIED';
export type PriceTrend = 'RISING' | 'STABLE' | 'FALLING';

export interface Crop {
  cropId: string;
  cropName: string;
  scientificName: string;
  category: CropCategory;
  season: 'Kharif' | 'Rabi' | 'Annual' | 'Year-round';
  basePricePerQuintal: number; // in Indian Rupees (₹)
  optimalRainfallMm: number;
  optimalSoilScore: number;
  standardProductionCostPerQuintal?: number; // Benchmark Cost of Production (₹/quintal)
  // Compatibility getters/fields
  basePricePerTon?: number;
  icon?: string;
  agroClimaticZones?: string[]; // e.g., ['Godavari Zone', 'Krishna/Guntur Zone']
  isCustom?: boolean; // dynamic custom crop registered by user
}

export interface CropListing {
  listingId: string;
  farmerId: string;
  farmerName?: string;
  cropId: string;
  zoneId: string;
  quantityQuintals: number;
  quantityAvailableKg?: number;
  askingPricePerQuintal: number; // in ₹ (custom_farmer_price per quintal)
  askingPricePerKg?: number;     // in ₹ (custom_farmer_price per kg)
  mlPredictedPricePerQuintal: number; // in ₹ (predicted_price per quintal from ML)
  mlPredictedPricePerKg?: number;     // in ₹ (predicted_price per kg from ML)
  customFarmerPricePerQuintal?: number; // custom_farmer_price per quintal
  customFarmerPricePerKg?: number;      // custom_farmer_price per kg
  extraDemandAmountPerQuintal?: number; // extra_demand_amount = custom_farmer_price - predicted_price
  extraDemandAmountPerKg?: number;      // extra_demand_amount / kg
  isCustomPrice?: boolean;              // true if farmer entered custom price
  expectedYieldQuintals: number;
  rainfallInputMm: number;
  soilQualityIndex: number; // Soil fertility index (0 - 100)
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  createdAt: string;

  // New Farmer P&L & Market Intelligence Fields
  productionCostPerQuintal?: number; // Farmer Cost of Production (CoP) in ₹ / Quintal
  productionCostPerKg?: number;      // Farmer CoP in ₹ / kg
  copBreakdown?: {
    seeds: number;            // ₹ / Quintal
    fertilizers: number;      // ₹ / Quintal
    laborMachinery: number;   // ₹ / Quintal
  };
  netProfitPerQuintal?: number;      // askingPricePerQuintal - productionCostPerQuintal
  netProfitPerKg?: number;           // askingPricePerKg - productionCostPerKg
  profitMarginPct?: number;          // ((asking - cost) / cost) * 100
  sellabilityStatus?: SellabilityStatus; // 'HIGH_DEMAND' | 'MODERATE' | 'OVER_SUPPLIED'
  sellabilityReason?: string;
  priceTrend7d?: PriceTrend;         // 'RISING' | 'STABLE' | 'FALLING'
  sevenDayPrices?: number[];         // 7-day projected prices
  mandiBaseRatePerQuintal?: number;  // Government MSP / Mandi Benchmark

  // Compatibility aliases
  quantityTons?: number;
  askingPricePerTon?: number;
  mlPredictedPricePerTon?: number;
  expectedYieldTons?: number;
}

export interface TransitRoute {
  sourceZoneId: string;
  destZoneId: string;
  distanceKm: number;
  transitCostPerQuintal: number; // Freight cost in ₹ per Quintal
  durationHours: number;
  highwayRef?: string; // e.g., 'NH-16', 'NH-65', 'NH-544D'

  // Compatibility alias
  transitCostPerTon?: number;
}

export interface DijkstraStep {
  stepNumber: number;
  currentNode: string;
  distanceMap: Record<string, number>;
  predecessorMap: Record<string, string | null>;
  settledNodes: string[];
  actionDescription: string;
}

export interface DijkstraResult {
  sourceZoneId: string;
  destZoneId: string;
  routeExists: boolean;
  totalCostPerQuintal: number; // ₹ / Quintal
  totalCostPerTon?: number;    // Compatibility
  totalDistanceKm: number;
  totalDurationHours?: number;
  path: string[];
  hopDetails: Array<{
    from: string;
    to: string;
    cost: number; // ₹ / Quintal
    distance: number;
    duration: number;
    highway?: string;
  }>;
  steps: DijkstraStep[];
}

export interface MLPrediction {
  rainfallMm: number;
  soilQualityIndex: number;
  historicalPrice: number; // Base mandi MSP/rate in ₹ / Quintal
  landHectares: number;
  predictedPricePerQuintal: number; // Expected market price in ₹ / Quintal
  expectedYieldQuintalsPerHa: number;
  totalHarvestQuintals: number;
  grossRevenueEstimateINR: number; // in ₹
  priceDelta: number;
  priceDeltaPct: number;
  rainfallDiff?: number;
  soilAdjustmentFactor?: number;

  // Compatibility aliases
  predictedPricePerTon?: number;
  expectedYieldPerHa?: number;
  totalHarvestTons?: number;
  grossRevenueEstimate?: number;
}

export type NavigationPage =
  | 'farmer_create'
  | 'farmer_estimator'
  | 'farmer_inventory'
  | 'farmer_orders'
  | 'farmer_growth'
  | 'farmer_weather_news'
  | 'buyer_browse'
  | 'buyer_tracker'
  | 'buyer_rates'
  | 'buyer_receipts'
  | 'buyer_transport'
  | 'academic_evaluator'
  | 'dbms_schema'
  | 'source_artifacts';

export type OrderStatus = 'PLACED' | 'PAID' | 'PACKED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  orderId: string;
  listingId: string;
  cropId: string;
  cropName: string;
  cropIcon: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sourceZoneId: string;
  destZoneId: string;
  quantityKg: number;
  quantityQuintals: number;
  pricePerKg: number;
  produceCostInr: number;
  transitFreightCostInr: number;
  totalAmountInr: number;
  status: OrderStatus;
  dijkstraRoute: string[];
  highwayRef: string;
  trackingNumber: string;
  transitDistanceKm: number;
  estimatedTransitHours: number;
  placedAt: string;
  paymentRef: string;
  vehicleLorryNumber: string;
  currentLocationNote: string;

  // Cancellation and Profit tracking fields
  isCancelled?: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  farmerProfitInr?: number;
}

export interface PaymentReceipt {
  paymentId: string;
  transactionRef: string;
  orderId: string;
  buyerName: string;
  buyerDistrict: string;
  farmerName: string;
  farmerDistrict: string;
  cropName: string;
  quantityKg: number;
  quantityQuintals: number;
  unitPricePerKg: number;
  produceAmountInr: number;
  transitFreightInr: number;
  apmcCessInr: number;
  totalAmountInr: number;
  paymentMode: string;
  paymentStatus: 'COMPLETED' | 'ESCROW_SETTLED';
  paidAt: string;
  dijkstraCorridor: string;
}

export interface CropReview {
  reviewId: string;
  orderId: string;
  cropId: string;
  cropName: string;
  listingId?: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1 to 5
  qualityFeedback: string;
  createdAt: string;
}

export interface FarmerComplaint {
  complaintId: string;
  farmerId: string;
  farmerName: string;
  buyerId?: string;
  buyerName?: string;
  category: string;
  orderId?: string;
  listingId?: string;
  cropName?: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  assignedOfficer?: string;
  farmerResponse?: string;
  farmerRespondedAt?: string;
}

export type FarmerPortalTab = 'add_listing' | 'most_demanded' | 'orders_tracker' | 'complaints_support';

export interface TrackingStep {
  step: 'Placed' | 'Accepted' | 'Out for Delivery' | 'Delivered';
  timestamp?: string;
  completed: boolean;
}

export interface DeliveryTrackerRecord {
  orderId: string;
  buyerId: string;
  status: 'ORDER_PLACED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
  trackingSteps: TrackingStep[];
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  role?: 'BUYER' | 'FARMER';
  type: 'order' | 'payment' | 'transit' | 'market' | 'ORDER_UPDATE' | 'STOCK_ALERT';
  title: string;
  message?: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  is_read?: boolean;
  created_at?: string;
  orderId?: string;
  amountInr?: number;
  targetRole?: 'farmer' | 'buyer' | 'all';
  targetFarmerId?: string;
  targetBuyerId?: string;
}
