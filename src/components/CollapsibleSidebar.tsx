import React from 'react';
import { 
  NavigationPage, 
  UserProfile, 
  MarketZone,
  LanguageCode
} from '../types';
import { t } from '../utils/translations';
import { 
  Sprout, 
  Bell, 
  TrendingUp, 
  Package, 
  MessageSquare, 
  ShoppingCart, 
  Truck, 
  LineChart, 
  Receipt, 
  GraduationCap,
  Database, 
  Compass, 
  Layers, 
  BrainCircuit, 
  Code2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRightLeft,
  X
} from 'lucide-react';

interface CollapsibleSidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (updates: Partial<UserProfile>) => void;
  zones: MarketZone[];
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  language?: LanguageCode;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  currentPage,
  onNavigate,
  userProfile,
  onUpdateUserProfile,
  zones,
  unreadNotificationCount,
  onOpenNotifications,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  language = 'en',
}) => {
  const role = userProfile.role || 'farmer';

  const setRole = (nextRole: 'farmer' | 'buyer' | 'academic') => {
    onUpdateUserProfile({ role: nextRole });
    if (nextRole === 'farmer') {
      onNavigate('farmer_create');
    } else if (nextRole === 'buyer') {
      onNavigate('buyer_browse');
    } else {
      onNavigate('academic_evaluator');
    }
  };

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const currentZone = zones.find((z) => z.zoneId === userProfile.districtId) || zones[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#1B4332] text-white border-r border-[#2D6A4F] flex flex-col transition-all duration-300 shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Brand / Logo Header */}
        <div className="p-4 border-b border-[#2D6A4F] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E9C46A] to-[#D4A373] text-[#1B4332] flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              🌾
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm tracking-tight text-white truncate leading-tight">
                  Agri Market
                </h1>
                <p className="text-[11px] text-[#E9C46A] truncate font-medium">
                  {role === 'academic' ? t('academicEvaluator', language) : role === 'buyer' ? t('buyerPortal', language) : t('farmerPortal', language)}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Role Switching Control in Sidebar */}
        <div className="p-3 border-b border-[#2D6A4F] bg-[#143326]">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${
                  role === 'academic'
                    ? 'bg-[#E9C46A] text-[#1B4332] border-white'
                    : role === 'buyer'
                    ? 'bg-[#264653] text-[#E9C46A] border-[#E9C46A]'
                    : 'bg-[#2D6A4F] text-[#F4F1DE] border-[#E9C46A]'
                }`}>
                  {role === 'academic' ? '🎓' : role === 'buyer' ? '🛒' : '🌾'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{userProfile.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      role === 'academic'
                        ? 'bg-[#E9C46A] text-[#1B4332]'
                        : role === 'buyer'
                        ? 'bg-[#264653] text-[#E9C46A]'
                        : 'bg-[#2D6A4F] text-[#E9C46A]'
                    }`}>
                      {role === 'academic' ? t('evaluator', language) : role === 'buyer' ? t('buyer', language) : t('farmer', language)}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-300 truncate mt-0.5">
                    📍 {currentZone.districtRegion.replace(' District', '')}
                  </div>
                </div>
              </div>

              {/* Strict 3-Role Segmented Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#E9C46A] font-bold block">
                  {t('selectRoleView', language)}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#1B4332] p-1 rounded-xl border border-[#2D6A4F]">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                      role === 'farmer'
                        ? 'bg-[#2D6A4F] text-white shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    🌾 {t('farmer', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                      role === 'buyer'
                        ? 'bg-[#264653] text-white shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    🛒 {t('buyer', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('academic')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                      role === 'academic'
                        ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                        : 'text-stone-300 hover:text-[#E9C46A]'
                    }`}
                  >
                    🎓 {t('evaluator', language)}
                  </button>
                </div>
              </div>

              {/* District Switcher Dropdown (for Farmer and Buyer) */}
              {role !== 'academic' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                    {t('mandiDistrict', language)}:
                  </label>
                  <select
                    value={userProfile.districtId}
                    onChange={(e) => onUpdateUserProfile({ districtId: e.target.value })}
                    className="w-full text-xs bg-[#1B4332] text-white border border-[#2D6A4F] rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#E9C46A]"
                  >
                    {zones.map((z) => (
                      <option key={z.zoneId} value={z.zoneId} className="bg-[#1B4332] text-white">
                        {z.districtRegion} ({z.zoneName.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  const next = role === 'farmer' ? 'buyer' : role === 'buyer' ? 'academic' : 'farmer';
                  setRole(next);
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm cursor-pointer ${
                  role === 'academic'
                    ? 'bg-[#E9C46A] text-[#1B4332] border-white'
                    : role === 'buyer'
                    ? 'bg-[#264653] text-[#E9C46A] border-[#E9C46A]'
                    : 'bg-[#2D6A4F] text-[#F4F1DE] border-[#E9C46A]'
                }`}
                title={`Current: ${role}. Click to switch role.`}
              >
                {role === 'academic' ? '🎓' : role === 'buyer' ? '🛒' : '🌾'}
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Menu - STRICTLY ROLE-ISOLATED */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* ================= 1. FARMER PORTAL SIDEBAR (100% NON-TECHNICAL) ================= */}
          {role === 'farmer' && (
            <div className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#E9C46A] mb-2 flex items-center justify-between">
                  <span>{t('farmerPortal', language)}</span>
                  <span className="text-[9px] text-emerald-300 font-normal">{t('nonTechnicalUI', language)}</span>
                </div>
              )}

              {/* [🌾 Add Produce] */}
              <button
                onClick={() => handleNavClick('farmer_create')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'farmer_create'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('addProduce', language)}
              >
                <Sprout className="w-4 h-4 shrink-0 text-[#E9C46A]" />
                {!isCollapsed && <span>{t('addProduce', language)}</span>}
              </button>

              {/* [🔥 Most Demanded Crops] */}
              <button
                onClick={() => handleNavClick('farmer_growth')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'farmer_growth'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('mostDemandedCrops', language)}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>{t('mostDemandedCrops', language)}</span>}
              </button>

              {/* [🚚 My Orders & Delivery Tracker] */}
              <button
                onClick={() => handleNavClick('farmer_orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'farmer_orders'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('myOrdersTracker', language)}
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!isCollapsed && <span>{t('myOrdersTracker', language)}</span>}
                </div>
              </button>

              {/* [💬 Complaints & Support] */}
              <button
                onClick={() => handleNavClick('farmer_inventory')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'farmer_inventory'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('complaintsSupport', language)}
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-teal-300" />
                {!isCollapsed && <span>{t('complaintsSupport', language)}</span>}
              </button>

              {/* Notifications Drawer Slide-over button */}
              <button
                onClick={onOpenNotifications}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-white/10 transition mt-2 cursor-pointer"
                title={t('alertsDrawer', language)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-4 h-4 shrink-0 text-emerald-300" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#1B4332]" />
                    )}
                  </div>
                  {!isCollapsed && <span>🔔 {t('alertsDrawer', language)}</span>}
                </div>
                {!isCollapsed && unreadNotificationCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-[#1B4332] text-[10px] font-bold">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ================= 2. BUYER PORTAL SIDEBAR (FLIPKART-STYLE E-COMMERCE) ================= */}
          {role === 'buyer' && (
            <div className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#E9C46A] mb-2 flex items-center justify-between">
                  <span>{t('buyerPortal', language)}</span>
                  <span className="text-[9px] text-emerald-300 font-normal">{t('mandiStore', language)}</span>
                </div>
              )}

              {/* Shopping Catalog */}
              <button
                onClick={() => handleNavClick('buyer_browse')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'buyer_browse'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('allAvailableCrops', language)}
              >
                <ShoppingCart className="w-4 h-4 shrink-0 text-[#E9C46A]" />
                {!isCollapsed && <span>🛒 {t('allAvailableCrops', language)}</span>}
              </button>

              {/* Flipkart-Style Order Tracker */}
              <button
                onClick={() => handleNavClick('buyer_tracker')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'buyer_tracker'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('myOrdersTracker', language)}
              >
                <Truck className="w-4 h-4 shrink-0 text-amber-300" />
                {!isCollapsed && <span>🚚 {t('myOrdersTracker', language)}</span>}
              </button>

              {/* District Market Price Index */}
              <button
                onClick={() => handleNavClick('buyer_rates')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'buyer_rates'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('mandiMarketRate', language)}
              >
                <LineChart className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span>📈 {t('mandiMarketRate', language)}</span>}
              </button>

              {/* Payment Receipts & Tax Invoices */}
              <button
                onClick={() => handleNavClick('buyer_receipts')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'buyer_receipts'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('viewReceipt', language)}
              >
                <Receipt className="w-4 h-4 shrink-0 text-teal-300" />
                {!isCollapsed && <span>🧾 {t('viewReceipt', language)}</span>}
              </button>
            </div>
          )}

          {/* ================= 3. ACADEMIC EVALUATOR PORTAL SIDEBAR ================= */}
          {role === 'academic' && (
            <div className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#E9C46A] mb-2 flex items-center justify-between">
                  <span>{t('academicEvaluator', language)}</span>
                  <span className="text-[9px] text-[#E9C46A] font-bold">Professor Viva</span>
                </div>
              )}

              {/* Evaluator Portal Overview */}
              <button
                onClick={() => handleNavClick('academic_evaluator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'academic_evaluator'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs font-bold'
                    : 'text-stone-200 hover:bg-white/10'
                }`}
                title={t('academicEvaluator', language)}
              >
                <GraduationCap className="w-4 h-4 shrink-0 text-[#E9C46A]" />
                {!isCollapsed && <span>🎓 {t('academicEvaluator', language)}</span>}
              </button>

              {/* a) DBMS 3NF Relational Schema */}
              <button
                onClick={() => handleNavClick('dbms_schema')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'dbms_schema'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-300 hover:bg-white/10'
                }`}
                title="a) DBMS 3NF Relational Schema"
              >
                <Database className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span>💾 a) DBMS 3NF SQL</span>}
              </button>

              {/* b) ADSA Dijkstra Graph Visualizer */}
              <button
                onClick={() => handleNavClick('buyer_transport')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'buyer_transport'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-300 hover:bg-white/10'
                }`}
                title="b) ADSA Dijkstra Graph Routing"
              >
                <Compass className="w-4 h-4 shrink-0 text-blue-300" />
                {!isCollapsed && <span>🗺️ b) ADSA Dijkstra</span>}
              </button>

              {/* c) DMGT Set Equivalence Partitions */}
              <button
                onClick={() => handleNavClick('academic_evaluator')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-white/10 transition cursor-pointer"
                title="c) DMGT Set Partitions"
              >
                <Layers className="w-4 h-4 shrink-0 text-amber-300" />
                {!isCollapsed && <span>📐 c) DMGT Set Partitions</span>}
              </button>

              {/* d) Python ML Regression Studio */}
              <button
                onClick={() => handleNavClick('farmer_estimator')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'farmer_estimator'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-300 hover:bg-white/10'
                }`}
                title="d) Python ML Regression Studio"
              >
                <BrainCircuit className="w-4 h-4 shrink-0 text-emerald-300" />
                {!isCollapsed && <span>🤖 d) Python ML Studio</span>}
              </button>

              {/* Complete Code Artifacts */}
              <button
                onClick={() => handleNavClick('source_artifacts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentPage === 'source_artifacts'
                    ? 'bg-[#2D6A4F] text-[#E9C46A] shadow-xs font-bold'
                    : 'text-stone-300 hover:bg-white/10'
                }`}
                title="Complete Code Artifacts"
              >
                <Code2 className="w-4 h-4 shrink-0 text-[#E9C46A]" />
                {!isCollapsed && <span>📦 Source Code Artifacts</span>}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#2D6A4F] bg-[#143326] text-center">
          {!isCollapsed ? (
            <div className="text-[10px] text-stone-400 leading-tight">
              3-Role Architecture &bull; <span className="text-[#E9C46A] font-semibold">INR (₹) Standard</span>
            </div>
          ) : (
            <span className="text-xs">🇮🇳</span>
          )}
        </div>
      </aside>
    </>
  );
};
