import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  Tag, 
  Droplet, 
  Layers, 
  Calendar,
  Check
} from 'lucide-react';
import { Crop, CropCategory } from '../types';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCrop: (newCrop: Crop) => void;
  defaultDistrictZoneId?: string;
}

const CROP_CATEGORIES: CropCategory[] = [
  'Food Grains',
  'Commercial',
  'Pulses',
  'Spices',
  'Horticulture/Vegetables',
  'Plantation Crops',
  'Oilseeds',
  'Fruits'
];

const AVAILABLE_ICONS = [
  '🌾', '🌶️', '🎋', '☁️', '🌽', '🥜', '🍂', '🫘', 
  '🟡', '🌰', '🌴', '🍅', '🥭', '🧅', '🥔', '☕', 
  '🍎', '🍇', '🥕', '🧄', '🌻', '🍃', '🥥', '⚫', '🟢', '🫚'
];

const PAN_INDIA_ICAR_ZONES = [
  'Trans-Gangetic Plain (Punjab/Haryana)',
  'Upper Gangetic Plain (UP)',
  'Middle Gangetic Plain (Bihar/East UP)',
  'Lower Gangetic Plain (West Bengal)',
  'Western Plateau (Maharashtra)',
  'Gujarat Plains & Hills (Gujarat)',
  'Central Plateau (Madhya Pradesh)',
  'Southern Plateau (Telangana/Karnataka/Rayalaseema)',
  'East Coast Plains (AP/Odisha/TN)',
  'West Coast & Ghats (Kerala/Konkan)',
  'Western Dry Region (Rajasthan)',
  'Western Himalayan (HP/J&K/Uttarakhand)',
  'Eastern Himalayan (Assam/North-East)'
];

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  onClose,
  onAddCrop,
}) => {
  const [cropName, setCropName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Food Grains');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Annual' | 'Year-round'>('Kharif');
  const [priceUnit, setPriceUnit] = useState<'quintal' | 'kg'>('quintal');
  const [rawBasePrice, setRawBasePrice] = useState<number>(3500);
  const [rainfallMm, setRainfallMm] = useState<number>(750);
  const [soilScore, setSoilScore] = useState<number>(75);
  const [selectedIcon, setSelectedIcon] = useState<string>('🌾');
  const [selectedAgroZones, setSelectedAgroZones] = useState<string[]>([PAN_INDIA_ICAR_ZONES[0]]);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleZone = (zone: string) => {
    if (selectedAgroZones.includes(zone)) {
      if (selectedAgroZones.length > 1) {
        setSelectedAgroZones(selectedAgroZones.filter((z) => z !== zone));
      }
    } else {
      setSelectedAgroZones([...selectedAgroZones, zone]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) {
      setFormError('Please enter a valid crop name.');
      return;
    }

    if (rawBasePrice <= 0) {
      setFormError('Base price must be greater than zero.');
      return;
    }

    const pricePerQuintal = priceUnit === 'quintal' ? rawBasePrice : Math.round(rawBasePrice * 100);
    const cleanId = `C_${cropName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 12)}_${Date.now().toString().slice(-4)}`;

    const newCrop: Crop = {
      cropId: cleanId,
      cropName: cropName.trim(),
      scientificName: scientificName.trim() || `${cropName.trim()} sp.`,
      category,
      season,
      basePricePerQuintal: pricePerQuintal,
      basePricePerTon: pricePerQuintal * 10,
      optimalRainfallMm: rainfallMm,
      optimalSoilScore: soilScore,
      icon: selectedIcon,
      agroClimaticZones: selectedAgroZones,
      isCustom: true
    };

    onAddCrop(newCrop);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-[#D8CDB2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center border border-white/20 text-2xl shadow-xs">
              {selectedIcon}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Register Custom Crop</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#1B4332] font-bold">
                  Dynamic SQL Insertion
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80">
                Add unlisted crops to Andhra Pradesh Agriculture Market Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#1B4332]">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Crop Name & Scientific Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold mb-1 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Crop Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Kashmiri Saffron, Red Onion"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">
                Scientific / Variety Name
              </label>
              <input
                type="text"
                placeholder="e.g., Crocus sativus, Allium cepa"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 text-[#40534C] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Category & Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Category (Master Schema) *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CropCategory)}
                className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none cursor-pointer"
              >
                {CROP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Cultivation Season *</span>
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as any)}
                className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none cursor-pointer"
              >
                <option value="Kharif">Kharif (Monsoon Season: July - Oct)</option>
                <option value="Rabi">Rabi (Winter Season: Oct - March)</option>
                <option value="Annual">Annual (Year-long Cycle)</option>
                <option value="Year-round">Year-round / Perennial</option>
              </select>
            </div>
          </div>

          {/* Row 3: Base Market Price & Unit */}
          <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#D8CDB2] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center gap-1 text-[#1B4332]">
                <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Base Market Rate (Mandi Benchmark):</span>
              </label>

              <div className="inline-flex bg-[#EAE6D6] p-0.5 rounded-lg border border-[#D8CDB2] text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    if (priceUnit !== 'kg') {
                      setPriceUnit('kg');
                      setRawBasePrice(Math.round((rawBasePrice / 100) * 100) / 100);
                    }
                  }}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                    priceUnit === 'kg' ? 'bg-[#2D6A4F] text-white' : 'text-[#40534C]'
                  }`}
                >
                  ₹ / kg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (priceUnit !== 'quintal') {
                      setPriceUnit('quintal');
                      setRawBasePrice(Math.round(rawBasePrice * 100));
                    }
                  }}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                    priceUnit === 'quintal' ? 'bg-[#2D6A4F] text-white' : 'text-[#40534C]'
                  }`}
                >
                  ₹ / Quintal
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full">
                <span className="absolute left-3 top-2 font-bold text-[#52796F]">₹</span>
                <input
                  type="number"
                  min="1"
                  step={priceUnit === 'kg' ? '0.1' : '10'}
                  value={rawBasePrice}
                  onChange={(e) => setRawBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#D8CDB2] rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
              <span className="font-bold text-xs text-[#2D6A4F] shrink-0 font-mono">
                {priceUnit === 'kg' ? '₹ / kg' : '₹ / quintal'}
              </span>
            </div>
            <div className="text-[11px] text-[#52796F] font-mono flex items-center justify-between">
              <span>Standard Equivalent:</span>
              <span>
                {priceUnit === 'kg' 
                  ? `₹${(rawBasePrice * 100).toLocaleString('en-IN')}/quintal` 
                  : `₹${(rawBasePrice / 100).toFixed(2)}/kg`}
              </span>
            </div>
          </div>

          {/* Row 4: Optimal Environmental Parameters for Python ML */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Optimal Rainfall (mm)</span>
                </span>
                <span className="font-mono text-[#52796F] font-bold">{rainfallMm} mm</span>
              </label>
              <input
                type="range"
                min="250"
                max="2000"
                step="25"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(parseInt(e.target.value))}
                className="w-full accent-[#2D6A4F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#52796F]">
                <span>250 mm (Arid)</span>
                <span>2,000 mm (High Delta)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#B76935]" />
                  <span>Optimal Soil Score (0-100)</span>
                </span>
                <span className="font-mono text-[#52796F] font-bold">{soilScore} / 100</span>
              </label>
              <input
                type="range"
                min="30"
                max="95"
                step="1"
                value={soilScore}
                onChange={(e) => setSoilScore(parseInt(e.target.value))}
                className="w-full accent-[#2D6A4F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#52796F]">
                <span>30 (Poor Sandy)</span>
                <span>95 (Rich Alluvium)</span>
              </div>
            </div>
          </div>

          {/* Row 5: Icon Picker */}
          <div>
            <label className="block font-bold mb-1.5">
              Select Crop Icon:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition cursor-pointer border ${
                    selectedIcon === icon 
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs scale-110' 
                      : 'bg-[#FAF7EE] border-[#D8CDB2] hover:bg-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: ICAR Agro-Climatic Recommendation Zones */}
          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>Recommended ICAR Agro-Climatic Zones of India:</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1 bg-white/40 rounded-xl border border-[#D8CDB2]/60">
              {PAN_INDIA_ICAR_ZONES.map((zone) => {
                const isSelected = selectedAgroZones.includes(zone);
                return (
                  <button
                    type="button"
                    key={zone}
                    onClick={() => handleToggleZone(zone)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border ${
                      isSelected 
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-2xs' 
                        : 'bg-[#FAF7EE] text-[#40534C] border-[#D8CDB2] hover:bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{zone}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D8CDB2] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#40534C] font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#1B4332] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E9C46A]" />
              <span>Register & Save Crop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
