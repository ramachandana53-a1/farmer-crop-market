import React, { useState, useMemo, useEffect } from 'react';
import { Crop } from '../types';
import { CROP_ICONS } from '../data/initialData';
import { 
  X, 
  Search, 
  Sprout, 
  Sparkles, 
  Plus, 
  Check, 
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface CropSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  crops: Crop[];
  selectedCropId: string;
  onSelectCrop: (crop: Crop) => void;
  onOpenAddCropModal?: () => void;
  recommendedCropIds?: string[];
  districtName?: string;
}

export const CropSelectionDrawer: React.FC<CropSelectionDrawerProps> = ({
  isOpen,
  onClose,
  crops,
  selectedCropId,
  onSelectCrop,
  onOpenAddCropModal,
  recommendedCropIds = [],
  districtName = 'your District',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Categories list
  const categories = [
    { key: 'ALL', label: 'All Crops' },
    { key: 'Food Grains', label: 'Food Grains' },
    { key: 'Spices', label: 'Spices' },
    { key: 'Pulses', label: 'Pulses' },
    { key: 'Commercial', label: 'Commercial' },
    { key: 'Oilseeds', label: 'Oilseeds' },
    { key: 'Fruits', label: 'Fruits' },
    { key: 'Horticulture/Vegetables', label: 'Vegetables' },
  ];

  // Filtered crops
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Category match
      if (selectedCategory !== 'ALL') {
        const cat = (crop.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (target === 'commercial' && (cat === 'commercial' || cat === 'cash crop')) {
          // match
        } else if (target === 'food grains' && (cat === 'food grains' || cat === 'grains' || cat === 'cereal')) {
          // match
        } else if (target === 'pulses' && (cat === 'pulses' || cat === 'pulse')) {
          // match
        } else if (target === 'spices' && (cat === 'spices' || cat === 'spice')) {
          // match
        } else if (target === 'oilseeds' && (cat === 'oilseeds' || cat === 'oilseed')) {
          // match
        } else if (target === 'horticulture/vegetables' && (cat.includes('horticulture') || cat.includes('vegetable'))) {
          // match
        } else if (target === 'fruits' && cat === 'fruits') {
          // match
        } else if (cat !== target) {
          return false;
        }
      }

      // Search match
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = crop.cropName.toLowerCase().includes(query);
        const sciMatch = (crop.scientificName || '').toLowerCase().includes(query);
        const catMatch = (crop.category || '').toLowerCase().includes(query);
        if (!nameMatch && !sciMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [crops, selectedCategory, searchTerm]);

  // Separate recommended crops that match filter
  const recommendedMatchingCrops = useMemo(() => {
    return filteredCrops.filter((c) => recommendedCropIds.includes(c.cropId));
  }, [filteredCrops, recommendedCropIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#FAF7EE] shadow-2xl flex flex-col border-l-2 border-[#2D6A4F] animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-[#1B4332] text-white flex items-center justify-between border-b-2 border-[#E9C46A]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-[#E9C46A]">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Choose Crop</h3>
                <p className="text-[11px] text-emerald-200">
                  Select a crop to auto-calculate rates & profit
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search & Filter Controls */}
          <div className="p-4 bg-white border-b border-[#E2DAC5] space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#52796F]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search crops (e.g., Wheat, Chilli, Onion)..."
                className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-[#1B4332] placeholder-[#52796F]/70 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-thin">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer border ${
                    selectedCategory === cat.key
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                      : 'bg-[#FAF7EE] text-[#40534C] hover:bg-[#F4F1DE] border-[#E2DAC5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Header Tip with district highlight */}
            {districtName && recommendedMatchingCrops.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-[#2D6A4F] font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>{recommendedMatchingCrops.length} recommended for <strong>{districtName}</strong></span>
                </span>
                <span className="text-[10px] text-[#52796F] font-mono">
                  {filteredCrops.length} total available
                </span>
              </div>
            )}
          </div>

          {/* Interactive Crop Grid List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredCrops.length === 0 ? (
              <div className="text-center py-12 text-[#52796F] space-y-3">
                <Sprout className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-xs font-semibold">No matching crops found.</p>
                {onOpenAddCropModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddCropModal();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold shadow-xs hover:bg-[#1B4332] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Crop</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCrops.map((crop) => {
                  const isSelected = crop.cropId === selectedCropId;
                  const isRecommended = recommendedCropIds.includes(crop.cropId);
                  const icon = CROP_ICONS[crop.cropId] || crop.icon || '🌾';
                  const basePerKg = Math.round((crop.basePricePerQuintal / 100) * 100) / 100;

                  return (
                    <button
                      key={crop.cropId}
                      type="button"
                      onClick={() => {
                        onSelectCrop(crop);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer group relative ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md ring-2 ring-[#E9C46A]'
                          : 'bg-white hover:bg-[#FAF7EE] text-[#1B4332] border-[#E2DAC5] hover:border-[#2D6A4F]'
                      }`}
                    >
                      {/* Top Row: Icon & Badges */}
                      <div className="flex items-start justify-between gap-1 w-full">
                        <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                          {icon}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {isRecommended && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-[#E9C46A] text-[#1B4332]' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              Top in District
                            </span>
                          )}
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-[#E9C46A] text-[#1B4332]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Crop Name & Category */}
                      <div className="mt-2">
                        <h4 className="text-xs font-bold line-clamp-1 group-hover:text-emerald-700">
                          {crop.cropName}
                        </h4>
                        <span className={`text-[10px] block line-clamp-1 ${
                          isSelected ? 'text-emerald-100' : 'text-[#52796F]'
                        }`}>
                          {crop.category} &bull; {crop.season}
                        </span>
                      </div>

                      {/* Bottom: Pricing */}
                      <div className="mt-2 pt-1.5 border-t border-dashed flex items-center justify-between font-mono text-[11px] border-black/10">
                        <span className={`text-[10px] font-sans ${isSelected ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                          Mandi Base:
                        </span>
                        <div className="text-right">
                          <strong className="block">₹{crop.basePricePerQuintal.toLocaleString('en-IN')}/q</strong>
                          <span className={`text-[9px] block ${isSelected ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                            (₹{basePerKg.toFixed(2)}/kg)
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer with Add Custom Crop button */}
          <div className="p-3.5 bg-white border-t border-[#E2DAC5] flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-[#52796F]">
              Can't find your crop?
            </div>
            {onOpenAddCropModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCropModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-[#F4F1DE] border border-[#2D6A4F]/40 text-[#2D6A4F] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Add Custom Crop</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
