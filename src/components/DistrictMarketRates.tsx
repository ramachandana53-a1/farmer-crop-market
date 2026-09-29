import React, { useState, useMemo } from 'react';
import { MarketZone, CropListing, Crop } from '../types';
import { CROP_ICONS } from '../data/initialData';
import { 
  TrendingUp, 
  MapPin, 
  Layers, 
  Scale, 
  ArrowUpRight, 
  BarChart3, 
  Sparkles,
  Info,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface DistrictMarketRatesProps {
  zones: MarketZone[];
  listings: CropListing[];
  crops: Crop[];
  onSelectZoneForRoute?: (zoneId: string) => void;
}

export const DistrictMarketRates: React.FC<DistrictMarketRatesProps> = ({
  zones,
  listings,
  crops,
  onSelectZoneForRoute,
}) => {
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');

  // Compute DMGT Equivalence Class Grouping: [Zone_ID] = { listing ∈ Listings | listing.zone_id = Zone_ID }
  const districtAnalytics = useMemo(() => {
    return zones.map((zone) => {
      const zoneListings = listings.filter((l) => {
        const matchesZone = l.zoneId === zone.zoneId;
        const matchesCrop = selectedCropFilter === 'ALL' || l.cropId === selectedCropFilter;
        return matchesZone && matchesCrop;
      });

      const totalLots = zoneListings.length;
      const totalQuintals = zoneListings.reduce((sum, l) => sum + (l.quantityQuintals ?? (l.quantityTons ?? 0) * 10), 0);
      
      const avgAskingPrice = totalLots > 0
        ? Math.round(zoneListings.reduce((sum, l) => sum + (l.askingPricePerQuintal ?? l.askingPricePerTon ?? 0), 0) / totalLots)
        : 0;

      const avgPredictedPrice = totalLots > 0
        ? Math.round(zoneListings.reduce((sum, l) => sum + (l.mlPredictedPricePerQuintal ?? l.mlPredictedPricePerTon ?? 0), 0) / totalLots)
        : 0;

      const priceVariance = avgAskingPrice - avgPredictedPrice;
      const priceVariancePct = avgPredictedPrice > 0 ? Math.round((priceVariance / avgPredictedPrice) * 1000) / 10 : 0;

      // Available unique crops in this district
      const availableCropIds = Array.from(new Set(zoneListings.map((l) => l.cropId)));

      return {
        zone,
        totalLots,
        totalQuintals,
        avgAskingPrice,
        avgPredictedPrice,
        priceVariance,
        priceVariancePct,
        availableCropIds,
        listings: zoneListings,
      };
    });
  }, [zones, listings, selectedCropFilter]);

  const overallStats = useMemo(() => {
    const activeListings = selectedCropFilter === 'ALL' 
      ? listings 
      : listings.filter(l => l.cropId === selectedCropFilter);
    
    const totalVolumeQ = activeListings.reduce((sum, l) => sum + (l.quantityQuintals ?? (l.quantityTons ?? 0) * 10), 0);
    const avgPrice = activeListings.length > 0
      ? Math.round(activeListings.reduce((sum, l) => sum + (l.askingPricePerQuintal ?? l.askingPricePerTon ?? 0), 0) / activeListings.length)
      : 0;
    return { totalVolumeQ, avgPrice, totalActive: activeListings.length };
  }, [listings, selectedCropFilter]);

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">📈</span>
            <h2 className="text-base font-bold text-[#1B4332]">
              Pan-India Interstate APMC Mandi Market Rates
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E9C46A]/50 text-[#1B4332] border border-[#E9C46A]">
              DMGT Equivalence Classes by Zone_ID
            </span>
          </div>
          <p className="text-xs text-[#40534C] mt-1">
            Aggregated mandi spot rates, arrival volumes, and machine learning price benchmarks across interstate trade terminals in India.
          </p>
        </div>

        {/* Crop Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCropFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedCropFilter === 'ALL'
                ? 'bg-[#2D6A4F] text-white shadow-xs'
                : 'bg-white text-[#40534C] border border-[#E2DAC5] hover:bg-[#F4F1DE]'
            }`}
          >
            All Crops
          </button>
          {crops.map((c) => (
            <button
              key={c.cropId}
              onClick={() => setSelectedCropFilter(c.cropId)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCropFilter === c.cropId
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-white text-[#40534C] border border-[#E2DAC5] hover:bg-[#F4F1DE]'
              }`}
            >
              <span>{CROP_ICONS[c.cropId] || '🌱'}</span>
              <span>{c.cropName.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* State-Wide Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center text-xl shrink-0 text-[#2D6A4F]">
            📊
          </div>
          <div>
            <div className="text-[11px] text-[#52796F] font-bold uppercase tracking-wider">
              National Average Price
            </div>
            <div className="text-xl font-bold font-mono text-[#1B4332]">
              ₹{overallStats.avgPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#52796F]">/quintal</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E9C46A]/30 flex items-center justify-center text-xl shrink-0 text-[#B7860B]">
            🌾
          </div>
          <div>
            <div className="text-[11px] text-[#52796F] font-bold uppercase tracking-wider">
              Total National Inventory
            </div>
            <div className="text-xl font-bold font-mono text-[#1B4332]">
              {overallStats.totalVolumeQ.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#52796F]">Quintals</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#264653]/10 flex items-center justify-center text-xl shrink-0 text-[#264653]">
            🏛️
          </div>
          <div>
            <div className="text-[11px] text-[#52796F] font-bold uppercase tracking-wider">
              Monitored Mandi Hubs
            </div>
            <div className="text-xl font-bold font-mono text-[#1B4332]">
              {zones.length} Mandis <span className="text-xs font-normal text-[#52796F]">({overallStats.totalActive} active lots)</span>
            </div>
          </div>
        </div>
      </div>

      {/* District Mandi Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {districtAnalytics.map((item) => {
          const { zone, totalLots, totalQuintals, avgAskingPrice, avgPredictedPrice, priceVariancePct, availableCropIds } = item;
          const isFair = Math.abs(priceVariancePct) <= 3;
          const isAbove = priceVariancePct > 3;

          return (
            <div
              key={zone.zoneId}
              className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* District Zone Title */}
                <div className="flex items-start justify-between gap-2 border-b border-[#E2DAC5] pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                        {zone.zoneId}
                      </span>
                      <span className="text-xs font-bold text-[#52796F]">{zone.districtRegion}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1B4332] mt-1 line-clamp-1">
                      {zone.zoneName}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#2D6A4F]">
                      {totalLots} {totalLots === 1 ? 'Lot' : 'Lots'}
                    </span>
                  </div>
                </div>

                {/* Rates & Analytics */}
                <div className="py-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52796F]">Average Mandi Rate:</span>
                    <span className="font-mono font-bold text-sm text-[#1B4332]">
                      {avgAskingPrice > 0 ? `₹${avgAskingPrice.toLocaleString('en-IN')}/q` : 'No active lots'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52796F]">Expected Market Value (ML):</span>
                    <span className="font-mono font-bold text-xs text-[#2D6A4F]">
                      {avgPredictedPrice > 0 ? `₹${avgPredictedPrice.toLocaleString('en-IN')}/q` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52796F]">Price Alignment:</span>
                    {totalLots > 0 ? (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isFair
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAbove
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isFair ? 'Fairly Priced' : isAbove ? `+${priceVariancePct}% Premium` : `${priceVariancePct}% Discount`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2DAC5]/50">
                    <span className="text-xs text-[#52796F]">Available Arrival Volume:</span>
                    <span className="font-mono font-bold text-xs text-[#1B4332]">
                      {totalQuintals.toLocaleString('en-IN')} Quintals
                    </span>
                  </div>

                  {/* Available crop icons in this district */}
                  <div className="pt-2">
                    <span className="text-[11px] text-[#52796F] block mb-1">Crops in Stock:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableCropIds.length > 0 ? (
                        availableCropIds.map((cid) => {
                          const cropObj = crops.find(c => c.cropId === cid);
                          return (
                            <span
                              key={cid}
                              className="text-xs bg-[#FAF7EE] border border-[#E2DAC5] px-2 py-0.5 rounded-lg flex items-center gap-1 text-[#1B4332] font-medium"
                              title={cropObj?.cropName}
                            >
                              <span>{CROP_ICONS[cid] || '🌾'}</span>
                              <span>{cropObj?.cropName.split(' ')[0]}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">No lots currently active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onSelectZoneForRoute && (
                <button
                  onClick={() => onSelectZoneForRoute(zone.zoneId)}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-[#FAF7EE] hover:bg-[#2D6A4F] text-[#2D6A4F] hover:text-white border border-[#E2DAC5] hover:border-[#2D6A4F] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Route Transport to {zone.districtRegion.replace(' District', '')}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Discrete Mathematics (DMGT) Set Theory Equivalence Box */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📐</span>
          <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
            DMGT Mathematical Formalism: Set Theory Equivalence Relation by Zone_ID
          </h3>
        </div>
        <p className="text-xs text-[#40534C] leading-relaxed">
          In Discrete Mathematics, crop listings are partitioned into non-overlapping equivalence classes via the equivalence relation 
          <code className="bg-white px-2 py-0.5 mx-1 rounded font-mono text-[#2D6A4F] border border-[#E2DAC5]">R = {'{(a, b) ∈ Listings × Listings | a.zone_id = b.zone_id}'}</code>. 
          The quotient set <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#2D6A4F] border border-[#E2DAC5]">Listings / R</code> guarantees 
          that each farmer crop lot belongs strictly to exactly one Andhra Pradesh district mandi yard, satisfying Reflexivity, Symmetry, and Transitivity.
        </p>
      </div>
    </div>
  );
};
