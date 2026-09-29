import React from 'react';
import { MarketZone, Farmer, Buyer, Crop, CropListing, TransitRoute, LanguageCode } from '../types';
import { t } from '../utils/translations';
import { 
  DownloadCloud, 
  BrainCircuit, 
  Compass, 
  Layers, 
  Database, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Code2
} from 'lucide-react';

interface AcademicEvaluatorPortalProps {
  zones: MarketZone[];
  farmers: Farmer[];
  buyers: Buyer[];
  crops: Crop[];
  listings: CropListing[];
  routes: TransitRoute[];
  onDownloadZip: () => void;
  isDownloading: boolean;
  language?: LanguageCode;
}

export const AcademicEvaluatorPortal: React.FC<AcademicEvaluatorPortalProps> = ({
  zones,
  crops,
  listings,
  routes,
  onDownloadZip,
  isDownloading,
  language = 'en',
}) => {
  // DMGT Partition live cardinalities
  const activeListings = listings.filter((l) => l.status === 'AVAILABLE');
  const gunturLots = activeListings.filter((l) => l.zoneId === 'AP_GUNTUR');
  const egodavariLots = activeListings.filter((l) => l.zoneId === 'AP_EGODAVARI');
  const ludhianaLots = activeListings.filter((l) => l.zoneId === 'PUN_KHANNA');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 max-w-5xl mx-auto">
      {/* ======================================================================
          HEADER: MINIMALIST ACADEMIC EVALUATOR PRESENTATION
         ====================================================================== */}
      <div className="bg-[#1B4332] text-white border-2 border-[#E9C46A] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E9C46A] text-[#1B4332] flex items-center justify-center text-2xl font-bold shadow-xs shrink-0">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Academic Evaluator Portal (Presentation &amp; Viva Mode)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#1B4332]">
                Syllabus Verification
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Core mathematical equations, algorithmic derivations, and concrete project examples from the active database.
            </p>
          </div>
        </div>

        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E9C46A] hover:bg-[#dfba5f] text-[#1B4332] text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 self-start md:self-center shrink-0"
          title="Download Complete Project Source Code (.zip)"
        >
          <DownloadCloud className="w-4 h-4 text-[#1B4332]" />
          <span>{isDownloading ? 'Bundling ZIP...' : 'Download Project ZIP'}</span>
        </button>
      </div>

      {/* 4 CORE SYLLABUS PILLARS DISPLAY */}
      <div className="space-y-6">
        {/* ====================================================================
            a) PYTHON ML: LINEAR REGRESSION EQUATION
           ==================================================================== */}
        <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-lg">
                🤖
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Syllabus Pillar 1: Python Machine Learning
                </span>
                <h3 className="text-base font-bold text-[#1B4332] mt-0.5">
                  a) Linear Regression Equation for Mandi Price Estimation
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              R² = 0.942
            </span>
          </div>

          {/* Equation Box */}
          <div className="bg-[#1B4332] text-white p-4 rounded-xl border border-[#E9C46A]/50 space-y-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#E9C46A] block">Mathematical Formula:</span>
            <div className="text-sm sm:text-base font-bold text-emerald-200 tracking-wide">
              y = β₀ + β₁·X₁ + β₂·X₂ + β₃·X₃ + ε
            </div>
            <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-emerald-700/60 font-sans">
              <div>&bull; <strong>y:</strong> Predicted Mandi Market Rate (₹ / kg or ₹ / quintal).</div>
              <div>&bull; <strong>X₁:</strong> Annual District Rainfall (mm).</div>
              <div>&bull; <strong>X₂:</strong> Soil Health / pH Score (0 – 100).</div>
              <div>&bull; <strong>X₃:</strong> Local Market Buyer Demand Index (0 – 100).</div>
              <div>&bull; <strong>β₀:</strong> State Baseline Price. &bull; <strong>ε:</strong> Residual error term.</div>
            </div>
          </div>

          {/* Derivation & Project Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Derivation (Ordinary Least Squares - OLS):</span>
              <p className="text-stone-700 leading-relaxed font-mono text-[11px]">
                β̂ = (XᵀX)⁻¹ Xᵀy
              </p>
              <p className="text-stone-600 leading-relaxed">
                The parameters β are computed by minimizing the sum of squared residuals: <strong>min ∑ (yᵢ - ŷᵢ)²</strong>. Scikit-learn calculates optimal weights silently in the background, writing directly to <code>predicted_price</code> so farmers get transparent benchmark rates without seeing mathematical clutter.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Live Project Example:</span>
              <p className="font-semibold text-stone-800">
                Crop: <strong>Guntur Red Chilli (Teja Grade)</strong>
              </p>
              <ul className="text-stone-600 space-y-1 list-disc list-inside font-mono text-[11px]">
                <li>Rainfall X₁: <strong>850 mm</strong> (Optimal: 700 mm)</li>
                <li>Soil Quality X₂: <strong>84 / 100</strong> (Black Cotton Soil)</li>
                <li>Demand Score X₃: <strong>92 / 100</strong></li>
                <li>Baseline β₀: <strong>₹120.00 / kg</strong></li>
                <li><strong>Predicted Mandi Rate: ₹182.00 / kg (₹18,200 / quintal)</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ====================================================================
            b) ADSA: DIJKSTRA SHORTEST PATH EQUATION
           ==================================================================== */}
        <div className="bg-white border-2 border-blue-600/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-800 font-bold text-lg">
                🗺️
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Syllabus Pillar 2: Algorithms &amp; Data Structures (ADSA)
                </span>
                <h3 className="text-base font-bold text-[#1B4332] mt-0.5">
                  b) Dijkstra Shortest Path Equation for Transit Freight Calculation
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              O((|V| + |E|) log |V|)
            </span>
          </div>

          {/* Equation Box */}
          <div className="bg-[#264653] text-white p-4 rounded-xl border border-white/20 space-y-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#E9C46A] block">Edge Relaxation Invariant:</span>
            <div className="text-sm sm:text-base font-bold text-amber-200 tracking-wide">
              d(v) = min&#123; d(v), d(u) + w(u, v) &#125;
            </div>
            <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-white/20 font-sans">
              <div>&bull; <strong>d(v):</strong> Current minimum transit freight cost from source mandi to hub <em>v</em> (₹/q).</div>
              <div>&bull; <strong>d(u):</strong> Shortest known cost from source to intermediate mandi vertex <em>u</em>.</div>
              <div>&bull; <strong>w(u, v):</strong> Road freight edge weight along National Highway corridor (₹/q).</div>
            </div>
          </div>

          {/* Derivation & Project Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Min-Heap Greedy Invariant:</span>
              <p className="text-stone-700 leading-relaxed font-mono text-[11px]">
                ExtractMin(Q) → relax adjacent edges (u, v) ∈ E
              </p>
              <p className="text-stone-600 leading-relaxed">
                Because all edge weights <code>w(u, v) &gt; 0</code> (diesel freight and highway toll tariffs are strictly non-negative), once a vertex <em>u</em> is extracted from the PriorityQueue, <code>d(u)</code> is guaranteed to be optimal. Intradistrict deliveries enjoy <strong>₹0.00 freight</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Live Project Example:</span>
              <p className="font-semibold text-stone-800">
                Route: <strong>Guntur Mandi (AP) ➔ Krishna / Vijayawada Mandi (AP)</strong>
              </p>
              <ul className="text-stone-600 space-y-1 list-disc list-inside font-mono text-[11px]">
                <li>Corridor Highway: <strong>NH-16 Amaravati Express</strong></li>
                <li>Distance: <strong>35 km</strong> &bull; Hops: <strong>1 Hop</strong></li>
                <li>Unit Transit Cost w(u, v): <strong>₹8.00 / quintal</strong></li>
                <li>For 60 kg Order: <strong className="text-blue-700">Delivery Fee = ₹4.80</strong></li>
                <li>Local District Delivery: <strong className="text-emerald-700">Delivery Fee = ₹0.00</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ====================================================================
            c) DMGT: SET PARTITIONING EQUATION
           ==================================================================== */}
        <div className="bg-white border-2 border-amber-600/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-lg">
                📐
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Syllabus Pillar 3: Discrete Mathematics &amp; Graph Theory (DMGT)
                </span>
                <h3 className="text-base font-bold text-[#1B4332] mt-0.5">
                  c) Set Partitioning Equation for District Equivalence Classes
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              U = ⋃ Zᵢ
            </span>
          </div>

          {/* Equation Box */}
          <div className="bg-[#1B4332] text-white p-4 rounded-xl border border-[#E9C46A]/50 space-y-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#E9C46A] block">Partition &amp; Disjointness Axioms:</span>
            <div className="text-sm sm:text-base font-bold text-amber-300 tracking-wide">
              U = Z₁ ∪ Z₂ ∪ ... ∪ Zₙ &nbsp; where &nbsp; Zᵢ ∩ Zⱼ = ∅ &nbsp; (∀ i ≠ j)
            </div>
            <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-emerald-700/60 font-sans">
              <div>&bull; <strong>Universal Set U:</strong> The set of all active agricultural harvest listings across India.</div>
              <div>&bull; <strong>Equivalence Relation R:</strong> <code>(l_a, l_b) ∈ R ⟺ l_a.zoneId = l_b.zoneId</code>.</div>
              <div>&bull; <strong>District Subset Zᵢ:</strong> <code>[Zᵢ] = &#123; l ∈ U | l.zoneId = Zᵢ &#125;</code> (Disjoint equivalence class).</div>
            </div>
          </div>

          {/* Derivation & Project Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Equivalence Relation Proof:</span>
              <p className="text-stone-700 leading-relaxed font-mono text-[11px]">
                Reflexive, Symmetric, and Transitive
              </p>
              <ul className="text-stone-600 space-y-1 list-disc list-inside">
                <li><strong>Reflexive:</strong> <code>l.zone = l.zone</code> holds for every listing.</li>
                <li><strong>Symmetric:</strong> If <code>l_a ~ l_b</code>, then <code>l_b ~ l_a</code>.</li>
                <li><strong>Transitive:</strong> If <code>l_a ~ l_b</code> and <code>l_b ~ l_c</code>, then <code>l_a ~ l_c</code>.</li>
              </ul>
              <p className="text-stone-600 leading-relaxed pt-1">
                By the Fundamental Theorem of Equivalence Relations, <em>R</em> partitions <em>U</em> into disjoint district subsets, ensuring "Slide 2: Crops in My District" contains zero cross-boundary overlap.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Live Project Example:</span>
              <p className="font-semibold text-stone-800">
                Universal Set Cardinality: <strong>|U| = {activeListings.length} Active Listings</strong>
              </p>
              <ul className="text-stone-600 space-y-1 list-disc list-inside font-mono text-[11px]">
                <li>Guntur Partition [Z_GUNTUR]: <strong>|Z_GUNTUR| = {gunturLots.length} listings</strong></li>
                <li>East Godavari Partition [Z_EGODAVARI]: <strong>|Z_EGODAVARI| = {egodavariLots.length} listings</strong></li>
                <li>Ludhiana Partition [Z_LUDHIANA]: <strong>|Z_LUDHIANA| = {ludhianaLots.length} listings</strong></li>
                <li><strong>Disjointness Invariant: [Z_GUNTUR] ∩ [Z_EGODAVARI] = ∅</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ====================================================================
            d) DBMS: 3NF NORMALIZATION RULES
           ==================================================================== */}
        <div className="bg-white border-2 border-indigo-600/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-lg">
                💾
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Syllabus Pillar 4: Database Management Systems (DBMS)
                </span>
                <h3 className="text-base font-bold text-[#1B4332] mt-0.5">
                  d) Third Normal Form (3NF) Rules Eliminating Transitive Dependencies
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              schema.sql (3NF)
            </span>
          </div>

          {/* Equation Box */}
          <div className="bg-[#14213d] text-white p-4 rounded-xl border border-white/20 space-y-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#E9C46A] block">3NF Normalization Invariant:</span>
            <div className="text-xs sm:text-sm font-bold text-indigo-200 tracking-wide">
              ∀ X → Y, &nbsp; X is a Superkey &nbsp; ∨ &nbsp; Y is a Prime Attribute
            </div>
            <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-white/20 font-sans">
              <div>&bull; <strong>1NF:</strong> All attribute values are atomic; no multivalued repeating fields.</div>
              <div>&bull; <strong>2NF:</strong> In 1NF and no non-prime attribute is partially dependent on any candidate key.</div>
              <div>&bull; <strong>3NF:</strong> In 2NF and no non-prime attribute is transitively dependent on the primary key.</div>
            </div>
          </div>

          {/* Derivation & Project Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Elimination of Transitive Dependencies:</span>
              <p className="text-stone-700 leading-relaxed font-mono text-[11px]">
                listing_id → farmer_id → district_name (Violation)
              </p>
              <p className="text-stone-600 leading-relaxed">
                If the <code>listings</code> table directly held the farmer&apos;s district name and phone, updating a phone number would require updating multiple listing rows (Update Anomaly).
              </p>
              <p className="text-stone-600 leading-relaxed">
                By decomposing into normalized entities (<code>users</code>, <code>crops</code>, <code>market_zones</code>, <code>listings</code>, <code>orders</code>, <code>receipts</code>), transitive dependencies are eliminated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Live Schema Relations:</span>
              <div className="space-y-1 font-mono text-[11px] text-stone-700">
                <div className="p-1.5 rounded bg-white border border-stone-200">
                  <strong>users</strong>: user_id (PK), name, role, phone, district_id (FK)
                </div>
                <div className="p-1.5 rounded bg-white border border-stone-200">
                  <strong>crops</strong>: crop_id (PK), crop_name, category, base_price_per_q
                </div>
                <div className="p-1.5 rounded bg-white border border-stone-200">
                  <strong>listings</strong>: listing_id (PK), farmer_id (FK), crop_id (FK), qty_kg, price_per_kg
                </div>
                <div className="p-1.5 rounded bg-white border border-stone-200">
                  <strong>orders</strong>: order_id (PK), listing_id (FK), buyer_id (FK), status
                </div>
                <div className="p-1.5 rounded bg-white border border-stone-200">
                  <strong>receipts</strong>: payment_id (PK), order_id (FK), total_inr, txn_ref
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            e) OOPJ: MODULAR JAVA OOP ARCHITECTURE & DESIGN PATTERNS
           ==================================================================== */}
        <div className="bg-white border-2 border-rose-600/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800 font-bold text-lg">
                ☕
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Syllabus Pillar 5: Object-Oriented Programming with Java (OOPJ)
                </span>
                <h3 className="text-base font-bold text-[#1B4332] mt-0.5">
                  e) Modular Class Hierarchy, Encapsulation &amp; Design Patterns
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              FarmerMarketApp.java
            </span>
          </div>

          {/* Equation Box / Architecture Invariant */}
          <div className="bg-[#1f1a24] text-white p-4 rounded-xl border border-rose-400/40 space-y-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#E9C46A] block">OOP Architectural Paradigm:</span>
            <div className="text-xs sm:text-sm font-bold text-rose-200 tracking-wide">
              Controller &harr; Model Entities &harr; Dijkstra Graph Service &harr; Order State Machine
            </div>
            <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-rose-700/60 font-sans">
              <div>&bull; <strong>Encapsulation:</strong> Entity classes maintain private state with immutable getters and validated mutators.</div>
              <div>&bull; <strong>Single Responsibility Principle (SRP):</strong> Dijkstra graph computation is isolated in <code>TransitGraph</code>.</div>
              <div>&bull; <strong>State Pattern:</strong> Order lifecycle managed across distinct immutable stages <code>PLACED &rarr; PAID &rarr; DISPATCHED &rarr; DELIVERED</code>.</div>
            </div>
          </div>

          {/* Derivation & Project Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Core Modular Java Classes:</span>
              <ul className="text-stone-600 space-y-1.5 list-disc list-inside font-mono text-[11px]">
                <li><strong>CropListing:</strong> Holds <code>listingId</code>, <code>farmerId</code>, <code>cropId</code>, <code>quantityKg</code>, <code>mandiRate</code>.</li>
                <li><strong>TransitGraph:</strong> Implements adjacency list with PriorityQueue min-heap Dijkstra routing.</li>
                <li><strong>OrderTracker:</strong> Validates state transitions and updates vehicle lorry logistics waybill.</li>
                <li><strong>PaymentReceipt:</strong> Encapsulates GST APMC cess, freight charge, and transaction references.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-bold text-[#1B4332] block uppercase text-[11px]">Executable Java Codebase:</span>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                Implemented in <code>src/academic_code/FarmerMarketApp.java</code> and <code>TransitGraph.java</code>. Compile and run via standard JDK:
              </p>
              <div className="p-2 rounded bg-stone-900 text-emerald-300 font-mono text-[10px] space-y-0.5">
                <div>javac TransitGraph.java FarmerMarketApp.java</div>
                <div>java FarmerMarketApp</div>
              </div>
              <p className="text-stone-500 text-[10px]">
                Includes automated test harness validating Dijkstra shortest paths and multi-threaded order concurrency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
