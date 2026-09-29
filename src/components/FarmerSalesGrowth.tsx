import React from 'react';
import { TrendingUp, DollarSign, PackageCheck, Award, ArrowUpRight, Calendar, BarChart3 } from 'lucide-react';
import { UserProfile } from '../types';

interface FarmerSalesGrowthProps {
  userProfile: UserProfile;
}

export const FarmerSalesGrowth: React.FC<FarmerSalesGrowthProps> = ({ userProfile }) => {
  const salesMetrics = [
    { label: 'Total Realized Revenue', value: '₹2,84,500', change: '+18.4% this season', icon: DollarSign, positive: true },
    { label: 'Harvest Lots Cleared', value: '28 Lots', change: '100% Mandi clearance', icon: PackageCheck, positive: true },
    { label: 'Dispatched Volume', value: '1,420 Quintals', change: '142 metric tons', icon: TrendingUp, positive: true },
    { label: 'Realized vs Govt MSP', value: '+12.6%', change: 'Above AP MSP Benchmark', icon: Award, positive: true },
  ];

  const monthlySales = [
    { month: 'Apr', revenue: 28000, quintals: 140 },
    { month: 'May', revenue: 35000, quintals: 175 },
    { month: 'Jun', revenue: 42000, quintals: 210 },
    { month: 'Jul', revenue: 38000, quintals: 190 },
    { month: 'Aug', revenue: 65000, quintals: 325 },
    { month: 'Sep (Current)', revenue: 76500, quintals: 380 },
  ];

  const cropWiseDistribution = [
    { crop: 'Guntur Red Chilli', share: 58, revenue: '₹1,65,010', icon: '🌶️' },
    { crop: 'Paddy (BPT 5204)', share: 24, revenue: '₹68,280', icon: '🌾' },
    { crop: 'Cotton (Kharif)', share: 12, revenue: '₹34,140', icon: '🧶' },
    { crop: 'Groundnut & Pulses', share: 6, revenue: '₹17,070', icon: '🥜' },
  ];

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 text-white shadow-xs border-b-2 border-[#E9C46A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#E9C46A] mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>APMC Farmer Economic Intelligence</span>
            </div>
            <h2 className="text-2xl font-bold">Producer Sales Growth & Income Realization</h2>
            <p className="text-xs text-stone-200 mt-1">
              Active Farmer: <strong>{userProfile.name}</strong> &bull; Regional Mandi: <strong>{userProfile.districtId}</strong>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] text-[#E9C46A] block">2026 Kharif Target</span>
            <span className="text-xl font-mono font-bold">₹3,50,000</span>
            <span className="text-[10px] text-emerald-200 block">81.2% achieved</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesMetrics.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-[#E2DAC5] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500">{kpi.label}</span>
                <div className="p-2 bg-[#FAF7EE] rounded-lg text-[#2D6A4F]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-[#1B4332]">{kpi.value}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2DAC5] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-[#1B4332]">Monthly Sales Growth (INR ₹)</h3>
              <p className="text-xs text-stone-500">Mandi receipts deposited to APMC Escrow Account</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-semibold bg-[#FAF7EE] px-3 py-1.5 rounded-lg border border-[#E2DAC5]">
              <Calendar className="w-3.5 h-3.5" />
              <span>FY 2026-27</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-4">
            {monthlySales.map((item, idx) => {
              const heightPct = (item.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-stone-600 opacity-0 group-hover:opacity-100 transition">
                    ₹{(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full bg-[#FAF7EE] rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:brightness-95"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] to-[#2D6A4F] rounded-t-lg" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E2DAC5] flex items-center justify-between text-xs text-[#52796F]">
            <span>Average Realization per Quintal: <strong>₹2,003.50</strong></span>
            <span>Direct Bank Settlement via <strong>e-NAM Clearing</strong></span>
          </div>
        </div>

        {/* Commodity Revenue Share */}
        <div className="bg-white border border-[#E2DAC5] rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-sm text-[#1B4332] mb-1">Crop Revenue Distribution</h3>
          <p className="text-xs text-stone-500 mb-4">Earnings breakdown by Andhra Pradesh crop</p>

          <div className="space-y-4">
            {cropWiseDistribution.map((crop, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                    <span>{crop.icon}</span>
                    <span>{crop.crop}</span>
                  </span>
                  <span className="font-mono font-semibold text-stone-700">{crop.revenue}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2D6A4F] rounded-full"
                    style={{ width: `${crop.share}%` }}
                  />
                </div>
                <div className="text-[10px] text-right text-stone-400 font-mono">
                  {crop.share}% of total earnings
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3.5 bg-[#FAF7EE] border border-[#E2DAC5] rounded-xl text-xs text-stone-700">
            <span className="font-bold text-[#1B4332] block mb-1">💡 Agronomist Recommendation:</span>
            High demand for export-grade chilli in East Godavari & Vizag indicates strong upside. Consider holding remaining stock for post-monsoon auction.
          </div>
        </div>
      </div>
    </div>
  );
};
