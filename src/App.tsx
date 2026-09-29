/**
 * ============================================================================
 * ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM (ANDHRA PRADESH & PAN-INDIA)
 * Comprehensive Multi-Discipline Engineering Architecture
 * React 19, TypeScript, Tailwind CSS
 * ============================================================================
 */

import React, { useState, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  INITIAL_ZONES, 
  INITIAL_CROPS, 
  INITIAL_FARMERS, 
  INITIAL_BUYERS, 
  INITIAL_LISTINGS, 
  INITIAL_ROUTES,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPLAINTS,
  INITIAL_REVIEWS,
  CROP_ICONS
} from './data/initialData';
import { PROJECT_CODE_FILES } from './data/projectFiles';
import { 
  CropListing, 
  UserProfile, 
  NavigationPage, 
  Order, 
  OrderStatus, 
  PaymentReceipt, 
  AppNotification,
  Crop,
  MarketZone,
  TransitRoute,
  FarmerComplaint,
  CropReview,
  LanguageCode,
  CartItem
} from './types';
import { runDijkstra } from './utils/dijkstra';
import { SUPPORTED_LANGUAGES, t } from './utils/translations';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { OrderTracker } from './components/OrderTracker';
import { FarmerSalesGrowth } from './components/FarmerSalesGrowth';
import { WeatherAgriNews } from './components/WeatherAgriNews';
import { PaymentReceiptsView } from './components/PaymentReceiptsView';
import { FarmerPortal } from './components/FarmerPortal';
import { BuyerPortal } from './components/BuyerPortal';
import { AcademicEvaluatorPortal } from './components/AcademicEvaluatorPortal';
import { DistrictMarketRates } from './components/DistrictMarketRates';
import { GraphVisualizer } from './components/GraphVisualizer';
import { DbmsExplorer } from './components/DbmsExplorer';
import { MlRegressionStudio } from './components/MlRegressionStudio';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CartDrawer } from './components/CartDrawer';
import { MyOrdersDrawer } from './components/MyOrdersDrawer';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { 
  Menu, 
  Bell, 
  DownloadCloud, 
  Sparkles, 
  ShieldCheck, 
  ArrowRightLeft,
  MapPin,
  Languages,
  Heart,
  ShoppingCart,
  CheckCircle2,
  Users,
  Package
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('farmer_create');
  
  // Multilingual System (Supports all 22 Official Indian Languages + English)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Flipkart-Style Multi-Farmer & Multi-Customer Architecture State
  const [activeFarmerId, setActiveFarmerId] = useState<string>('FARM_003'); // K. Sambasiva Rao (Guntur, AP)
  const [activeBuyerId, setActiveBuyerId] = useState<string>('BUY_001'); // ITC Agri-Business Division (Choupal)

  // Current Farmer & Buyer objects
  const currentFarmer = useMemo(() => {
    return INITIAL_FARMERS.find((f) => f.farmerId === activeFarmerId) || INITIAL_FARMERS[0];
  }, [activeFarmerId]);

  const currentFarmerZone = useMemo(() => {
    return INITIAL_ZONES.find((z) => z.zoneId === currentFarmer.zoneId) || INITIAL_ZONES[0];
  }, [currentFarmer]);

  const currentBuyer = useMemo(() => {
    return INITIAL_BUYERS.find((b) => b.buyerId === activeBuyerId) || INITIAL_BUYERS[0];
  }, [activeBuyerId]);

  const currentBuyerZone = useMemo(() => {
    return INITIAL_ZONES.find((z) => z.zoneId === currentBuyer.zoneId) || INITIAL_ZONES[0];
  }, [currentBuyer]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'FARM_003',
    name: 'K. Sambasiva Rao',
    role: 'farmer',
    state: 'Andhra Pradesh',
    districtId: 'AP_GUNTUR',
    phone: '+91 94401 23456',
    preferredLanguage: 'en',
  });

  // Keep userProfile in sync when activeFarmerId, activeBuyerId, or role changes
  useEffect(() => {
    if (userProfile.role === 'farmer') {
      setUserProfile((prev) => ({
        ...prev,
        id: currentFarmer.farmerId,
        name: currentFarmer.fullName,
        role: 'farmer',
        state: currentFarmerZone.state,
        districtId: currentFarmer.zoneId,
        phone: currentFarmer.phone,
      }));
    } else if (userProfile.role === 'buyer') {
      setUserProfile((prev) => ({
        ...prev,
        id: currentBuyer.buyerId,
        name: currentBuyer.companyName,
        role: 'buyer',
        state: currentBuyerZone.state,
        districtId: currentBuyer.zoneId,
        phone: currentBuyer.phone,
      }));
    }
  }, [userProfile.role, activeFarmerId, activeBuyerId, currentFarmer, currentFarmerZone, currentBuyer, currentBuyerZone]);

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Dynamic Crops, Zones & Routes Master Data State
  const [crops, setCrops] = useState<Crop[]>(INITIAL_CROPS);
  const [zones, setZones] = useState<MarketZone[]>(INITIAL_ZONES);
  const [routes, setRoutes] = useState<TransitRoute[]>(INITIAL_ROUTES);

  // Data Isolation: Independent Wishlists per Buyer account (buyerId -> string[])
  // Initial badge values MUST be 0 when no items are saved
  const [buyerWishlists, setBuyerWishlists] = useState<Record<string, string[]>>({});
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Data Isolation: Independent Shopping Carts per Buyer account (buyerId -> CartItem[])
  // Initial badge values MUST be 0 when no items are saved
  const [buyerCarts, setBuyerCarts] = useState<Record<string, CartItem[]>>({});
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartDeliveryDistrictId, setCartDeliveryDistrictId] = useState<string>('AP_GUNTUR');

  // Dynamically derived active Wishlist and Cart for the current active account
  const activeWishlistIds = useMemo(() => {
    return buyerWishlists[activeBuyerId] || [];
  }, [buyerWishlists, activeBuyerId]);

  const activeCartItems = useMemo(() => {
    return buyerCarts[activeBuyerId] || [];
  }, [buyerCarts, activeBuyerId]);

  const handleAddCrop = (newCrop: Crop) => {
    setCrops((prev) => [...prev, newCrop]);
    const notif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `New Crop Registered: ${newCrop.cropName} (${newCrop.category})`,
      description: `Crop added to Pan-India Master Database. Standard Base: ₹${newCrop.basePricePerQuintal.toLocaleString('en-IN')}/q.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Orders & Payments State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState<boolean>(false);

  // Filter all orders placed by this buyer
  const buyerAllOrders = useMemo(() => {
    return orders.filter(
      (o) => o.buyerId === activeBuyerId || o.buyerId === 'BUY_ACTIVE' || o.buyerId === currentBuyer.buyerId
    );
  }, [orders, activeBuyerId, currentBuyer]);

  // Filter active and past orders from the main orders list
  const activeOrders = useMemo(() => {
    return buyerAllOrders.filter((order) =>
      ['PLACED', 'PAID', 'PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(order.status)
    );
  }, [buyerAllOrders]);

  const pastOrders = useMemo(() => {
    return buyerAllOrders.filter((order) =>
      ['DELIVERED', 'CANCELLED'].includes(order.status)
    );
  }, [buyerAllOrders]);

  // Display counts accurately:
  // Header / Active Bar Badge count:
  const activeCount = activeOrders.length; 
  // Drawer / History Total count:
  const totalCount = buyerAllOrders.length;

  const [payments, setPayments] = useState<PaymentReceipt[]>(INITIAL_PAYMENTS);
  const [complaints, setComplaints] = useState<FarmerComplaint[]>(INITIAL_COMPLAINTS);
  const [reviews, setReviews] = useState<CropReview[]>(INITIAL_REVIEWS);
  const [academicDebugMode, setAcademicDebugMode] = useState<boolean>(false);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<PaymentReceipt | null>(null);
  const [selectedOrderIdForTracker, setSelectedOrderIdForTracker] = useState<string | undefined>(undefined);

  const handleAddReview = (newReview: CropReview) => {
    setReviews((prev) => [newReview, ...prev.filter((r) => r.orderId !== newReview.orderId)]);
    const notif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `⭐ ${newReview.rating}★ Review Submitted for ${newReview.cropName}`,
      description: `Buyer ${newReview.buyerName} rated lot #${newReview.listingId || newReview.orderId}. Rating badge dynamically updated in catalog.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddComplaint = (newComplaint: FarmerComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    const notif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `Support Ticket #${newComplaint.complaintId} Lodged`,
      description: `${newComplaint.subject} routed to farmer ${newComplaint.farmerName || newComplaint.farmerId} under Tab 4.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleRespondComplaint = (complaintId: string, response: string) => {
    const formattedTime = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? {
              ...c,
              status: 'UNDER_REVIEW',
              farmerResponse: response,
              farmerRespondedAt: formattedTime
            }
          : c
      )
    );
    const notif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `Farmer Response on Ticket #${complaintId}`,
      description: `Farmer responded: "${response.slice(0, 50)}..." Status: Under Investigation.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleResolveComplaint = (complaintId: string, note?: string) => {
    const formattedTime = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === complaintId
          ? { ...c, status: 'RESOLVED', resolvedAt: formattedTime, resolutionNote: note || 'Dispute successfully investigated and resolved by farmer.' }
          : c
      )
    );
    const notif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `Ticket #${complaintId} Marked Resolved`,
      description: note || `Dispute for #${complaintId} marked resolved.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Dynamic route pre-selection for graph visualizer
  const [selectedRouteSource, setSelectedRouteSource] = useState<string>('PUN_KHANNA');
  const [selectedRouteDest, setSelectedRouteDest] = useState<string>('AP_GUNTUR');

  const [listings, setListings] = useState<CropListing[]>(INITIAL_LISTINGS);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const handleAddListing = (newListing: CropListing) => {
    const listingWithFarmer: CropListing = {
      ...newListing,
      farmerId: activeFarmerId,
      farmerName: currentFarmer.fullName,
      zoneId: newListing.zoneId || currentFarmer.zoneId
    };
    setListings((prev) => [listingWithFarmer, ...prev]);
    const newNotif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `New Listing Published: ${newListing.quantityAvailableKg || (newListing.quantityQuintals * 100)} kg`,
      description: `Harvest listing for ${newListing.cropId} by ${currentFarmer.fullName} in ${listingWithFarmer.zoneId} published at ₹${newListing.askingPricePerKg || (newListing.askingPricePerQuintal / 100)}/kg.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteListing = (listingId: string) => {
    const toDel = listings.find((l) => l.listingId === listingId);
    setListings((prev) => prev.filter((l) => l.listingId !== listingId));
    const delNotif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'market',
      title: `Listing #${listingId} Deleted`,
      description: `Harvest listing for ${toDel?.cropId || 'crop'} was removed from active APMC inventory.`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [delNotif, ...prev]);
  };

  // Wishlist Toggle (Dynamically syncs with active buyer's wishlist array)
  const handleToggleWishlist = (listingId: string) => {
    setBuyerWishlists((prev) => {
      const currentList = prev[activeBuyerId] || [];
      const exists = currentList.includes(listingId);
      const updated = exists ? currentList.filter((id) => id !== listingId) : [...currentList, listingId];
      return {
        ...prev,
        [activeBuyerId]: updated,
      };
    });
  };

  // Add to Cart Handler (Dynamically syncs with active buyer's cart array)
  const handleAddToCart = (listing: CropListing, quantityKg: number, deliveryDistrictId: string) => {
    const crop = crops.find((c) => c.cropId === listing.cropId);
    const originZone = zones.find((z) => z.zoneId === listing.zoneId) || zones[0];
    const destZone = zones.find((z) => z.zoneId === deliveryDistrictId) || zones[0];
    const mandiRatePerKg = listing.askingPricePerKg || Math.round(listing.askingPricePerQuintal / 100);
    const produceCost = Math.round(quantityKg * mandiRatePerKg);
    const dijkstraResult = runDijkstra(routes, zones.map((z) => z.zoneId), originZone.zoneId, destZone.zoneId);
    const isLocal = originZone.zoneId === destZone.zoneId;
    const freightPerQ = isLocal ? 0 : (dijkstraResult.totalCostPerQuintal || 0);
    const deliveryFee = Math.round((quantityKg / 100) * freightPerQ);

    setBuyerCarts((prev) => {
      const currentList = prev[activeBuyerId] || [];
      const existingIndex = currentList.findIndex((item) => item.listingId === listing.listingId);
      if (existingIndex >= 0) {
        const item = currentList[existingIndex];
        const newQty = item.quantityKg + quantityKg;
        const newProduce = Math.round(newQty * mandiRatePerKg);
        const newDelivery = Math.round((newQty / 100) * freightPerQ);
        const updated = [...currentList];
        updated[existingIndex] = {
          ...item,
          quantityKg: newQty,
          produceCostInr: newProduce,
          deliveryFeeInr: newDelivery,
          totalAmountInr: newProduce + newDelivery,
        };
        return {
          ...prev,
          [activeBuyerId]: updated,
        };
      } else {
        const newItem: CartItem = {
          id: `CART_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
          listingId: listing.listingId,
          cropId: listing.cropId,
          cropName: crop?.cropName || 'Crop Produce',
          cropIcon: CROP_ICONS[listing.cropId] || '🌾',
          farmerName: listing.farmerName || 'AP Producer',
          farmerDistrict: originZone.districtRegion,
          sourceZoneId: originZone.zoneId,
          destZoneId: destZone.zoneId,
          quantityKg,
          unitPricePerKg: mandiRatePerKg,
          produceCostInr: produceCost,
          deliveryFeeInr: deliveryFee,
          totalAmountInr: produceCost + deliveryFee,
          transitDistanceKm: dijkstraResult.totalDistanceKm,
          dijkstraRoute: dijkstraResult.path,
          highwayRef: dijkstraResult.hopDetails[0]?.highway || 'NH-16 Trunk Corridor',
        };
        return {
          ...prev,
          [activeBuyerId]: [...currentList, newItem],
        };
      }
    });
  };

  // Update Cart Item Quantity
  const handleUpdateCartQuantity = (cartItemId: string, newQtyKg: number) => {
    if (newQtyKg <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setBuyerCarts((prev) => {
      const currentList = prev[activeBuyerId] || [];
      const updated = currentList.map((item) => {
        if (item.id === cartItemId) {
          const produce = Math.round(newQtyKg * item.unitPricePerKg);
          const deliveryUnit = item.deliveryFeeInr / (item.quantityKg / 100 || 1);
          const delivery = Math.round((newQtyKg / 100) * deliveryUnit);
          return {
            ...item,
            quantityKg: newQtyKg,
            produceCostInr: produce,
            deliveryFeeInr: delivery,
            totalAmountInr: produce + delivery,
          };
        }
        return item;
      });
      return {
        ...prev,
        [activeBuyerId]: updated,
      };
    });
  };

  // Remove Cart Item
  const handleRemoveCartItem = (cartItemId: string) => {
    setBuyerCarts((prev) => ({
      ...prev,
      [activeBuyerId]: (prev[activeBuyerId] || []).filter((item) => item.id !== cartItemId),
    }));
  };

  // Clear Cart
  const handleClearCart = () => {
    setBuyerCarts((prev) => ({
      ...prev,
      [activeBuyerId]: [],
    }));
  };

  // Consolidated Checkout
  const handleConsolidatedCheckout = () => {
    const buyerItems = buyerCarts[activeBuyerId] || [];
    if (buyerItems.length === 0) return;

    const newOrdersList: Order[] = [];
    const newReceiptsList: PaymentReceipt[] = [];

    buyerItems.forEach((item, idx) => {
      const listing = listings.find((l) => l.listingId === item.listingId);
      const targetFarmerId = listing?.farmerId || 'FARM_003';
      const poNumber = `ORD-CART-${Math.floor(1000 + Math.random() * 9000)}-${idx + 1}`;
      const paymentId = `PAY-CART-${Math.floor(100 + Math.random() * 900)}-${idx + 1}`;
      const txnRef = `TXN-CART-${Math.floor(100000000 + Math.random() * 900000000)}`;

      const newOrder: Order = {
        orderId: poNumber,
        listingId: item.listingId,
        cropId: item.cropId,
        cropName: item.cropName,
        cropIcon: item.cropIcon,
        farmerId: targetFarmerId,
        farmerName: item.farmerName,
        farmerPhone: '+91 94401 23456',
        buyerId: activeBuyerId,
        buyerName: currentBuyer?.companyName || userProfile.name,
        buyerPhone: currentBuyer?.phone || '+91 98480 11223',
        sourceZoneId: item.sourceZoneId,
        destZoneId: item.destZoneId,
        quantityKg: item.quantityKg,
        quantityQuintals: Math.round((item.quantityKg / 100) * 100) / 100,
        pricePerKg: item.unitPricePerKg,
        produceCostInr: item.produceCostInr,
        transitFreightCostInr: item.deliveryFeeInr,
        totalAmountInr: item.totalAmountInr,
        status: 'PLACED',
        dijkstraRoute: item.dijkstraRoute,
        highwayRef: item.highwayRef,
        trackingNumber: `TRK-CART-${Math.floor(100000 + Math.random() * 900000)}`,
        transitDistanceKm: item.transitDistanceKm,
        estimatedTransitHours: Math.max(1, Math.round(item.transitDistanceKm / 50)),
        placedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        paymentRef: txnRef,
        vehicleLorryNumber: `AP ${Math.floor(10 + Math.random() * 20)} TC ${Math.floor(1000 + Math.random() * 9000)}`,
        currentLocationNote: `Consolidated cart order registered. Dispatched via ${item.highwayRef}.`
      };

      const cess = Math.round(item.produceCostInr * 0.01 * 100) / 100;
      const newReceipt: PaymentReceipt = {
        paymentId: paymentId,
        transactionRef: txnRef,
        orderId: poNumber,
        buyerName: currentBuyer?.companyName || userProfile.name,
        buyerDistrict: item.destZoneId,
        farmerName: item.farmerName,
        farmerDistrict: item.farmerDistrict,
        cropName: item.cropName,
        quantityKg: item.quantityKg,
        quantityQuintals: Math.round((item.quantityKg / 100) * 100) / 100,
        unitPricePerKg: item.unitPricePerKg,
        produceAmountInr: item.produceCostInr,
        transitFreightInr: item.deliveryFeeInr,
        apmcCessInr: cess,
        totalAmountInr: item.totalAmountInr + cess,
        paymentMode: 'Consolidated Mandi UPI Settlement (e-NAM)',
        paymentStatus: 'COMPLETED',
        paidAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        dijkstraCorridor: `${item.dijkstraRoute.join(' -> ')} (${item.transitDistanceKm} km)`
      };

      newOrdersList.push(newOrder);
      newReceiptsList.push(newReceipt);

      // 1. Notification conforming to schema
      const notifFarmer: AppNotification = {
        id: `NOTIF_${Date.now()}_${idx}`,
        user_id: targetFarmerId,
        role: 'FARMER',
        type: 'ORDER_UPDATE',
        title: `Order Placed: ${item.cropName} (${item.quantityKg} kg)`,
        message: `Order #${poNumber} booked from farmer ${item.farmerName}. Total: ₹${item.totalAmountInr.toLocaleString('en-IN')}.`,
        description: `Order #${poNumber} booked from farmer ${item.farmerName}. Total: ₹${item.totalAmountInr.toLocaleString('en-IN')}.`,
        timestamp: 'Just now',
        isRead: false,
        is_read: false,
        orderId: poNumber,
        amountInr: item.totalAmountInr,
        targetRole: 'farmer',
        targetFarmerId: targetFarmerId
      };
      const notifBuyer: AppNotification = {
        id: `NOTIF_BUY_${Date.now()}_${idx}`,
        user_id: activeBuyerId,
        role: 'BUYER',
        type: 'ORDER_UPDATE',
        title: `Order #${poNumber} Confirmed (${item.cropName})`,
        message: `Your purchase of ${item.quantityKg} kg is registered. Live tracking active in My Orders.`,
        description: `Your purchase of ${item.quantityKg} kg is registered. Live tracking active in My Orders.`,
        timestamp: 'Just now',
        isRead: false,
        is_read: false,
        orderId: poNumber,
        amountInr: item.totalAmountInr,
        targetRole: 'buyer',
        targetBuyerId: activeBuyerId
      };
      setNotifications((prev) => [notifFarmer, notifBuyer, ...prev]);
    });

    setOrders((prev) => [...newOrdersList, ...prev]);
    setPayments((prev) => [...newReceiptsList, ...prev]);
    setBuyerCarts((prev) => ({ ...prev, [activeBuyerId]: [] }));
    setIsCartOpen(false);
    setIsMyOrdersOpen(true); // Instantly open My Orders drawer with live tracking!
  };

  const handleCancelOrder = (orderId: string) => {
    const orderToCancel = orders.find((o) => o.orderId === orderId);
    if (!orderToCancel || orderToCancel.status === 'CANCELLED') return;

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: 'CANCELLED' as OrderStatus,
              isCancelled: true,
              cancelledAt: new Date().toISOString(),
              currentLocationNote: 'Order cancelled by buyer before dispatch. Stock restored to farmer inventory.'
            }
          : o
      )
    );

    setListings((prev) =>
      prev.map((l) => {
        if (l.listingId === orderToCancel.listingId) {
          const restoredKg = (l.quantityAvailableKg || 0) + orderToCancel.quantityKg;
          const restoredQ = (l.quantityQuintals || 0) + orderToCancel.quantityQuintals;
          return {
            ...l,
            quantityAvailableKg: restoredKg,
            quantityQuintals: restoredQ,
            status: 'AVAILABLE'
          };
        }
        return l;
      })
    );

    const cancelNotif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'order',
      title: `Order #${orderId} Cancelled (${orderToCancel.cropName})`,
      description: `Buyer cancelled order before dispatch. ${orderToCancel.quantityKg} kg automatically restocked to active inventory. Escrow refund processed.`,
      timestamp: 'Just now',
      isRead: false,
      orderId
    };
    setNotifications((prev) => [cancelNotif, ...prev]);
  };

  const handlePlaceOrder = (newOrder: Order, newReceipt: PaymentReceipt) => {
    // 1. Save to Orders Table (makes it visible under "My Orders")
    setOrders((prev) => [newOrder, ...prev]);
    setPayments((prev) => [newReceipt, ...prev]);

    // 2. Initialize Delivery Tracking Record & Emit real-time notification
    const farmerNotif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      user_id: newOrder.farmerId,
      role: 'FARMER',
      type: 'ORDER_UPDATE',
      title: `New Order: ${newOrder.cropName} (${newOrder.quantityKg} kg) from Buyer ${newOrder.buyerName}`,
      message: `Order #${newOrder.orderId} registered with status 'PLACED'. Payment of ₹${newOrder.totalAmountInr.toLocaleString('en-IN')} initiated. Route: ${newOrder.dijkstraRoute.join(' ➔ ')}.`,
      description: `Order #${newOrder.orderId} registered with status 'PLACED'. Payment of ₹${newOrder.totalAmountInr.toLocaleString('en-IN')} initiated. Route: ${newOrder.dijkstraRoute.join(' ➔ ')}.`,
      timestamp: 'Just now',
      isRead: false,
      is_read: false,
      orderId: newOrder.orderId,
      amountInr: newOrder.totalAmountInr,
      targetRole: 'farmer',
      targetFarmerId: newOrder.farmerId
    };

    const buyerNotif: AppNotification = {
      id: `NOTIF_BUY_${Date.now()}`,
      user_id: newOrder.buyerId,
      role: 'BUYER',
      type: 'ORDER_UPDATE',
      title: `Order Placed Successfully: #${newOrder.orderId}`,
      message: `Your order for ${newOrder.quantityKg} kg ${newOrder.cropName} is confirmed with farmer ${newOrder.farmerName}. Total ₹${newOrder.totalAmountInr.toLocaleString('en-IN')}.`,
      description: `Your order for ${newOrder.quantityKg} kg ${newOrder.cropName} is confirmed with farmer ${newOrder.farmerName}. Total ₹${newOrder.totalAmountInr.toLocaleString('en-IN')}.`,
      timestamp: 'Just now',
      isRead: false,
      is_read: false,
      orderId: newOrder.orderId,
      amountInr: newOrder.totalAmountInr,
      targetRole: 'buyer',
      targetBuyerId: newOrder.buyerId
    };

    setNotifications((prev) => [farmerNotif, buyerNotif, ...prev]);
    if (userProfile.role === 'buyer') {
      setIsMyOrdersOpen(true);
    } else {
      setIsNotificationOpen(true);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          let loc = o.currentLocationNote;
          if (newStatus === 'PAID') loc = 'Payment confirmed in Escrow; dispatch order issued to APMC yard.';
          if (newStatus === 'PACKED') loc = 'Agri-inspection passed; bagged and loaded onto transport vehicle.';
          if (newStatus === 'IN_TRANSIT') loc = `En route along ${o.highwayRef}; vehicle GPS active.`;
          if (newStatus === 'DELIVERED') loc = `Gate pass verified; delivery completed at destination APMC mandi terminal.`;
          return { ...o, status: newStatus, currentLocationNote: loc };
        }
        return o;
      })
    );

    const updateNotif: AppNotification = {
      id: `NOTIF_${Date.now()}`,
      type: 'transit',
      title: `Order ${orderId} Status: ${newStatus}`,
      description: `Delivery milestone reached via Dijkstra route. Current status: ${newStatus}.`,
      timestamp: 'Just now',
      isRead: false,
      orderId: orderId
    };
    setNotifications((prev) => [updateNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleOpenReceiptModalByOrderId = (orderId: string) => {
    const found = payments.find((p) => p.orderId === orderId);
    if (found) {
      setSelectedReceiptForModal(found);
    } else {
      const ord = orders.find((o) => o.orderId === orderId);
      if (ord) {
        const cess = Math.round(ord.produceCostInr * 0.01 * 100) / 100;
        setSelectedReceiptForModal({
          paymentId: `PAY-APMC-${Math.floor(100 + Math.random() * 900)}`,
          transactionRef: ord.paymentRef,
          orderId: ord.orderId,
          buyerName: ord.buyerName,
          buyerDistrict: ord.destZoneId,
          farmerName: ord.farmerName,
          farmerDistrict: ord.sourceZoneId,
          cropName: ord.cropName,
          quantityKg: ord.quantityKg,
          quantityQuintals: ord.quantityQuintals,
          unitPricePerKg: ord.pricePerKg,
          produceAmountInr: ord.produceCostInr,
          transitFreightInr: ord.transitFreightCostInr,
          apmcCessInr: cess,
          totalAmountInr: ord.totalAmountInr,
          paymentMode: 'UPI Instant Mandi Settlement (e-NAM)',
          paymentStatus: 'COMPLETED',
          paidAt: ord.placedAt,
          dijkstraCorridor: `${ord.dijkstraRoute.join(' -> ')} (${ord.transitDistanceKm} km)`
        });
      }
    }
  };

  const handleTrackOrderFromAnywhere = (orderId: string) => {
    setSelectedOrderIdForTracker(orderId);
    setCurrentPage(userProfile.role === 'farmer' ? 'farmer_orders' : 'buyer_tracker');
  };

  const handleNavigateToRouteVisualizer = (sourceZone: string, destZone: string) => {
    setSelectedRouteSource(sourceZone);
    setSelectedRouteDest(destZone);
    setCurrentPage('buyer_transport');
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zip = new JSZip();

      PROJECT_CODE_FILES.forEach((file) => {
        zip.file(file.filename, file.code);
      });

      const readmeText = `# Academic Project: Farmer-Crop-Market System (Andhra Pradesh, India)
## Multi-Disciplinary Computer Science & Agricultural Engineering

This repository contains the complete implementation across all required academic modules:
1. DBMS (PostgreSQL / MySQL) - schema.sql (3NF with Users, Market_Zones, Crops, Listings, Orders, Payments).
2. ADSA & DMGT Graph Router - TransitGraph.java / MarketTransitRouter.java (Dijkstra algorithm along highway network).
3. Python ML Engine - crop_ml_predictor.py (scikit-learn multivariate OLS price and yield regression).
4. Java Application Controller - FarmerMarketApp.java.
5. Standalone Prototype - farmer_market_ui.html.
`;
      zip.file('README.md', readmeText);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Farmer-Crop-Market-System-APMC.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP archive', err);
      alert('Error bundling project files into ZIP.');
    } finally {
      setIsDownloading(false);
    }
  };

  const currentZone = zones.find((z) => z.zoneId === userProfile.districtId) || zones[0];
  const activeLanguageInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#F4F1DE] text-[#1B4332] flex font-sans selection:bg-[#E9C46A] selection:text-[#1B4332]">
      {/* 1. ROLE-BASED COLLAPSIBLE LEFT SIDEBAR */}
      <CollapsibleSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userProfile={userProfile}
        language={currentLanguage}
        onUpdateUserProfile={(updates) => {
          setUserProfile((prev) => ({ ...prev, ...updates }));
          if (updates.role && updates.role !== userProfile.role) {
            setCurrentPage(updates.role === 'farmer' ? 'farmer_create' : 'buyer_browse');
          }
        }}
        zones={zones}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. NOTIFICATION SLIDE-OVER DRAWER */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectOrder={handleTrackOrderFromAnywhere}
      />

      {/* 3. DOWNLOADABLE / PRINTABLE PAYMENT RECEIPT MODAL */}
      <PaymentReceiptModal
        receipt={selectedReceiptForModal}
        onClose={() => setSelectedReceiptForModal(null)}
      />

      {/* 4. FLIPKART/MEESHO WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={activeWishlistIds}
        listings={listings}
        crops={crops}
        zones={zones}
        language={currentLanguage}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={(listing, qty) => {
          handleAddToCart(listing, qty, cartDeliveryDistrictId);
          handleToggleWishlist(listing.listingId);
        }}
        onOpenDetails={(listing) => {
          setIsWishlistOpen(false);
          setCurrentPage('buyer_browse');
        }}
      />

      {/* 5. FLIPKART/MEESHO SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={activeCartItems}
        zones={zones}
        language={currentLanguage}
        selectedDeliveryDistrictId={cartDeliveryDistrictId}
        onChangeDeliveryDistrict={setCartDeliveryDistrictId}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onConsolidatedCheckout={handleConsolidatedCheckout}
      />

      {/* 5B. BUYER DEDICATED MY ORDERS & LIVE DELIVERY TRACKER DRAWER */}
      <MyOrdersDrawer
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        buyerId={activeBuyerId}
        language={currentLanguage}
        onTrackOrder={(orderId) => {
          setSelectedOrderIdForTracker(orderId);
          setCurrentPage('buyer_tracker');
          setIsMyOrdersOpen(false);
        }}
        onViewReceipt={handleOpenReceiptModalByOrderId}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddReview={handleAddReview}
        onAddComplaint={handleAddComplaint}
        reviews={reviews}
        isAcademicMode={academicDebugMode}
        userRole={userProfile.role}
        selectedOrderId={selectedOrderIdForTracker}
        setSelectedOrderId={setSelectedOrderIdForTracker}
      />

      {/* 6. MULTILINGUAL SELECTOR MODAL (22 Official Indian Languages + English) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(code) => {
          setCurrentLanguage(code);
          setUserProfile((prev) => ({ ...prev, preferredLanguage: code }));
          setIsLanguageModalOpen(false);
        }}
      />

      {/* 7. MAIN CONTENT AREA */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#1B4332] text-white border-b-2 border-[#E9C46A] px-3 sm:px-6 py-2.5 shadow-sm flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-stone-200 hover:text-white hover:bg-white/10 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight truncate">🌾 Farmer-Crop-Market</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-200 hidden md:block truncate">
                {currentZone.districtRegion} &bull; Currency: <strong>INR (₹)</strong>
              </p>
            </div>
          </div>

          {/* Top Bar Action Controls: Role Switcher, Profile Switcher, Language, Wishlist, Cart & Alerts */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
            {/* 3-Role Switcher */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-[#E9C46A]/30">
              <button
                type="button"
                onClick={() => {
                  setUserProfile((p) => ({ ...p, role: 'farmer' }));
                  setCurrentPage('farmer_create');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  userProfile.role === 'farmer'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="Switch to Farmer Portal"
              >
                <span>🌾</span>
                <span className="hidden sm:inline ml-1">{t('farmer', currentLanguage)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserProfile((p) => ({ ...p, role: 'buyer' }));
                  setCurrentPage('buyer_browse');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  userProfile.role === 'buyer'
                    ? 'bg-[#264653] text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="Switch to Buyer Portal"
              >
                <span>🛒</span>
                <span className="hidden sm:inline ml-1">{t('buyer', currentLanguage)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserProfile((p) => ({ ...p, role: 'academic' }));
                  setCurrentPage('academic_evaluator');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  userProfile.role === 'academic'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:text-[#E9C46A]'
                }`}
                title="Switch to Academic Evaluator Portal"
              >
                <span>🎓</span>
                <span className="hidden md:inline ml-1">{t('evaluator', currentLanguage)}</span>
              </button>
            </div>

            {/* Language Selector Button (22 Official Indian Languages) - Visible across all views */}
            <button
              type="button"
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
              title="Change Language / 22 Official Indian Languages"
            >
              <Languages className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span className="text-[11px] font-bold hidden sm:inline">{activeLanguageInfo.nativeName || activeLanguageInfo.name}</span>
            </button>

            {/* ========================================================================= */}
            {/* FARMER VIEW CONTROLS: [Farmer Profile Switcher] + [Notification Bell 🔔]  */}
            {/* Hides Wishlist (❤️), Cart (🛒), and ZIP Export                             */}
            {/* ========================================================================= */}
            {userProfile.role === 'farmer' && (
              <>
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-xl border border-[#E9C46A]/40 text-xs shadow-xs">
                  <span className="text-sm shrink-0">👨‍🌾</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#E9C46A] font-black leading-none">
                      {t('switchFarmerAccount', currentLanguage)}
                    </span>
                    <select
                      value={activeFarmerId}
                      onChange={(e) => setActiveFarmerId(e.target.value)}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer truncate max-w-[120px] sm:max-w-[170px]"
                      title="Switch Farmer Account Profile"
                    >
                      {INITIAL_FARMERS.map((f) => {
                        const fz = zones.find((z) => z.zoneId === f.zoneId);
                        return (
                          <option key={f.farmerId} value={f.farmerId} className="bg-[#1B4332] text-white">
                            {f.fullName} ({fz?.districtRegion.replace(' District', '') || f.zoneId})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Notifications Bell (🔔) - ONLY in Farmer View for orders, dispatches & buyer tickets */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Farmer Notifications: Orders, Dispatches & Buyer Support Tickets"
                >
                  <Bell className="w-4 h-4 text-[#E9C46A]" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332]">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* ========================================================================= */}
            {/* BUYER VIEW CONTROLS: [Buyer Profile Switcher] + [Wishlist ❤️] + [Cart 🛒]  */}
            {/* Hides Notification Bell (🔔) and ZIP Export                               */}
            {/* ========================================================================= */}
            {userProfile.role === 'buyer' && (
              <>
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-xl border border-[#E9C46A]/40 text-xs shadow-xs">
                  <span className="text-sm shrink-0">🏢</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#E9C46A] font-black leading-none">
                      {t('switchCustomerAccount', currentLanguage)}
                    </span>
                    <select
                      value={activeBuyerId}
                      onChange={(e) => setActiveBuyerId(e.target.value)}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer truncate max-w-[120px] sm:max-w-[170px]"
                      title="Switch Buyer Customer Account"
                    >
                      {INITIAL_BUYERS.map((b) => {
                        const bz = zones.find((z) => z.zoneId === b.zoneId);
                        return (
                          <option key={b.buyerId} value={b.buyerId} className="bg-[#1B4332] text-white">
                            {b.companyName.split(' ')[0]} ({bz?.districtRegion.replace(' District', '') || b.zoneId})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Wishlist Button (❤️) with live badge count */}
                <button
                  type="button"
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 transition cursor-pointer border border-white/10"
                  title="Saved Wishlist Crops"
                >
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#1B4332]">
                    {activeWishlistIds.length}
                  </span>
                </button>

                {/* Shopping Cart (🛒) with live badge count */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-1.5 sm:p-2 rounded-xl bg-[#2D6A4F] hover:bg-[#143326] text-white transition cursor-pointer border border-[#E9C46A]/40 shadow-xs"
                  title="Shopping Cart & Consolidated Checkout"
                >
                  <ShoppingCart className="w-4 h-4 text-[#E9C46A]" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#1B4332]">
                    {activeCartItems.length}
                  </span>
                </button>

                {/* Dedicated My Orders (📦) Header Section & Drawer Button */}
                <button
                  type="button"
                  onClick={() => setIsMyOrdersOpen(true)}
                  className="relative p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-[#264653] text-white transition cursor-pointer border border-[#E9C46A]/40 shadow-xs flex items-center gap-1.5"
                  title={`My Orders & Delivery Tracker: ${activeCount} Active Purchases (${totalCount} Total)`}
                >
                  <Package className="w-4 h-4 text-[#E9C46A]" />
                  <span className="hidden md:inline text-xs font-bold text-emerald-100">
                    {t('myOrdersPurchases', currentLanguage) || 'My Orders'}
                  </span>
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#E9C46A] text-[#1B4332] text-[10px] font-black flex items-center justify-center ring-2 ring-[#1B4332]">
                    {activeCount}
                  </span>
                </button>
              </>
            )}

            {/* ========================================================================= */}
            {/* ACADEMIC EVALUATOR VIEW CONTROLS: [Export ZIP] button ONLY                */}
            {/* Hides Profile Switcher, Wishlist (❤️), Cart (🛒), and Notification Bell (🔔) */}
            {/* ========================================================================= */}
            {userProfile.role === 'academic' && (
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9C46A] hover:bg-[#dfba5f] text-[#1B4332] text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                title="Download Complete Project Source Code (.zip)"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-[#1B4332]" />
                <span className="hidden sm:inline">{isDownloading ? 'Bundling...' : 'Export ZIP'}</span>
                <span className="sm:hidden">ZIP</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* ================= FARMER VIEWS (Isolated by activeFarmerId) ================= */}
          {currentPage === 'farmer_create' && (
            <FarmerPortal
              farmers={INITIAL_FARMERS}
              crops={crops}
              zones={zones}
              listings={listings.filter((l) => l.farmerId === activeFarmerId)}
              onAddListing={handleAddListing}
              onDeleteListing={handleDeleteListing}
              onAddCrop={handleAddCrop}
              viewMode="create"
              userProfile={userProfile}
              orders={orders.filter((o) => o.farmerId === activeFarmerId)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewReceipt={handleOpenReceiptModalByOrderId}
              complaints={complaints.filter((c) => c.farmerId === activeFarmerId || !c.farmerId)}
              onAddComplaint={handleAddComplaint}
              onRespondComplaint={handleRespondComplaint}
              onResolveComplaint={handleResolveComplaint}
              initialTab="add_listing"
              onNavigateToEstimator={() => setCurrentPage('farmer_estimator')}
              language={currentLanguage}
            />
          )}

          {currentPage === 'farmer_inventory' && (
            <FarmerPortal
              farmers={INITIAL_FARMERS}
              crops={crops}
              zones={zones}
              listings={listings.filter((l) => l.farmerId === activeFarmerId)}
              onAddListing={handleAddListing}
              onDeleteListing={handleDeleteListing}
              onAddCrop={handleAddCrop}
              viewMode="inventory"
              userProfile={userProfile}
              orders={orders.filter((o) => o.farmerId === activeFarmerId)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewReceipt={handleOpenReceiptModalByOrderId}
              complaints={complaints.filter((c) => c.farmerId === activeFarmerId || !c.farmerId)}
              onAddComplaint={handleAddComplaint}
              onRespondComplaint={handleRespondComplaint}
              onResolveComplaint={handleResolveComplaint}
              initialTab="complaints_support"
              onNavigateToEstimator={() => setCurrentPage('farmer_estimator')}
              language={currentLanguage}
            />
          )}

          {currentPage === 'farmer_estimator' && (
            <MlRegressionStudio crops={crops} />
          )}

          {currentPage === 'farmer_orders' && (
            <OrderTracker
              orders={orders.filter((o) => o.farmerId === activeFarmerId)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewReceipt={handleOpenReceiptModalByOrderId}
              onCancelOrder={handleCancelOrder}
              selectedOrderId={selectedOrderIdForTracker}
              language={currentLanguage}
            />
          )}

          {currentPage === 'farmer_growth' && (
            <FarmerSalesGrowth userProfile={userProfile} />
          )}

          {currentPage === 'farmer_weather_news' && (
            <WeatherAgriNews zones={zones} />
          )}

          {/* ================= BUYER VIEWS (Isolated by activeBuyerId) ================= */}
          {currentPage === 'buyer_browse' && (
            <BuyerPortal
              buyers={INITIAL_BUYERS}
              farmers={INITIAL_FARMERS}
              crops={crops}
              zones={zones}
              listings={listings}
              routes={routes}
              userProfile={userProfile}
              language={currentLanguage}
              wishlistIds={activeWishlistIds}
              cartItems={activeCartItems}
              orders={orders.filter((o) => o.buyerId === activeBuyerId)}
              reviews={reviews}
              onAddReview={handleAddReview}
              onAddComplaint={handleAddComplaint}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
              onOpenOrders={() => setIsMyOrdersOpen(true)}
              activeBuyerId={activeBuyerId}
              onNavigateToRouteVisualizer={handleNavigateToRouteVisualizer}
              onPlaceOrder={handlePlaceOrder}
              onTrackOrder={handleTrackOrderFromAnywhere}
              onViewReceipt={handleOpenReceiptModalByOrderId}
            />
          )}

          {currentPage === 'buyer_tracker' && (
            <OrderTracker
              orders={orders.filter((o) => o.buyerId === activeBuyerId)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewReceipt={handleOpenReceiptModalByOrderId}
              onCancelOrder={handleCancelOrder}
              selectedOrderId={selectedOrderIdForTracker}
              language={currentLanguage}
              isBuyer={true}
              reviews={reviews}
              onAddReview={handleAddReview}
              onAddComplaint={handleAddComplaint}
            />
          )}

          {currentPage === 'buyer_rates' && (
            <DistrictMarketRates
              zones={zones}
              listings={listings}
              crops={crops}
              onSelectZoneForRoute={(zId) => {
                setSelectedRouteSource(zId);
                setCurrentPage('buyer_transport');
              }}
            />
          )}

          {currentPage === 'buyer_receipts' && (
            <PaymentReceiptsView
              receipts={payments}
              onOpenReceiptModal={setSelectedReceiptForModal}
            />
          )}

          {currentPage === 'buyer_transport' && (
            <GraphVisualizer
              zones={zones}
              routes={routes}
              initialSourceZoneId={selectedRouteSource}
              initialDestZoneId={selectedRouteDest}
            />
          )}

          {currentPage === 'academic_evaluator' && (
            <AcademicEvaluatorPortal
              zones={zones}
              farmers={INITIAL_FARMERS}
              buyers={INITIAL_BUYERS}
              crops={crops}
              listings={listings}
              routes={routes}
              onDownloadZip={handleDownloadZip}
              isDownloading={isDownloading}
            />
          )}

          {/* ================= SYSTEM & ACADEMIC VIEWS ================= */}
          {currentPage === 'dbms_schema' && (
            <DbmsExplorer
              zones={zones}
              farmers={INITIAL_FARMERS}
              buyers={INITIAL_BUYERS}
              crops={crops}
              listings={listings}
              routes={routes}
            />
          )}

          {currentPage === 'source_artifacts' && (
            <SourceCodeViewer 
              files={PROJECT_CODE_FILES} 
              onDownloadZip={handleDownloadZip}
              isDownloading={isDownloading}
            />
          )}
        </main>

        {/* Global Footer with Academic Mode Toggle */}
        <footer className="bg-[#1B4332] border-t border-[#2D6A4F] text-emerald-100 py-3.5 px-4 sm:px-6 text-xs mt-auto space-y-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🌾</span>
              <span className="font-semibold text-white">Farmer-Crop-Market System</span>
              <span className="text-emerald-300/80 hidden md:inline">&bull; Pan-India Mandi Network &bull; 15 ICAR Agro-Climatic Zones</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAcademicDebugMode(!academicDebugMode)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  academicDebugMode 
                    ? 'bg-[#E9C46A] text-[#1B4332] border-[#E9C46A] shadow-xs' 
                    : 'bg-white/10 hover:bg-white/20 text-[#E9C46A] border-[#E9C46A]/40'
                }`}
                title="Toggle Academic Mode (show/hide DMGT Set Partitioning & Dijkstra graph algorithms for professor evaluation)"
              >
                <span>🔬 Academic Mode: {academicDebugMode ? 'ACTIVE (Visible)' : 'OFF (Farmer View)'}</span>
              </button>

              <div className="text-emerald-300/80 font-mono text-[11px] hidden sm:block">
                Dijkstra Shortest Freight &bull; OLS Regression &bull; 3NF SQL
              </div>
            </div>
          </div>

          {/* Academic Debug Inspection Drawer / Panel for Professor Evaluation */}
          {academicDebugMode && (
            <div className="max-w-7xl mx-auto pt-3 border-t border-[#2D6A4F] animate-in fade-in duration-200">
              <div className="bg-[#143326] p-3.5 rounded-xl border border-[#E9C46A]/50 space-y-2 text-stone-200">
                <div className="flex items-center justify-between text-xs font-bold text-[#E9C46A]">
                  <span>ACADEMIC EVALUATION PANEL: DMGT SET THEORY, ADSA DIJKSTRA & PYTHON OLS INVARIANTS</span>
                  <span className="text-[10px] font-mono text-emerald-300">Target: Professor Evaluation / External Viva</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <strong className="text-emerald-200 block mb-0.5">1. DMGT Set Theory Partitioning:</strong>
                    Universal set <code>U = ⋃ Z_i</code> where <code>Z_i ∩ Z_j = ∅</code>. Filtering by district subsets forms true equivalence classes <code>[x]_R</code> with zero cross-district boundary overlap.
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <strong className="text-emerald-200 block mb-0.5">2. ADSA Dijkstra Min-Heap Routing:</strong>
                    Shortest transport freight route calculated via edge relaxation: <code>d[v] = min(d[v], d[u] + w(u,v))</code>. Invariant guarantees lowest transport freight cost per quintal along national highway corridors.
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <strong className="text-emerald-200 block mb-0.5">3. Python scikit-learn OLS Model:</strong>
                    <code>P̂ = β₀ + β₁(Rainfall) + β₂(Soil) + β₃(Demand)</code>. Runs silently in the background with automated defaults, generating <code>predicted_price</code> without cluttering the farmer screen.
                  </div>
                </div>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
