import React from 'react';
import { CropListing, Crop, MarketZone, LanguageCode } from '../types';
import { CROP_ICONS } from '../data/initialData';
import { CROP_IMAGE_MAP, DEFAULT_CROP_IMAGE } from '../data/cropImages';
import { t } from '../utils/translations';
import { 
  Heart, 
  X, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  MapPin, 
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  listings: CropListing[];
  crops: Crop[];
  zones: MarketZone[];
  language: LanguageCode;
  onRemoveFromWishlist: (listingId: string) => void;
  onMoveToCart: (listing: CropListing, quantityKg: number) => void;
  onOpenDetails: (listing: CropListing) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  listings,
  crops,
  zones,
  language,
  onRemoveFromWishlist,
  onMoveToCart,
  onOpenDetails,
}) => {
  if (!isOpen) return null;

  const wishlistedListings = listings.filter((l) => wishlistIds.includes(l.listingId));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="bg-[#1B4332] text-white p-4 flex items-center justify-between border-b-2 border-[#E9C46A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-300/40 flex items-center justify-center text-red-400">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>{t('wishlist', language)}</span>
                  <span className="text-xs bg-[#E9C46A] text-[#1B4332] font-extrabold px-2 py-0.5 rounded-full">
                    {wishlistedListings.length}
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-200">
                  Meesho & Flipkart Style Saved Produce
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA]">
            {wishlistedListings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-300 flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-700 text-base">{t('emptyWishlist', language)}</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Tap the ❤️ icon on any crop card in the catalog to save it for quick future purchases.
                  </p>
                </div>
              </div>
            ) : (
              wishlistedListings.map((listing) => {
                const crop = crops.find((c) => c.cropId === listing.cropId);
                const zone = zones.find((z) => z.zoneId === listing.zoneId);
                const cropIcon = CROP_ICONS[listing.cropId] || '🌾';
                const askingPerKg = listing.askingPricePerKg || Math.round(listing.askingPricePerQuintal / 100);
                const stockKg = listing.quantityAvailableKg || (listing.quantityQuintals * 100);

                return (
                  <div
                    key={listing.listingId}
                    className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={CROP_IMAGE_MAP[listing.cropId] || DEFAULT_CROP_IMAGE}
                          alt={crop?.cropName || 'Crop'}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 shadow-inner"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_CROP_IMAGE;
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            {crop?.cropName || listing.cropId}
                            <span className="text-[10px] font-normal text-stone-500">
                              ({crop?.category || 'Harvest'})
                            </span>
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-stone-600 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{listing.farmerName || 'Verified Farmer'} &bull; {zone?.districtRegion || listing.zoneId}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFromWishlist(listing.listingId)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title={t('removeFromCart', language)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Stock Row */}
                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {t('mandiMarketRate', language)}
                        </span>
                        <span className="text-base font-extrabold text-[#1B4332]">
                          ₹{askingPerKg} <span className="text-[11px] font-normal text-stone-600">/ kg</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {t('inStockQuantity', language)}
                        </span>
                        <span className="font-bold text-stone-800">
                          {stockKg.toLocaleString('en-IN')} kg
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onMoveToCart(listing, 50); // Default 50 kg
                          onRemoveFromWishlist(listing.listingId);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title={t('tooltipAddToCart', language)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t('moveToCart', language)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenDetails(listing);
                          onClose();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-stone-300 hover:border-[#2D6A4F] text-stone-700 hover:text-[#1B4332] text-xs font-semibold bg-white transition cursor-pointer"
                        title={t('tooltipViewDetails', language)}
                      >
                        <span>{t('viewDetails', language)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlistedListings.length > 0 && (
            <div className="p-3 bg-stone-100 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Instant single-click purchase available</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
