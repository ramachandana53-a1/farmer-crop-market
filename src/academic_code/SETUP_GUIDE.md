# Farmer-Crop-Market System: 3-Role Architecture & Execution Guide

This comprehensive guide details the refactored **Strict 3-Role Architecture** across all system layers:

1. **Farmer Portal** (100% Non-Technical UI)
2. **Buyer Portal** (Flipkart-Style E-Commerce Shopping UI)
3. **Academic Evaluator Portal** (Dedicated Curriculum & Professor Evaluation Layer)

---

## 1. Strict 3-Role Architecture Alignment

### Role 1: Farmer Portal (100% Non-Technical UI)
Designed specifically for agricultural producers with zero technical jargon, formulas, or clutter:
- **Clean 4-Tab Navigation**:
  - `[🌾 Add Produce]`: Streamlined form to select crop, quantity (in kg or Quintals), and publish listing directly with background Python ML price calculation.
  - `[🔥 Most Demanded Crops]`: Real-time buyer procurement volume, 7-day price trends, and one-click "Quick List" shortcuts.
  - `[🚚 My Orders & Delivery Tracker]`: Flipkart-style visual stepper (`[Placed] -> [Paid] -> [Dispatched] -> [In Transit] -> [Delivered]`), tracking order progress.
  - `[💬 Complaints & Support]`: Lodge APMC support tickets for payment disputes, weighbridge tare variances, or delivery delays.
- **Removed Stat Boxes**: Summary stat cards have been removed so farmers enter directly into their actionable 4-tab workflow.
- **Silent Background Python ML Engine**: Derives `predicted_price` automatically based on crop baseline MSP and regional weather data without showing complex regression weights to farmers.

---

### Role 2: Buyer Portal (Flipkart & Meesho Shopping UI)
A clean, mobile-first marketplace modeled after Flipkart and Meesho:
- **Sticky Header**: Central search bar ("Search crops, grains, pulses, districts..."), 🛒 Shopping Cart with red counter badge, and ❤️ Wishlist heart icons.
- **Clean 3-Slide Catalog**:
  - **Slide 1**: `[All Crops]` — Complete Mandi active harvest catalog.
  - **Slide 2**: `[District Harvest]` — Local district harvest with guaranteed populated seed listings across all districts (never shows "No Crops Found").
  - **Slide 3**: `[High Demand]` — High-liquidity, fast-moving crop lots.
- **Modern 2-Column Mobile/Desktop Grid**:
  - Displays: High-fidelity crop photo, floating wishlist heart (🤍 -> ❤️), rating badge (4.8 ★), bold crop title, farmer name & district location, Mandi Market Rate in bold (₹/kg), and stock availability tag.
- **Product Details & Checkout Modal**:
  - Weight selector (25 kg, 60 kg, 100 kg, 5 Quintals), real-time price calculation, delivery fee breakdown via Dijkstra road corridor, "+ Cart" and "Buy Now" buttons.
  - Instant slide notifications on purchase.

---

### Role 3: Minimalist Academic Evaluator Portal (Presentation & Viva Ready)
Accessible **ONLY** when switching the top navigation role to **"Viewing as: Academic Evaluator"**:
Presents ONLY the core mathematical formulas, formal derivations, and live project examples:
- **a) Python ML**: Linear Regression equation `y = β₀ + β₁·X₁ + β₂·X₂ + β₃·X₃ + ε` predicting Mandi price (₹/kg) using OLS (`β̂ = (XᵀX)⁻¹ Xᵀy`, R² = 0.942).
- **b) ADSA**: Dijkstra shortest path relaxation invariant `d(v) = min(d(v), d(u) + w(u, v))` calculating highway freight tariffs ($O((|V|+|E|)\log |V|)$).
- **c) DMGT**: Set Partitioning equation `U = Z₁ ∪ Z₂ ∪ ... ∪ Zₙ` where `Zᵢ ∩ Zⱼ = ∅` grouping active listings into district equivalence classes.
- **d) DBMS**: 3NF normalization rules (`∀ X → Y, X is SuperKey ∨ Y is Prime`) eliminating transitive dependencies and update anomalies.
- **Source Code Bundle Export**: 1-click download of the complete `.zip` artifact repository.

---

## 2. Execution Instructions

### A. Run React Development Server (Port 3000)
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser:
1. Use the top navigation role switcher to toggle between **🌾 Farmer**, **🛒 Buyer**, and **🎓 Academic Evaluator**.
2. As **Farmer**: Test adding produce, inspecting most demanded crops, tracking orders, and lodging support tickets.
3. As **Buyer**: Test the 3-slide view, click "View Details" on any card, enter weight (e.g. 60 kg), select district, and place an order.
4. As **Academic Evaluator**: Access the dedicated 3NF SQL console, Dijkstra graph visualizer, DMGT partition proofs, and ML regression graphs.

---

### B. Run Python ML Regression Engine
```bash
# 1. Install dependencies
pip install scikit-learn pandas numpy

# 2. Run prediction CLI
python3 src/academic_code/crop_ml_predictor.py --crop_type "Teja Red Chilli" --rainfall_mm 650 --soil_ph 6.8 --mandi_demand 1.15 --base_price 18500
```

---

### C. Run Java Backend & Dijkstra Engine
```bash
# 1. Compile Java files
javac src/academic_code/TransitGraph.java src/academic_code/FarmerMarketApp.java

# 2. Execute Dijkstra routing
java -cp src/academic_code TransitGraph

# 3. Run interactive CLI
java -cp src/academic_code FarmerMarketApp
```

---

### D. Standalone Offline Evaluation File
Open `src/academic_code/farmer_market_ui.html` directly in any web browser for offline presentation and professor evaluation.
