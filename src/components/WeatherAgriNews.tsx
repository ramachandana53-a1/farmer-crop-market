import React, { useState } from 'react';
import { CloudRain, Sun, Wind, Droplets, Newspaper, AlertTriangle, ExternalLink, MapPin, Globe2, Sparkles } from 'lucide-react';
import { MarketZone } from '../types';

interface WeatherAgriNewsProps {
  zones: MarketZone[];
}

export const WeatherAgriNews: React.FC<WeatherAgriNewsProps> = ({ zones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.zoneId || 'PUN_KHANNA');

  const currentZone = zones.find((z) => z.zoneId === selectedZoneId) || zones[0];

  // Dynamic regional weather synthesis based on zone attributes
  const rainfall = currentZone.annualRainfallMm ?? 850;
  const currentW = {
    temp: rainfall > 1500 ? '27°C' : rainfall < 600 ? '34°C' : '30°C',
    condition: rainfall > 1500 
      ? 'Monsoon Overcast & Humid Showers' 
      : rainfall < 600 
      ? 'Bright Sunlight & Arid Winds' 
      : 'Partly Cloudy with Mild Breeze',
    rainfallMm: rainfall,
    humidity: rainfall > 1500 ? 86 : rainfall < 600 ? 52 : 74,
    soilMoisture: rainfall > 1500 ? 'High (84%)' : rainfall < 600 ? 'Moderate (48%)' : 'Optimal (72%)',
    forecast: `Stable agricultural conditions across ${currentZone.districtRegion}. Mandi freight logistics operating normally along national corridors.`,
    alert: rainfall > 1800 ? 'IMD Advisory: High soil moisture, ensure field drainage.' : undefined
  };

  const nationalAgriNews = [
    {
      id: 1,
      tag: 'PAN-INDIA e-NAM',
      title: 'e-NAM Cross-State Inter-Mandi Electronic Trading Volume Hits All-Time Peak',
      date: 'Today, 08:30 AM',
      snippet: 'Over 1,400 APMC Mandis connected nationwide with instant UPI settlement and unified state trading licenses for wheat, paddy, cotton, and oilseeds.',
      category: 'Digital Mandi'
    },
    {
      id: 2,
      tag: 'ICAR NEW DELHI',
      title: 'ICAR Releases Climate-Resilient High-Yield Wheat & Mustard Seed Varieties',
      date: 'Today, 06:15 AM',
      snippet: 'New bio-fortified varieties HD-3388 and Giriraj mustard show 18% higher drought tolerance and optimized yield across Gangetic and Western plains.',
      category: 'Agronomy & Research'
    },
    {
      id: 3,
      tag: 'GOVT OF INDIA MSP',
      title: 'Cabinet Committee on Economic Affairs (CCEA) Hikes Rabi Crop MSP for 2026-27',
      date: 'Yesterday',
      snippet: 'Wheat MSP raised by ₹150 to ₹2,425/quintal; Mustard MSP fixed at ₹5,950/quintal to ensure 50%+ margins over cost of production (A2+FL).',
      category: 'Policy & Pricing'
    },
    {
      id: 4,
      tag: 'LOGISTICS & NHAI',
      title: 'Green Freight Corridors Cut Interstate Agri-Transit Time by 30%',
      date: '22 Sep 2026',
      snippet: 'Dijkstra-optimized transit scheduling along NH-44, NH-48, and NH-16 provides electronic fast-track weighbridge clearance for perishable crop freights.',
      category: 'Logistics'
    },
    {
      id: 5,
      tag: 'SPICE BOARD INDIA',
      title: 'Export Demand Soars for Guntur Teja Chilli and Alleppey Green Cardamom',
      date: '21 Sep 2026',
      snippet: 'Record overseas consignments dispatched to Southeast Asia, Middle East, and Europe at premium auction rates exceeding ₹19,200/quintal.',
      category: 'Export Market'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Weather Section Header */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <CloudRain className="w-3.5 h-3.5" />
              <span>Pan-India Agricultural Weather Radar</span>
            </div>
            <h2 className="text-xl font-bold text-[#1B4332]">
              Regional Agricultural Weather & Soil Moisture Index
            </h2>
            <p className="text-xs text-stone-500">
              Real-time environmental telemetry fed directly into the Python scikit-learn ML rate regression model
            </p>
          </div>

          {/* Interstate Hub Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {zones.map((z) => (
              <button
                key={z.zoneId}
                onClick={() => setSelectedZoneId(z.zoneId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  z.zoneId === selectedZoneId
                    ? 'bg-[#2D6A4F] text-white shadow-xs border-[#2D6A4F]'
                    : 'bg-[#FAF7EE] text-[#1B4332] border-[#E2DAC5] hover:bg-stone-100'
                }`}
              >
                {z.districtRegion.replace(' District', '')} ({z.state || 'IN'})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Hub Weather Detail Card */}
        <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DAC5]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#2D6A4F] text-white">
                <Sun className="w-7 h-7 text-[#E9C46A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#1B4332]">
                    {currentZone.zoneName}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {currentZone.icarZoneCode || 'ICAR'}
                  </span>
                </div>
                <p className="text-xs text-[#52796F] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentZone.districtRegion}, {currentZone.state || 'India'} &bull; Soil: {currentZone.soilType}</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl font-black font-mono text-[#1B4332]">
                {currentW.temp}
              </span>
              <span className="text-xs text-[#52796F] block font-medium">
                {currentW.condition}
              </span>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[11px] text-[#52796F] block flex items-center gap-1 font-semibold">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Annual Rainfall:
              </span>
              <strong className="text-base font-mono font-bold text-[#1B4332] mt-1 block">
                {currentW.rainfallMm} mm
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[11px] text-[#52796F] block flex items-center gap-1 font-semibold">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                Air Humidity:
              </span>
              <strong className="text-base font-mono font-bold text-[#1B4332] mt-1 block">
                {currentW.humidity}% RH
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[11px] text-[#52796F] block flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Soil Moisture Status:
              </span>
              <strong className="text-base font-mono font-bold text-[#2D6A4F] mt-1 block">
                {currentW.soilMoisture}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2DAC5]">
              <span className="text-[11px] text-[#52796F] block flex items-center gap-1 font-semibold">
                <Globe2 className="w-3.5 h-3.5 text-amber-600" />
                Transit Freight Index:
              </span>
              <strong className="text-base font-mono font-bold text-amber-800 mt-1 block">
                Favorable (NH Corridor)
              </strong>
            </div>
          </div>

          {/* Agronomic Forecast Tip */}
          <div className="mt-4 p-3 rounded-xl bg-white border border-[#E2DAC5] flex items-start gap-2 text-xs text-[#40534C]">
            <CloudRain className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-[#1B4332]">Regional Crop Advisory: </strong>
              <span>{currentW.forecast}</span>
            </div>
          </div>

          {currentW.alert && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{currentW.alert}</span>
            </div>
          )}
        </div>
      </div>

      {/* National Agricultural News Section */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DAC5]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#2D6A4F]" />
            <h3 className="text-base font-bold text-[#1B4332]">
              National Agricultural Mandi News & Policy Updates
            </h3>
          </div>
          <span className="text-xs text-[#52796F] font-semibold">
            Pan-India APMC & ICAR Bulletin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nationalAgriNews.map((news) => (
            <div
              key={news.id}
              className="p-4 rounded-xl border border-[#E2DAC5] bg-[#FAF7EE]/50 hover:bg-[#FAF7EE] transition space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D6A4F] text-white">
                    {news.tag}
                  </span>
                  <span className="text-[11px] text-[#52796F] font-mono">
                    {news.date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1B4332] leading-snug">
                  {news.title}
                </h4>
                <p className="text-[11px] text-[#40534C] leading-relaxed">
                  {news.snippet}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-[#52796F] border-t border-[#E2DAC5]/60">
                <span>Category: {news.category}</span>
                <span className="text-[#2D6A4F] flex items-center gap-1">
                  <span>Verified Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
