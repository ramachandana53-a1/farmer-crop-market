import React from 'react';
import { 
  Download, 
  Database, 
  GitFork, 
  BrainCircuit, 
  Code2, 
  CheckCircle2,
  ShoppingCart,
  PlusCircle,
  Package,
  TrendingUp,
  Truck,
  Sparkles,
  MapPin,
  Layers
} from 'lucide-react';

export type MainRole = 'farmer' | 'buyer' | 'academic';
export type FarmerSubView = 'create_listing' | 'inventory' | 'estimator';
export type BuyerSubView = 'browse_crops' | 'district_rates' | 'transport_route';
export type AcademicSubView = 'dbms' | 'ml' | 'graph' | 'code';

interface HeaderProps {
  currentRole: MainRole;
  setCurrentRole: (role: MainRole) => void;
  farmerSubView: FarmerSubView;
  setFarmerSubView: (view: FarmerSubView) => void;
  buyerSubView: BuyerSubView;
  setBuyerSubView: (view: BuyerSubView) => void;
  academicSubView: AcademicSubView;
  setAcademicSubView: (view: AcademicSubView) => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  totalListingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  farmerSubView,
  setFarmerSubView,
  buyerSubView,
  setBuyerSubView,
  academicSubView,
  setAcademicSubView,
  onDownloadZip,
  isDownloading,
  totalListingsCount,
}) => {
  return (
    <header className="bg-[#1B4332] border-b border-[#2D6A4F] text-emerald-50 sticky top-0 z-40 shadow-md">
      {/* Top Banner / Academic Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] border border-[#E9C46A]/50 flex items-center justify-center text-[#E9C46A] shadow-inner text-xl shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Farmer-Crop-Market System
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#1B4332] shadow-xs">
                Andhra Pradesh &bull; INR (₹)
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 font-medium">
              DBMS (3NF) &bull; Dijkstra Graph Freight &bull; scikit-learn ML Regression &bull; OOPJ Mandi Service
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Role Toggle */}
          <div className="flex items-center bg-[#132A20] p-1 rounded-xl border border-[#2D6A4F]">
            <button
              onClick={() => setCurrentRole('farmer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRole === 'farmer'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🌾</span>
              <span>Farmer Portal</span>
            </button>

            <button
              onClick={() => setCurrentRole('buyer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRole === 'buyer'
                  ? 'bg-[#264653] text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🛒</span>
              <span>Buyer Portal</span>
            </button>

            <button
              onClick={() => setCurrentRole('academic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRole === 'academic'
                  ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎓</span>
              <span>Academic Modules</span>
            </button>
          </div>

          <button
            id="download-project-zip-btn"
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9C46A] hover:bg-[#dfba5f] active:bg-[#d4ad4e] text-[#1B4332] text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Download complete academic source code bundle"
          >
            <Download className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="hidden sm:inline">{isDownloading ? 'Bundling...' : 'Download Code (.zip)'}</span>
            <span className="sm:hidden">ZIP</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar per Selected Role */}
      <div className="bg-[#153427] border-t border-[#2D6A4F]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none gap-3">
          {/* Subtabs for Farmer */}
          {currentRole === 'farmer' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mr-1 hidden sm:inline">
                Farmer Workspace:
              </span>
              <button
                onClick={() => setFarmerSubView('create_listing')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  farmerSubView === 'create_listing'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>[🌾 Create Crop Listing]</span>
              </button>

              <button
                onClick={() => setFarmerSubView('inventory')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  farmerSubView === 'inventory'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>[📦 Active Inventory]</span>
              </button>

              <button
                onClick={() => setFarmerSubView('estimator')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  farmerSubView === 'estimator'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>[🤖 Price Estimator]</span>
              </button>
            </div>
          )}

          {/* Subtabs for Buyer */}
          {currentRole === 'buyer' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mr-1 hidden sm:inline">
                Buyer Operations:
              </span>
              <button
                onClick={() => setBuyerSubView('browse_crops')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buyerSubView === 'browse_crops'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>[🛒 Browse Crops by Zone]</span>
              </button>

              <button
                onClick={() => setBuyerSubView('district_rates')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buyerSubView === 'district_rates'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>[📈 District Market Rates]</span>
              </button>

              <button
                onClick={() => setBuyerSubView('transport_route')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buyerSubView === 'transport_route'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>[🚚 Transport Route & Cost]</span>
              </button>
            </div>
          )}

          {/* Subtabs for Academic Reference Modules */}
          {currentRole === 'academic' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mr-1 hidden sm:inline">
                Curriculum Modules:
              </span>
              <button
                onClick={() => setAcademicSubView('dbms')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  academicSubView === 'dbms'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>[🗄️ SQL Schema / DBMS]</span>
              </button>

              <button
                onClick={() => setAcademicSubView('ml')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  academicSubView === 'ml'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>[📊 Python ML Regression]</span>
              </button>

              <button
                onClick={() => setAcademicSubView('graph')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  academicSubView === 'graph'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>[🗺️ Dijkstra Graph Engine]</span>
              </button>

              <button
                onClick={() => setAcademicSubView('code')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  academicSubView === 'code'
                    ? 'bg-[#E9C46A] text-[#1B4332] shadow-xs'
                    : 'text-emerald-100 hover:bg-[#2D6A4F]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>[💻 Source Code & Bundles]</span>
              </button>
            </div>
          )}

          {/* Right side live status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AP APMC Mandis Connected: <strong className="text-white">6 Districts</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
