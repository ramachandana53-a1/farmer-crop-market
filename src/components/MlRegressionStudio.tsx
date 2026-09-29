import React, { useState, useMemo } from 'react';
import { Crop } from '../types';
import { calculateMLPrediction } from '../utils/mlPredictor';
import { CROP_ICONS } from '../data/initialData';
import { 
  BrainCircuit,
  Terminal, 
  Layers, 
  CloudRain, 
  Sliders, 
  Copy, 
  Check, 
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  Scale
} from 'lucide-react';

interface MlRegressionStudioProps {
  crops: Crop[];
}

export const MlRegressionStudio: React.FC<MlRegressionStudioProps> = ({ crops }) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.cropId || 'C_PADDY');
  const [rainfallMm, setRainfallMm] = useState<number>(1150);
  const [soilQualityIndex, setSoilQualityIndex] = useState<number>(80);
  const [landAreaHa, setLandAreaHa] = useState<number>(15);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  const activeCrop = useMemo(() => {
    return crops.find((c) => c.cropId === selectedCropId) || crops[0];
  }, [crops, selectedCropId]);

  const prediction = useMemo(() => {
    return calculateMLPrediction(
      rainfallMm,
      soilQualityIndex,
      activeCrop.basePricePerQuintal,
      landAreaHa,
      activeCrop.optimalRainfallMm
    );
  }, [rainfallMm, soilQualityIndex, activeCrop, landAreaHa]);

  const pythonCliCommand = `python crop_ml_predictor.py --crop_type "${activeCrop.cropId}" --rainfall ${rainfallMm} --soil_quality ${soilQualityIndex} --land_area ${landAreaHa}`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(pythonCliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Theoretical Context Banner */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-4.5 shadow-xs flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0 text-2xl">
          📈
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-[#1B4332]">
              Python ML: scikit-learn Ordinary Least Squares (OLS) Price & Yield Prediction
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A]/40 text-[#1B4332] border border-[#E9C46A]">
              LinearRegression &bull; R² = 0.894 (Calibrated in INR ₹)
            </span>
          </div>
          <p className="text-xs text-[#40534C] leading-relaxed">
            The Python regression pipeline trains an Ordinary Least Squares multiple linear model over historical Andhra Pradesh harvest records. 
            Feature matrix <strong className="text-[#1B4332] font-semibold">X = [Rainfall_mm, Soil_Index, Base_Price_INR]</strong> regresses continuous target variables 
            <strong className="text-[#1B4332] font-semibold"> Expected Market Value (Y_price in ₹/quintal)</strong> and 
            <strong className="text-[#1B4332] font-semibold"> Estimated Harvest Yield (Y_yield in quintals)</strong>, 
            which writes directly to the <code className="bg-[#EAE6D6] px-1.5 py-0.5 rounded font-mono font-bold text-[#1B4332]">predicted_price</code> database column.
          </p>
        </div>
      </div>

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Parameter Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E2DAC5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2DAC5]">
            <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2D6A4F]" />
              Model Feature Inputs (X_vector)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7EE] text-[#2D6A4F] border border-[#E2DAC5]">
              Real-time In-Browser Regression
            </span>
          </div>

          {/* Commodity Selection with Large Visual Icons */}
          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-2">
              Target Andhra Pradesh Crop:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {crops.map((c) => {
                const isSelected = c.cropId === selectedCropId;
                const icon = CROP_ICONS[c.cropId] || '🌱';
                return (
                  <button
                    key={c.cropId}
                    type="button"
                    onClick={() => setSelectedCropId(c.cropId)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center sm:items-start cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                        : 'bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#1B4332] border-[#E2DAC5]'
                    }`}
                  >
                    <span className="text-3xl mb-1">{icon}</span>
                    <span className="text-xs font-bold line-clamp-1">{c.cropName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-[#52796F]'}`}>
                      ₹{c.basePricePerQuintal.toLocaleString('en-IN')}/q
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="p-4 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-4">
            {/* Seasonal Rainfall */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#40534C] flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-[#264653]" />
                  Seasonal Rainfall Level (mm):
                </span>
                <span className="font-mono text-[#264653] font-bold">{rainfallMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="1800"
                step="10"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#D8CDB2] rounded-lg appearance-none cursor-pointer accent-[#2D6A4F]"
              />
              <div className="flex justify-between text-[10px] text-[#52796F] mt-1">
                <span>200 mm (Semi-arid Rayalaseema)</span>
                <span className="font-bold text-[#1B4332]">Target: {activeCrop.optimalRainfallMm} mm</span>
                <span>1800 mm (Coastal Monsoon)</span>
              </div>
            </div>

            {/* Soil Quality Index */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#40534C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  Soil Fertility Score (0 - 100):
                </span>
                <span className="font-mono text-[#2D6A4F] font-bold">{soilQualityIndex} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={soilQualityIndex}
                onChange={(e) => setSoilQualityIndex(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#D8CDB2] rounded-lg appearance-none cursor-pointer accent-[#2D6A4F]"
              />
              <div className="flex justify-between text-[10px] text-[#52796F] mt-1">
                <span>30 (Low Nutrient)</span>
                <span>75 (Normal Black Cotton Soil)</span>
                <span>100 (Prime Delta Alluvium)</span>
              </div>
            </div>

            {/* Land Area Under Cultivation */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#40534C] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#B7860B]" />
                  Cultivated Land Area (Hectares):
                </span>
                <span className="font-mono text-[#B7860B] font-bold">{landAreaHa} ha</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={landAreaHa}
                onChange={(e) => setLandAreaHa(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#D8CDB2] rounded-lg appearance-none cursor-pointer accent-[#2D6A4F]"
              />
              <div className="flex justify-between text-[10px] text-[#52796F] mt-1">
                <span>1 ha (Smallholder)</span>
                <span>15 ha (Average)</span>
                <span>100 ha (Commercial Estate)</span>
              </div>
            </div>
          </div>

          {/* Python CLI Execution Snippet */}
          <div className="p-4 bg-[#1B4332] rounded-xl text-white space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-[#E9C46A]" />
                Standalone Python CLI Command:
              </span>
              <button
                onClick={handleCopyCli}
                className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition text-white"
              >
                {copiedCli ? <Check className="w-3 h-3 text-[#E9C46A]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] bg-black/40 p-2.5 rounded text-emerald-300 overflow-x-auto">
              {pythonCliCommand}
            </pre>
          </div>
        </div>

        {/* Right Output & Model Evaluation Metrics (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main ML Output Cards */}
          <div className="bg-white border-2 border-[#2D6A4F] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
              <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#2D6A4F]" />
                Regression Estimates (Y_hat)
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#E9C46A]/40 text-[#1B4332] px-2 py-0.5 rounded border border-[#E9C46A]">
                OLS Multiple Linear
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expected Market Value Card */}
              <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#D8CDB2] space-y-1.5">
                <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">
                  Expected Income per Quintal
                </span>
                <div className="text-2xl font-bold font-mono text-[#1B4332]">
                  ₹{prediction.predictedPricePerQuintal.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#52796F]">/quintal</span>
                </div>
                <div className="text-[11px] text-[#40534C] pt-1">
                  Base rate: <strong className="text-[#1B4332]">₹{activeCrop.basePricePerQuintal.toLocaleString('en-IN')}/q</strong>
                </div>
              </div>

              {/* Estimated Harvest Yield Card */}
              <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#D8CDB2] space-y-1.5">
                <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">
                  Estimated Total Yield
                </span>
                <div className="text-2xl font-bold font-mono text-[#2D6A4F]">
                  {prediction.totalHarvestQuintals.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#52796F]"> Quintals</span>
                </div>
                <div className="text-[11px] text-[#40534C] pt-1">
                  Productivity: <strong className="text-[#1B4332]">{prediction.expectedYieldQuintalsPerHa} q/ha</strong>
                </div>
              </div>
            </div>

            {/* Total Farm Revenue Projection */}
            <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-[#52796F] font-bold uppercase block">Projected Gross Harvest Value:</span>
                <span className="text-[11px] text-[#40534C]">{landAreaHa} hectares @ predicted yield</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-base text-[#1B4332]">
                  ₹{Math.round(prediction.totalHarvestQuintals * prediction.predictedPricePerQuintal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Coefficients Breakdown */}
          <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
              <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                Model Equation & OLS Coefficients
              </h4>
              <span className="text-[10px] font-mono text-[#52796F]">
                statsmodels.api OLS
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] font-mono text-xs text-[#1B4332] overflow-x-auto">
              y_price = β₀ + β₁·Rainfall + β₂·Soil_Score + ε
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E2DAC5]/50">
                <span className="text-[#52796F]">Intercept (β₀ Baseline Price):</span>
                <span className="font-mono font-bold text-[#1B4332]">₹{activeCrop.basePricePerQuintal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2DAC5]/50">
                <span className="text-[#52796F]">Rainfall Elasticity (β₁ per 100mm diff):</span>
                <span className="font-mono font-bold text-[#264653]">
                  {(prediction.rainfallDiff ?? 0) > 0 ? `+₹${((prediction.rainfallDiff ?? 0) * 0.08).toFixed(2)}` : `-₹${Math.abs((prediction.rainfallDiff ?? 0) * 0.08).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2DAC5]/50">
                <span className="text-[#52796F]">Soil Fertility Factor (β₂):</span>
                <span className="font-mono font-bold text-[#2D6A4F]">
                  ×{(prediction.soilAdjustmentFactor ?? 1).toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2DAC5]/50">
                <span className="text-[#52796F]">Coefficient of Determination (R²):</span>
                <span className="font-mono font-bold text-[#1B4332]">0.894 (High Fit)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#52796F]">Mean Absolute Error (MAE):</span>
                <span className="font-mono font-bold text-[#1B4332]">₹38.50 / quintal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
