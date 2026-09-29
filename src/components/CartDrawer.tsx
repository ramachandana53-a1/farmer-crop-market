import React from 'react';
import { CartItem, MarketZone, LanguageCode } from '../types';
import { t } from '../utils/translations';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  zones: MarketZone[];
  language: LanguageCode;
  selectedDeliveryDistrictId: string;
  onChangeDeliveryDistrict: (zoneId: string) => void;
  onUpdateQuantity: (cartItemId: string, newQuantityKg: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onConsolidatedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  zones,
  language,
  selectedDeliveryDistrictId,
  onChangeDeliveryDistrict,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onConsolidatedCheckout,
}) => {
  if (!isOpen) return null;

  const totalProduceCost = cartItems.reduce((acc, item) => acc + item.produceCostInr, 0);
  const totalDeliveryFee = cartItems.reduce((acc, item) => acc + item.deliveryFeeInr, 0);
  const finalTotalPayable = totalProduceCost + totalDeliveryFee;
  const deliveryZone = zones.find((z) => z.zoneId === selectedDeliveryDistrictId) || zones[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="bg-[#1B4332] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#E9C46A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#E9C46A]/50 flex items-center justify-center text-[#E9C46A]">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>{t('cart', language)}</span>
                  <span className="text-xs bg-[#E9C46A] text-[#1B4332] font-extrabold px-2.5 py-0.5 rounded-full">
                    {cartItems.length} {t('itemsInCart', language)}
                  </span>
                </h2>
                <p className="text-xs text-emerald-200">
                  Meesho & Flipkart Single Consolidated Checkout
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Shopping Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Destination Selector Bar */}
          <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-emerald-950 block">
                  {t('deliveryAddress', language)}:
                </span>
                <span className="text-emerald-800 font-bold truncate">
                  {deliveryZone?.districtRegion || selectedDeliveryDistrictId}
                </span>
              </div>
            </div>

            <select
              value={selectedDeliveryDistrictId}
              onChange={(e) => onChangeDeliveryDistrict(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              title={t('tooltipDeliveryDistrict', language)}
            >
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.districtRegion} ({z.state})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-700 text-base">{t('emptyCart', language)}</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Your cart is currently empty. Explore the catalog and click &quot;Add to Cart&quot; on any crop card to place a bulk or retail order.
                  </p>
                </div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {item.cropIcon}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">
                          {item.cropName}
                        </h4>
                        <div className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{item.farmerName} &bull; {item.farmerDistrict}</span>
                        </div>
                        <div className="text-[11px] font-medium text-emerald-700 mt-0.5">
                          {t('mandiMarketRate', language)}: <strong>₹{item.unitPricePerKg}</strong> / kg
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title={t('removeFromCart', language)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Cost */}
                  <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-stone-600">{t('weightKg', language)}:</span>
                      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, Math.max(10, item.quantityKg - 10))}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                          title="Decrease 10 kg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantityKg}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) onUpdateQuantity(item.id, val);
                          }}
                          className="w-14 text-center font-bold text-stone-800 text-xs py-1 focus:outline-hidden"
                          min="10"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantityKg + 10)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                          title="Increase 10 kg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 uppercase block font-medium">
                        {t('produceCost', language)}
                      </span>
                      <span className="text-sm font-extrabold text-stone-900">
                        ₹{item.produceCostInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Fee Breakdown */}
                  <div className="flex items-center justify-between text-[11px] text-stone-600 border-t border-stone-100 pt-2 px-1">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('deliveryFee', language)} ({item.transitDistanceKm} km):</span>
                    </div>
                    <span className="font-semibold text-emerald-800">
                      ₹{item.deliveryFeeInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Bill Summary Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200 space-y-3.5 shadow-lg">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t('produceCost', language)} ({cartItems.length} crops):</span>
                  <span className="font-semibold text-stone-900">
                    ₹{totalProduceCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>{t('deliveryFee', language)} (Shortest Highway Corridor):</span>
                  </span>
                  <span className="font-semibold text-emerald-700">
                    ₹{totalDeliveryFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>APMC Mandi Inspection & Escrow Protection:</span>
                  <span className="font-semibold text-emerald-600">FREE (₹0)</span>
                </div>

                <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-stone-800 text-sm">
                    {t('finalTotalPayable', language)}:
                  </span>
                  <span className="text-xl font-extrabold text-[#1B4332]">
                    ₹{finalTotalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-semibold transition cursor-pointer"
                  title={t('clearCart', language)}
                >
                  {t('clearCart', language)}
                </button>

                <button
                  type="button"
                  onClick={onConsolidatedCheckout}
                  className="col-span-2 py-2.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  title={t('tooltipConsolidatedCheckout', language)}
                >
                  <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                  <span>{t('consolidatedCheckout', language)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>e-NAM / APMC Escrow Verified &bull; Real-time Farmer Notification</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
