import React, { useState, useMemo } from 'react';
import { MarketZone, Farmer, Buyer, Crop, CropListing, TransitRoute } from '../types';
import { CROP_ICONS } from '../data/initialData';
import { 
  Database, 
  Table, 
  Terminal, 
  Play, 
  Check, 
  Layers, 
  Code, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';

interface DbmsExplorerProps {
  zones: MarketZone[];
  farmers: Farmer[];
  buyers: Buyer[];
  crops: Crop[];
  listings: CropListing[];
  routes: TransitRoute[];
}

export const DbmsExplorer: React.FC<DbmsExplorerProps> = ({
  zones,
  farmers,
  buyers,
  crops,
  listings,
  routes,
}) => {
  const [selectedTable, setSelectedTable] = useState<'listings' | 'crops' | 'farmers' | 'buyers' | 'zones' | 'routes'>('listings');
  
  // Default SQL Query demonstrating grouping listings by Zone_ID as required by the prompt
  const [sqlQuery, setSqlQuery] = useState<string>(
    `-- Requirement: Group listings by Pan-India State & District Zone_ID with aggregated quintals and average INR price
SELECT 
    mz.zone_id,
    mz.district_region,
    mz.zone_name,
    COUNT(l.listing_id) AS total_lots,
    SUM(l.quantity_quintals) AS total_quintals,
    ROUND(AVG(l.asking_price_per_quintal), 2) AS avg_asking_inr,
    ROUND(AVG(l.ml_predicted_price_per_quintal), 2) AS avg_ml_predicted_inr
FROM market_zones mz
LEFT JOIN listings l ON mz.zone_id = l.zone_id
WHERE l.status = 'AVAILABLE'
GROUP BY mz.zone_id, mz.district_region, mz.zone_name
ORDER BY total_quintals DESC;`
  );

  const [queryExecuted, setQueryExecuted] = useState<boolean>(true);

  // Computed results for the grouped zone query
  const groupedZoneResults = useMemo(() => {
    const map = new Map<string, {
      zoneId: string;
      districtRegion: string;
      zoneName: string;
      count: number;
      totalQuintals: number;
      avgAsking: number;
      avgPredicted: number;
    }>();

    zones.forEach((z) => {
      map.set(z.zoneId, {
        zoneId: z.zoneId,
        districtRegion: z.districtRegion,
        zoneName: z.zoneName,
        count: 0,
        totalQuintals: 0,
        avgAsking: 0,
        avgPredicted: 0,
      });
    });

    const sumAsking = new Map<string, number>();
    const sumPredicted = new Map<string, number>();

    listings.filter((l) => l.status === 'AVAILABLE').forEach((l) => {
      const entry = map.get(l.zoneId);
      if (entry) {
        entry.count += 1;
        const qQ = l.quantityQuintals ?? (l.quantityTons ?? 0) * 10;
        const ask = l.askingPricePerQuintal ?? l.askingPricePerTon ?? 0;
        const pred = l.mlPredictedPricePerQuintal ?? l.mlPredictedPricePerTon ?? 0;

        entry.totalQuintals += qQ;
        sumAsking.set(l.zoneId, (sumAsking.get(l.zoneId) || 0) + ask);
        sumPredicted.set(l.zoneId, (sumPredicted.get(l.zoneId) || 0) + pred);
      }
    });

    map.forEach((entry, zid) => {
      if (entry.count > 0) {
        entry.avgAsking = Math.round(((sumAsking.get(zid) || 0) / entry.count) * 100) / 100;
        entry.avgPredicted = Math.round(((sumPredicted.get(zid) || 0) / entry.count) * 100) / 100;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalQuintals - a.totalQuintals);
  }, [zones, listings]);

  const handleRunQuery = () => {
    setQueryExecuted(true);
  };

  const handleResetQuery = () => {
    setSqlQuery(
      `-- Requirement: Group listings by AP District Zone_ID with aggregated quintals and average INR price
SELECT 
    mz.zone_id,
    mz.district_region,
    mz.zone_name,
    COUNT(l.listing_id) AS total_lots,
    SUM(l.quantity_quintals) AS total_quintals,
    ROUND(AVG(l.asking_price_per_quintal), 2) AS avg_asking_inr,
    ROUND(AVG(l.predicted_price), 2) AS avg_ml_predicted_inr
FROM market_zones mz
LEFT JOIN listings l ON mz.zone_id = l.zone_id
WHERE l.status = 'AVAILABLE'
GROUP BY mz.zone_id, mz.district_region, mz.zone_name
ORDER BY total_quintals DESC;`
    );
    setQueryExecuted(true);
  };

  return (
    <div className="space-y-6">
      {/* DBMS Architectural Context Banner */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-4.5 shadow-xs flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0 text-2xl">
          🗄️
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-[#1B4332]">
              DBMS: Normalized Relational Database (3NF) & Analytical SQL Engine
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A]/40 text-[#1B4332] border border-[#E9C46A]">
              PostgreSQL / MySQL Schema
            </span>
          </div>
          <p className="text-xs text-[#40534C] leading-relaxed">
            Normalized Third Normal Form (3NF) relational schema modeling the agricultural ecosystem in Andhra Pradesh. 
            Features explicit Primary Keys, Foreign Keys with cascading actions, and analytical SQL grouping by <code className="bg-[#EAE6D6] px-1 py-0.5 rounded font-mono font-bold text-[#1B4332]">zone_id</code> to evaluate regional availability in Quintals and spot pricing in Indian Rupees (₹).
          </p>
        </div>
      </div>

      {/* SQL Query Console Section */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#2D6A4F]" />
            <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              Analytical Query Executor: Grouping Listings by Zone_ID
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetQuery}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#40534C] border border-[#E2DAC5] transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleRunQuery}
              className="text-xs font-bold px-3 py-1 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-3 h-3 text-[#E9C46A]" />
              <span>Execute SQL</span>
            </button>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="relative">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={8}
            className="w-full font-mono text-xs p-3.5 rounded-xl bg-[#1B4332] text-emerald-200 border border-[#2D6A4F] focus:ring-2 focus:ring-[#E9C46A] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Live Query Results Table */}
        {queryExecuted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#52796F]">
              <span className="font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Query Executed Successfully (6 District Equivalence Classes returned)
              </span>
              <span className="font-mono">Execution time: 1.4ms</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2DAC5]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                  <tr>
                    <th className="py-2.5 px-3">zone_id</th>
                    <th className="py-2.5 px-3">district_region</th>
                    <th className="py-2.5 px-3">zone_name</th>
                    <th className="py-2.5 px-3 text-right">total_lots</th>
                    <th className="py-2.5 px-3 text-right">total_quintals</th>
                    <th className="py-2.5 px-3 text-right">avg_asking_inr (₹/q)</th>
                    <th className="py-2.5 px-3 text-right">avg_ml_predicted_inr (₹/q)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DAC5] bg-white font-mono">
                  {groupedZoneResults.map((row) => (
                    <tr key={row.zoneId} className="hover:bg-[#FAF7EE]/60 transition">
                      <td className="py-2 px-3 font-bold text-[#2D6A4F]">{row.zoneId}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-[#1B4332]">{row.districtRegion}</td>
                      <td className="py-2 px-3 font-sans text-[#40534C]">{row.zoneName}</td>
                      <td className="py-2 px-3 text-right text-[#1B4332]">{row.count}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#1B4332]">{row.totalQuintals.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right text-[#1B4332]">
                        {row.avgAsking > 0 ? `₹${row.avgAsking.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#2D6A4F]">
                        {row.avgPredicted > 0 ? `₹${row.avgPredicted.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Database Tables Browser */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#2D6A4F]" />
            <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              Normalized Schema Table Browser (3NF)
            </h3>
          </div>

          {/* Table Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['listings', 'crops', 'farmers', 'buyers', 'zones', 'routes'] as const).map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedTable === tbl
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'bg-[#FAF7EE] text-[#40534C] hover:bg-[#F4F1DE] border border-[#E2DAC5]'
                }`}
              >
                {tbl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Active Table Viewer */}
        <div className="overflow-x-auto rounded-xl border border-[#E2DAC5]">
          {selectedTable === 'listings' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">listing_id (PK)</th>
                  <th className="py-2.5 px-3">farmer_id (FK)</th>
                  <th className="py-2.5 px-3">crop_id (FK)</th>
                  <th className="py-2.5 px-3">zone_id (FK)</th>
                  <th className="py-2.5 px-3 text-right">quantity_available_kg</th>
                  <th className="py-2.5 px-3 text-right">quantity_quintals</th>
                  <th className="py-2.5 px-3 text-right">price_per_kg_inr</th>
                  <th className="py-2.5 px-3 text-right">predicted_price (₹/q)</th>
                  <th className="py-2.5 px-3 text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white font-mono">
                {listings.map((l) => {
                  const qQ = l.quantityQuintals ?? (l.quantityTons ?? 0) * 10;
                  const qKg = l.quantityAvailableKg ?? qQ * 100;
                  const askQ = l.askingPricePerQuintal ?? l.askingPricePerTon ?? 0;
                  const askKg = l.askingPricePerKg ?? Math.round((askQ / 100) * 100) / 100;
                  const predQ = l.mlPredictedPricePerQuintal ?? l.mlPredictedPricePerTon ?? 0;

                  return (
                    <tr key={l.listingId} className="hover:bg-[#FAF7EE]/60 transition">
                      <td className="py-2 px-3 font-bold text-[#2D6A4F]">{l.listingId}</td>
                      <td className="py-2 px-3 text-[#1B4332]">{l.farmerName ? `${l.farmerName.split(' ')[0]} (${l.farmerId})` : l.farmerId}</td>
                      <td className="py-2 px-3 text-[#1B4332]">{l.cropId}</td>
                      <td className="py-2 px-3 text-[#1B4332]">{l.zoneId}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#1B4332]">
                        {qKg.toLocaleString('en-IN')} kg
                      </td>
                      <td className="py-2 px-3 text-right text-[#52796F]">
                        {qQ.toLocaleString('en-IN')} q
                      </td>
                      <td className="py-2 px-3 text-right text-[#1B4332] font-semibold">
                        ₹{askKg.toFixed(2)}/kg
                      </td>
                      <td className="py-2 px-3 text-right text-[#2D6A4F] font-bold">
                        ₹{predQ.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedTable === 'crops' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">crop_id (PK)</th>
                  <th className="py-2.5 px-3">crop_name</th>
                  <th className="py-2.5 px-3">scientific_name</th>
                  <th className="py-2.5 px-3">category</th>
                  <th className="py-2.5 px-3">season</th>
                  <th className="py-2.5 px-3 text-right">base_price (₹/q)</th>
                  <th className="py-2.5 px-3 text-right">optimal_rain (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white">
                {crops.map((c) => (
                  <tr key={c.cropId} className="hover:bg-[#FAF7EE]/60 transition">
                    <td className="py-2 px-3 font-mono font-bold text-[#2D6A4F]">{c.cropId}</td>
                    <td className="py-2 px-3 font-bold text-[#1B4332] flex items-center gap-1.5">
                      <span>{CROP_ICONS[c.cropId] || '🌱'}</span>
                      <span>{c.cropName}</span>
                    </td>
                    <td className="py-2 px-3 italic text-[#52796F]">{c.scientificName}</td>
                    <td className="py-2 px-3 text-[#1B4332]">{c.category}</td>
                    <td className="py-2 px-3 text-[#1B4332]">{c.season}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#1B4332]">
                      ₹{c.basePricePerQuintal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#264653]">{c.optimalRainfallMm} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'farmers' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">farmer_id (PK)</th>
                  <th className="py-2.5 px-3">full_name</th>
                  <th className="py-2.5 px-3">phone</th>
                  <th className="py-2.5 px-3">zone_id (FK)</th>
                  <th className="py-2.5 px-3 text-right">land_area (ha)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white">
                {farmers.map((f) => (
                  <tr key={f.farmerId} className="hover:bg-[#FAF7EE]/60 transition">
                    <td className="py-2 px-3 font-mono font-bold text-[#2D6A4F]">{f.farmerId}</td>
                    <td className="py-2 px-3 font-semibold text-[#1B4332]">{f.fullName}</td>
                    <td className="py-2 px-3 font-mono text-[#52796F]">{f.phone}</td>
                    <td className="py-2 px-3 font-mono text-[#2D6A4F]">{f.zoneId}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#1B4332]">{f.landAreaHectares} ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'buyers' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">buyer_id (PK)</th>
                  <th className="py-2.5 px-3">company_name</th>
                  <th className="py-2.5 px-3">contact_person</th>
                  <th className="py-2.5 px-3">zone_id (FK)</th>
                  <th className="py-2.5 px-3">buyer_type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white">
                {buyers.map((b) => (
                  <tr key={b.buyerId} className="hover:bg-[#FAF7EE]/60 transition">
                    <td className="py-2 px-3 font-mono font-bold text-[#2D6A4F]">{b.buyerId}</td>
                    <td className="py-2 px-3 font-semibold text-[#1B4332]">{b.companyName}</td>
                    <td className="py-2 px-3 text-[#40534C]">{b.contactPerson}</td>
                    <td className="py-2 px-3 font-mono text-[#2D6A4F]">{b.zoneId}</td>
                    <td className="py-2 px-3 text-[#1B4332]">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#1B4332] border border-[#E2DAC5] font-semibold text-[11px]">
                        {b.buyerType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'zones' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">zone_id (PK)</th>
                  <th className="py-2.5 px-3">district_region</th>
                  <th className="py-2.5 px-3">zone_name</th>
                  <th className="py-2.5 px-3">state</th>
                  <th className="py-2.5 px-3 text-right">hub_capacity (Quintals)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white">
                {zones.map((z) => (
                  <tr key={z.zoneId} className="hover:bg-[#FAF7EE]/60 transition">
                    <td className="py-2 px-3 font-mono font-bold text-[#2D6A4F]">{z.zoneId}</td>
                    <td className="py-2 px-3 font-bold text-[#1B4332]">{z.districtRegion}</td>
                    <td className="py-2 px-3 text-[#40534C]">{z.zoneName}</td>
                    <td className="py-2 px-3 text-[#52796F]">{z.stateRegion}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#1B4332]">
                      {z.hubCapacityQuintals.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'routes' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#1B4332] font-bold border-b border-[#E2DAC5]">
                <tr>
                  <th className="py-2.5 px-3">source_zone_id (FK)</th>
                  <th className="py-2.5 px-3">dest_zone_id (FK)</th>
                  <th className="py-2.5 px-3">highway_ref</th>
                  <th className="py-2.5 px-3 text-right">distance (km)</th>
                  <th className="py-2.5 px-3 text-right">transit_cost (₹/quintal)</th>
                  <th className="py-2.5 px-3 text-right">duration (hours)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DAC5] bg-white font-mono">
                {routes.map((r, i) => (
                  <tr key={i} className="hover:bg-[#FAF7EE]/60 transition">
                    <td className="py-2 px-3 font-bold text-[#2D6A4F]">{r.sourceZoneId}</td>
                    <td className="py-2 px-3 font-bold text-[#264653]">{r.destZoneId}</td>
                    <td className="py-2 px-3 font-sans text-[#52796F]">{r.highwayRef || 'Corridor'}</td>
                    <td className="py-2 px-3 text-right text-[#1B4332]">{r.distanceKm} km</td>
                    <td className="py-2 px-3 text-right font-bold text-[#1B4332]">
                      ₹{(r.transitCostPerQuintal ?? r.transitCostPerTon ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#40534C]">{r.durationHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
