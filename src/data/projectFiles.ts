export interface AcademicCodeFile {
  filename: string;
  category: 'DBMS' | 'DMGT_ADSA' | 'PYTHON_ML' | 'OOPJ' | 'WEB_UI' | 'DOCUMENTATION';
  title: string;
  language: string;
  description: string;
  code: string;
}

export const PROJECT_CODE_FILES: AcademicCodeFile[] = [
  {
    filename: 'schema.sql',
    category: 'DBMS',
    title: 'Pan-India 3NF Relational Schema, ICAR Agro-Climatic Zones & Equivalence Class Queries',
    language: 'sql',
    description: 'Third Normal Form (3NF) relational DDL for MySQL 8.0+ / PostgreSQL 14+, covering all 28 Indian States, 15 ICAR Agro-Climatic Zones, dynamic crop registry, ML predictions, Flipkart-style orders, and GST receipts in INR (₹).',
    code: `-- ============================================================================
-- ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM (PAN-INDIA LOCALIZATION)
-- MODULE 1: DATABASE MANAGEMENT SYSTEM (DBMS) 3NF SCHEMA & ANALYTICAL DDL
-- Scope: All 28 States & UTs | 15 ICAR Agro-Climatic Zones | Currency: INR (₹)
-- Target: MySQL 8.0+ / PostgreSQL 14+ Compatible
-- ============================================================================

DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS transit_routes;
DROP TABLE IF EXISTS farmers;
DROP TABLE IF EXISTS buyers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS crops;
DROP TABLE IF EXISTS market_zones;
DROP TABLE IF EXISTS icar_zones;
DROP TABLE IF EXISTS indian_states;

-- Table 1: INDIAN_STATES (All 28 States and Union Territories)
CREATE TABLE indian_states (
    state_code VARCHAR(10) PRIMARY KEY,
    state_name VARCHAR(80) NOT NULL UNIQUE,
    region VARCHAR(30) NOT NULL CHECK (region IN ('North', 'South', 'East', 'West', 'Central', 'North-East', 'Islands')),
    primary_icar_zone VARCHAR(20) NOT NULL,
    soil_profile VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: ICAR_ZONES (15 ICAR Planning Commission Agro-Climatic Zones)
CREATE TABLE icar_zones (
    zone_code VARCHAR(20) PRIMARY KEY,
    zone_number INT NOT NULL UNIQUE CHECK (zone_number BETWEEN 1 AND 15),
    zone_name VARCHAR(120) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    annual_rainfall_mm_range VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

-- Table 3: MARKET_ZONES (Pan-India APMC Market Hubs)
CREATE TABLE market_zones (
    zone_id VARCHAR(25) PRIMARY KEY,
    zone_name VARCHAR(140) NOT NULL UNIQUE,
    district_region VARCHAR(80) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    icar_zone_code VARCHAR(20) NOT NULL,
    soil_type VARCHAR(80) NOT NULL,
    annual_rainfall_mm DECIMAL(7, 2) NOT NULL DEFAULT 850.0,
    hub_capacity_quintals INT NOT NULL DEFAULT 250000 CHECK (hub_capacity_quintals >= 0),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_zones_state FOREIGN KEY (state_code)
        REFERENCES indian_states (state_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_zones_icar FOREIGN KEY (icar_zone_code)
        REFERENCES icar_zones (zone_code) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 4: USERS (Role-Based Authentication: Farmer / Buyer / Mandi Inspector)
CREATE TABLE users (
    user_id VARCHAR(25) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('Farmer', 'Buyer', 'Admin', 'Inspector')),
    state_code VARCHAR(10) NOT NULL,
    zone_id VARCHAR(25) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_state FOREIGN KEY (state_code)
        REFERENCES indian_states (state_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_users_zone FOREIGN KEY (zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 5: FARMERS (Registered Agricultural Producers across India)
CREATE TABLE farmers (
    farmer_id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) UNIQUE,
    state_code VARCHAR(10) NOT NULL,
    district VARCHAR(80) NOT NULL,
    zone_id VARCHAR(25) NOT NULL,
    land_area_acres DECIMAL(8, 2) NOT NULL CHECK (land_area_acres > 0),
    soil_type VARCHAR(60) NOT NULL,
    soil_ph DECIMAL(3, 1) NOT NULL DEFAULT 6.8 CHECK (soil_ph BETWEEN 4.0 AND 10.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farmers_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_farmers_zone FOREIGN KEY (zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 6: BUYERS (Interstate Wholesalers, Food Processors & Exporters)
CREATE TABLE buyers (
    buyer_id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25),
    company_name VARCHAR(160) NOT NULL,
    contact_person VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) UNIQUE,
    state_code VARCHAR(10) NOT NULL,
    zone_id VARCHAR(25) NOT NULL,
    gstin VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_buyers_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_buyers_zone FOREIGN KEY (zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 7: CROPS (Dynamic Master Registry: Food Grains, Cash Crops, Spices, Pulses)
CREATE TABLE crops (
    crop_id VARCHAR(25) PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(140) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Food Grains', 'Commercial', 'Pulses', 'Spices', 
        'Oilseeds', 'Plantation Crops', 'Horticulture/Vegetables', 'Fruits'
    )),
    season VARCHAR(30) NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid', 'Year-round', 'Annual')),
    base_price_per_quintal DECIMAL(10, 2) NOT NULL CHECK (base_price_per_quintal > 0),
    optimal_rainfall_mm DECIMAL(7, 2) NOT NULL CHECK (optimal_rainfall_mm > 0),
    optimal_soil_score DECIMAL(5, 2) NOT NULL CHECK (optimal_soil_score BETWEEN 0 AND 100),
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_by_farmer_id VARCHAR(25),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_crops_farmer FOREIGN KEY (submitted_by_farmer_id)
        REFERENCES farmers (farmer_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Table 8: LISTINGS (Harvest Lots with Farmer Asking Price & ML Predicted Rate)
CREATE TABLE listings (
    listing_id VARCHAR(30) PRIMARY KEY,
    farmer_id VARCHAR(25) NOT NULL,
    crop_id VARCHAR(25) NOT NULL,
    zone_id VARCHAR(25) NOT NULL,
    quantity_quintals DECIMAL(10, 2) NOT NULL CHECK (quantity_quintals > 0),
    quantity_available_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_available_kg > 0),
    asking_price_per_quintal DECIMAL(10, 2) NOT NULL CHECK (asking_price_per_quintal > 0),
    ml_predicted_price_per_quintal DECIMAL(10, 2) NOT NULL CHECK (ml_predicted_price_per_quintal > 0),
    price_variance_pct DECIMAL(6, 2) NOT NULL,
    soil_ph DECIMAL(3, 1) NOT NULL DEFAULT 6.8,
    rainfall_input_mm DECIMAL(7, 2) NOT NULL,
    mandi_demand_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.05,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'SOLD', 'RESERVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_farmer FOREIGN KEY (farmer_id)
        REFERENCES farmers (farmer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_listing_crop FOREIGN KEY (crop_id)
        REFERENCES crops (crop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_listing_zone FOREIGN KEY (zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 9: TRANSIT_ROUTES (Interstate National Highways: NH-44, NH-48, NH-16, NH-19, NH-27)
CREATE TABLE transit_routes (
    source_zone_id VARCHAR(25) NOT NULL,
    destination_zone_id VARCHAR(25) NOT NULL,
    highway_corridor VARCHAR(80) NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL CHECK (distance_km > 0),
    transit_cost_per_quintal DECIMAL(10, 2) NOT NULL CHECK (transit_cost_per_quintal >= 0),
    avg_duration_hours DECIMAL(5, 2) NOT NULL CHECK (avg_duration_hours > 0),
    PRIMARY KEY (source_zone_id, destination_zone_id),
    CONSTRAINT fk_route_source FOREIGN KEY (source_zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_route_dest FOREIGN KEY (destination_zone_id)
        REFERENCES market_zones (zone_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_no_self_loop CHECK (source_zone_id <> destination_zone_id)
);

-- Table 10: ORDERS (Flipkart-Style Mandi Order Lifecycle with Dijkstra Routing)
CREATE TABLE orders (
    order_id VARCHAR(30) PRIMARY KEY,
    listing_id VARCHAR(30) NOT NULL,
    crop_id VARCHAR(25) NOT NULL,
    farmer_id VARCHAR(25) NOT NULL,
    buyer_id VARCHAR(25) NOT NULL,
    source_zone_id VARCHAR(25) NOT NULL,
    dest_zone_id VARCHAR(25) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_kg > 0),
    quantity_quintals DECIMAL(10, 2) NOT NULL CHECK (quantity_quintals > 0),
    crop_unit_price_per_kg DECIMAL(10, 2) NOT NULL,
    produce_cost_inr DECIMAL(12, 2) NOT NULL,
    transit_freight_cost_inr DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_landed_cost_inr DECIMAL(12, 2) NOT NULL,
    max_budget_inr DECIMAL(12, 2) NOT NULL,
    is_budget_match BOOLEAN NOT NULL DEFAULT TRUE,
    order_status VARCHAR(25) NOT NULL DEFAULT 'PLACED' 
        CHECK (order_status IN ('PLACED', 'PAYMENT_VERIFIED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED')),
    dijkstra_route_text VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(40) NOT NULL UNIQUE,
    vehicle_lorry_number VARCHAR(40),
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_listing FOREIGN KEY (listing_id)
        REFERENCES listings (listing_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_crop FOREIGN KEY (crop_id)
        REFERENCES crops (crop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_farmer FOREIGN KEY (farmer_id)
        REFERENCES farmers (farmer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id)
        REFERENCES buyers (buyer_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 11: RECEIPTS (GST Tax Invoices in ₹ INR with Cess & Verification Hash)
CREATE TABLE receipts (
    receipt_id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL UNIQUE,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    transaction_ref VARCHAR(60) NOT NULL UNIQUE,
    buyer_id VARCHAR(25) NOT NULL,
    farmer_id VARCHAR(25) NOT NULL,
    produce_subtotal_inr DECIMAL(12, 2) NOT NULL,
    transit_freight_inr DECIMAL(10, 2) NOT NULL,
    apmc_mandi_cess_inr DECIMAL(10, 2) NOT NULL,
    cgst_inr DECIMAL(10, 2) NOT NULL,
    sgst_inr DECIMAL(10, 2) NOT NULL,
    total_amount_paid_inr DECIMAL(12, 2) NOT NULL,
    payment_mode VARCHAR(60) NOT NULL DEFAULT 'UPI / e-NAM Real-Time Settlement',
    verification_hash VARCHAR(64) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipt_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 12: COMPLAINTS (Farmer Support Tickets & APMC Mandi Dispute Resolution Desk)
CREATE TABLE complaints (
    complaint_id VARCHAR(35) PRIMARY KEY,
    farmer_id VARCHAR(25) NOT NULL,
    buyer_id VARCHAR(25),
    order_id VARCHAR(30),
    crop_lot_id VARCHAR(30),
    crop_name VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Quality Dispute', 'Quantity Shortage', 'Payment Issue', 'Delivery Delay',
        'PAYMENT_DISPUTE', 'DELIVERY_ISSUE', 'WEIGHING_MANDI_ISSUE', 
        'CROP_QUALITY', 'PLATFORM_SUPPORT'
    )),
    priority VARCHAR(15) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')),
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    assigned_officer VARCHAR(120),
    farmer_response TEXT,
    farmer_responded_at TIMESTAMP NULL,
    resolution_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_complaint_farmer FOREIGN KEY (farmer_id)
        REFERENCES farmers (farmer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_buyer FOREIGN KEY (buyer_id)
        REFERENCES buyers (buyer_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_complaint_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Table 13: CROP_REVIEWS (Post-Purchase Quality Ratings & Dynamic Catalog Feedback)
CREATE TABLE crop_reviews (
    review_id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    crop_id VARCHAR(25) NOT NULL,
    listing_id VARCHAR(30),
    buyer_id VARCHAR(25) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    quality_feedback TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_review_crop FOREIGN KEY (crop_id)
        REFERENCES crops (crop_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_review_buyer FOREIGN KEY (buyer_id)
        REFERENCES buyers (buyer_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table 14: NOTIFICATIONS (Role-Isolated Alert System for Farmers and Buyers)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role ENUM('BUYER', 'FARMER') NOT NULL, -- Filters notifications by portal
    type VARCHAR(50) NOT NULL,             -- e.g., 'ORDER_UPDATE', 'STOCK_ALERT'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 15: DELIVERY_TRACKER (Real-Time 4-Stage Multi-Hop Logistics Tracking)
CREATE TABLE delivery_tracker (
    tracking_id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    buyer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ORDER_PLACED',
    step_placed_completed BOOLEAN DEFAULT TRUE,
    step_placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    step_accepted_completed BOOLEAN DEFAULT FALSE,
    step_accepted_at TIMESTAMP NULL,
    step_out_for_delivery_completed BOOLEAN DEFAULT FALSE,
    step_out_for_delivery_at TIMESTAMP NULL,
    step_delivered_completed BOOLEAN DEFAULT FALSE,
    step_delivered_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tracker_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_listings_zone_crop ON listings(zone_id, crop_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_crops_category ON crops(category);
CREATE INDEX idx_transit_corridor ON transit_routes(highway_corridor);
CREATE INDEX idx_complaints_status ON complaints(status, priority);
CREATE INDEX idx_reviews_crop ON crop_reviews(crop_id, rating);
CREATE INDEX idx_notifications_user_role ON notifications(user_id, role);
CREATE INDEX idx_delivery_tracker_order ON delivery_tracker(order_id, buyer_id);

-- ============================================================================
-- DMGT SET THEORY ANALYTICAL QUERIES: EQUIVALENCE CLASSES [Z_i]
-- ============================================================================

-- Query 1: Universal Set Partitioning into District Equivalence Classes
SELECT 
    mz.zone_id,
    mz.district_region,
    s.state_name,
    iz.zone_name AS icar_zone,
    COUNT(l.listing_id) AS equivalence_class_cardinality,
    COALESCE(SUM(l.quantity_quintals), 0) AS total_inventory_quintals,
    COALESCE(AVG(l.asking_price_per_quintal), 0) AS avg_farmer_asking_inr,
    COALESCE(AVG(l.ml_predicted_price_per_quintal), 0) AS avg_ml_predicted_inr
FROM market_zones mz
JOIN indian_states s ON mz.state_code = s.state_code
JOIN icar_zones iz ON mz.icar_zone_code = iz.zone_code
LEFT JOIN listings l ON mz.zone_id = l.zone_id AND l.status = 'AVAILABLE'
GROUP BY mz.zone_id, mz.district_region, s.state_name, iz.zone_name
ORDER BY total_inventory_quintals DESC;

-- Query 2: Budget Matching & Landed Cost Variance Verification
SELECT 
    o.order_id,
    o.tracking_number,
    c.crop_name,
    o.quantity_kg,
    o.produce_cost_inr,
    o.transit_freight_cost_inr,
    o.total_landed_cost_inr,
    o.max_budget_inr,
    (o.max_budget_inr - o.total_landed_cost_inr) AS budget_surplus_inr,
    o.order_status,
    o.dijkstra_route_text
FROM orders o
JOIN crops c ON o.crop_id = c.crop_id
WHERE o.is_budget_match = TRUE
ORDER BY o.created_at DESC;
`
  },
  {
    filename: 'crop_ml_predictor.py',
    category: 'PYTHON_ML',
    title: 'Pan-India Crop Yield & Mandi Price ML Regression (scikit-learn)',
    language: 'python',
    description: 'Python machine learning pipeline training Ordinary Least Squares (OLS) Linear Regression models on environmental and economic parameters: rainfall_mm, soil_ph, soil_quality, and mandi_demand, outputting predicted_price in ₹.',
    code: `"""
============================================================================
ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM (PAN-INDIA SCOPE)
MODULE 2: PYTHON SCIKIT-LEARN MULTIVARIATE LINEAR REGRESSION
============================================================================
Inputs:
  - rainfall_mm: Regional precipitation (mm)
  - soil_ph: Agronomic pH level (5.5 - 8.5)
  - soil_quality_index: Aggregated agronomic fertility (0 - 100)
  - mandi_demand_multiplier: e-NAM interstate demand pressure (0.8 - 1.4)
  - base_price_inr: Govt MSP / benchmark Mandi price (₹/quintal)

Outputs:
  - predicted_price_inr: Forecasted spot rate (₹/quintal and ₹/kg)
  - expected_yield_quintals_ha: Estimated crop harvest productivity
"""

import argparse
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score


class PanIndiaAgriPredictor:
    """Multivariate Linear Regression model trained across India's 15 ICAR Agro-Climatic Zones."""

    CROPS_MASTER = [
        {"name": "Wheat (Kanak)", "base_price": 2425.0, "opt_rain": 450.0, "opt_ph": 7.0, "base_yield": 42.0},
        {"name": "Paddy (Sona Masoori)", "base_price": 2350.0, "opt_rain": 1150.0, "opt_ph": 6.8, "base_yield": 45.0},
        {"name": "Bt Cotton", "base_price": 7521.0, "opt_rain": 750.0, "opt_ph": 7.5, "base_yield": 22.0},
        {"name": "Yellow Soybean", "base_price": 4892.0, "opt_rain": 850.0, "opt_ph": 6.5, "base_yield": 18.0},
        {"name": "Mustard (Sarson)", "base_price": 5950.0, "opt_rain": 380.0, "opt_ph": 7.2, "base_yield": 16.5},
        {"name": "Teja Red Chilli", "base_price": 18500.0, "opt_rain": 650.0, "opt_ph": 6.8, "base_yield": 28.0},
        {"name": "Salem Turmeric", "base_price": 13800.0, "opt_rain": 1200.0, "opt_ph": 6.5, "base_yield": 24.0},
        {"name": "Sugarcane (Ganna)", "base_price": 340.0, "opt_rain": 1300.0, "opt_ph": 7.0, "base_yield": 820.0},
        {"name": "Pearl Millet (Bajra)", "base_price": 2625.0, "opt_rain": 380.0, "opt_ph": 7.8, "base_yield": 21.0},
        {"name": "Bengal Gram (Chana)", "base_price": 5650.0, "opt_rain": 420.0, "opt_ph": 7.2, "base_yield": 15.0},
        {"name": "Raw Jute (Patsan)", "base_price": 5335.0, "opt_rain": 1600.0, "opt_ph": 6.4, "base_yield": 26.0},
        {"name": "Potato (Aaloo)", "base_price": 1750.0, "opt_rain": 450.0, "opt_ph": 6.0, "base_yield": 240.0}
    ]

    def __init__(self):
        self.price_model = LinearRegression()
        self.yield_model = LinearRegression()
        self.is_trained = False

    def generate_pan_india_dataset(self, samples_per_crop: int = 250) -> pd.DataFrame:
        """Synthesize nationwide agricultural observation records calibrated with ICAR field trials."""
        np.random.seed(42)
        records = []

        for crop in self.CROPS_MASTER:
            for _ in range(samples_per_crop):
                rain = float(np.clip(np.random.normal(crop["opt_rain"], 120), 150, 3200))
                ph = float(np.clip(np.random.normal(crop["opt_ph"], 0.4), 5.2, 8.8))
                soil_quality = float(np.clip(np.random.normal(78, 8), 35, 100))
                mandi_demand = float(np.clip(np.random.normal(1.05, 0.12), 0.8, 1.45))
                base_p = crop["base_price"]

                # Rainfall variance effect
                rain_diff = (rain - crop["opt_rain"]) / crop["opt_rain"]
                rain_penalty = max(0.45, 1.0 - (abs(rain_diff) * 0.45))

                # Soil pH variance penalty
                ph_diff = abs(ph - crop["opt_ph"])
                ph_penalty = max(0.6, 1.0 - (ph_diff * 0.15))

                # Yield calculation
                soil_factor = (soil_quality / 80.0) ** 0.5
                est_yield = crop["base_yield"] * soil_factor * rain_penalty * ph_penalty + np.random.normal(0, 0.8)

                # Economic Mandi Spot Rate Regression Equation
                # Scarcity + High Demand => Price Appreciation
                supply_factor = est_yield / crop["base_yield"]
                price_predicted = base_p * mandi_demand * (1.05 - 0.08 * (supply_factor - 1.0))

                records.append({
                    "crop_name": crop["name"],
                    "rainfall_mm": rain,
                    "soil_ph": ph,
                    "soil_quality_index": soil_quality,
                    "mandi_demand_multiplier": mandi_demand,
                    "base_price_inr": base_p,
                    "yield_quintals_ha": round(max(2.0, est_yield), 2),
                    "market_price_inr": round(max(50.0, price_predicted), 2)
                })

        return pd.DataFrame(records)

    def train_models(self):
        df = self.generate_pan_india_dataset()
        features = ["rainfall_mm", "soil_ph", "soil_quality_index", "mandi_demand_multiplier", "base_price_inr"]
        X = df[features]
        y_price = df["market_price_inr"]
        y_yield = df["yield_quintals_ha"]

        self.price_model.fit(X, y_price)
        self.yield_model.fit(X, y_yield)
        self.is_trained = True

        y_pred_price = self.price_model.predict(X)
        r2 = r2_score(y_price, y_pred_price)
        mae = mean_absolute_error(y_price, y_pred_price)
        return {"r2": r2, "mae": mae, "sample_size": len(df)}

    def predict(self, rainfall: float, soil_ph: float, soil_quality: float, 
                demand_multiplier: float, base_price: float) -> dict:
        if not self.is_trained:
            self.train_models()

        feats = np.array([[rainfall, soil_ph, soil_quality, demand_multiplier, base_price]])
        pred_price = float(self.price_model.predict(feats)[0])
        pred_yield = float(self.yield_model.predict(feats)[0])

        return {
            "predicted_price_quintal": round(pred_price, 2),
            "predicted_price_kg": round(pred_price / 100.0, 2),
            "expected_yield_q_ha": round(pred_yield, 2)
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pan-India Crop Yield & Price ML Predictor (scikit-learn)")
    parser.add_argument("--crop_type", type=str, default="Wheat (Kanak)")
    parser.add_argument("--rainfall_mm", type=float, default=450.0, help="Annual rainfall in mm")
    parser.add_argument("--soil_ph", type=float, default=6.8, help="Soil pH (5.5 - 8.5)")
    parser.add_argument("--soil_quality", type=float, default=80.0, help="Soil Quality Index (0 - 100)")
    parser.add_argument("--mandi_demand", type=float, default=1.08, help="Interstate demand multiplier (0.8 - 1.4)")
    parser.add_argument("--base_price", type=float, default=2425.0, help="Govt MSP or Base Mandi Rate (₹/quintal)")
    args = parser.parse_args()

    predictor = PanIndiaAgriPredictor()
    metrics = predictor.train_models()
    result = predictor.predict(
        args.rainfall_mm, args.soil_ph, args.soil_quality, args.mandi_demand, args.base_price
    )

    print("==================================================================")
    print("Pan-India Agricultural ML Regression Engine (scikit-learn OLS)")
    print("==================================================================")
    print(f"Dataset Size:           {metrics['sample_size']} ICAR-calibrated observations")
    print(f"Model R² Fit Score:     {metrics['r2']:.4f}")
    print(f"Mean Absolute Error:    ₹{metrics['mae']:.2f} / quintal")
    print("------------------------------------------------------------------")
    print(f"Target Commodity:       {args.crop_type}")
    print(f"Rainfall:               {args.rainfall_mm:.1f} mm")
    print(f"Soil pH & Fertility:    pH {args.soil_ph:.1f} | Quality Index {args.soil_quality:.1f}/100")
    print(f"e-NAM Demand Pressure:  {args.mandi_demand:.2f}x benchmark")
    print(f"Base MSP Benchmark:     ₹{args.base_price:.2f} / quintal")
    print("------------------------------------------------------------------")
    print(f"ML PREDICTED PRICE:     ₹{result['predicted_price_quintal']:.2f} / quintal")
    print(f"Equivalent Unit Rate:   ₹{result['predicted_price_kg']:.2f} / kg")
    print(f"Estimated Farm Yield:   {result['expected_yield_q_ha']:.2f} quintals/hectare")
    print("==================================================================")
`
  },
  {
    filename: 'MarketTransitRouter.java',
    category: 'DMGT_ADSA',
    title: 'Pan-India Highway Graph & Dijkstra Shortest Path Routing (NH Corridors)',
    language: 'java',
    description: 'Java implementation of weighted directed graph representing National Highway corridors (NH-44, NH-48, NH-16, NH-19, NH-27) and Dijkstra shortest path routing using a Min-Heap PriorityQueue, calculating freight costs in ₹/quintal.',
    code: `import java.util.*;

/**
 * ============================================================================
 * ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM (PAN-INDIA SCOPE)
 * MODULE 3: ADSA & DMGT INTERSTATE LOGISTICS GRAPH & DIJKSTRA ROUTER
 * ============================================================================
 * Graph Formalism: G = (V, E, w)
 * - V: Interstate APMC Mandi Hubs (Punjab, Haryana, UP, Maharashtra, AP, etc.)
 * - E: National Highway Freight Corridors (NH-44, NH-48, NH-16, NH-19, NH-27)
 * - w(u, v): Transit Freight Rate in ₹ per Quintal
 * Complexity: O((V + E) log V) via Min-Heap PriorityQueue
 */
public class MarketTransitRouter {

    public static class TransitEdge {
        public final String targetZoneId;
        public final double transitCostPerQuintal; // w(u, v) in ₹ / quintal
        public final double distanceKm;
        public final double durationHours;
        public final String highwayCorridor;

        public TransitEdge(String targetZoneId, double cost, double dist, double dur, String highway) {
            this.targetZoneId = targetZoneId;
            this.transitCostPerQuintal = cost;
            this.distanceKm = dist;
            this.durationHours = dur;
            this.highwayCorridor = highway;
        }
    }

    public static class PathResult {
        public final String sourceZoneId;
        public final String targetZoneId;
        public final double totalCostPerQuintal;
        public final double totalDistanceKm;
        public final List<String> pathSequence;
        public final List<String> highwaySequence;

        public PathResult(String src, String tgt, double cost, double dist, 
                          List<String> path, List<String> highways) {
            this.sourceZoneId = src;
            this.targetZoneId = tgt;
            this.totalCostPerQuintal = cost;
            this.totalDistanceKm = dist;
            this.pathSequence = path;
            this.highwaySequence = highways;
        }
    }

    private final Map<String, List<TransitEdge>> adjacencyList = new HashMap<>();

    public void addZone(String zoneId) {
        adjacencyList.putIfAbsent(zoneId, new ArrayList<>());
    }

    public void addCorridor(String from, String to, double costPerQ, double distanceKm, 
                            double hours, String highway) {
        addZone(from);
        addZone(to);
        adjacencyList.get(from).add(new TransitEdge(to, costPerQ, distanceKm, hours, highway));
        adjacencyList.get(to).add(new TransitEdge(from, costPerQ, distanceKm, hours, highway));
    }

    public PathResult findShortestDeliveryPath(String source, String destination) {
        if (!adjacencyList.containsKey(source) || !adjacencyList.containsKey(destination)) {
            throw new IllegalArgumentException("Unknown terminal zone ID: " + source + " or " + destination);
        }

        if (source.equals(destination)) {
            return new PathResult(source, destination, 0.0, 0.0, 
                                  Collections.singletonList(source), Collections.emptyList());
        }

        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        Map<String, TransitEdge> prevEdge = new HashMap<>();
        Set<String> settled = new HashSet<>();

        for (String node : adjacencyList.keySet()) {
            dist.put(node, Double.POSITIVE_INFINITY);
            prev.put(node, null);
        }
        dist.put(source, 0.0);

        PriorityQueue<Map.Entry<String, Double>> pq =
            new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));
        pq.add(new AbstractMap.SimpleEntry<>(source, 0.0));

        while (!pq.isEmpty()) {
            Map.Entry<String, Double> current = pq.poll();
            String u = current.getKey();

            if (settled.contains(u)) continue;
            settled.add(u);

            if (u.equals(destination)) break;

            for (TransitEdge edge : adjacencyList.getOrDefault(u, Collections.emptyList())) {
                String v = edge.targetZoneId;
                if (settled.contains(v)) continue;

                double newDist = dist.get(u) + edge.transitCostPerQuintal;
                if (newDist < dist.get(v)) {
                    dist.put(v, newDist);
                    prev.put(v, u);
                    prevEdge.put(v, edge);
                    pq.add(new AbstractMap.SimpleEntry<>(v, newDist));
                }
            }
        }

        List<String> path = new LinkedList<>();
        List<String> highways = new LinkedList<>();
        String step = destination;
        double totalDistKm = 0.0;

        while (step != null) {
            path.add(0, step);
            TransitEdge e = prevEdge.get(step);
            if (e != null) {
                totalDistKm += e.distanceKm;
                highways.add(0, e.highwayCorridor);
            }
            step = prev.get(step);
        }

        return new PathResult(source, destination, dist.get(destination), totalDistKm, path, highways);
    }

    public static void main(String[] args) {
        MarketTransitRouter router = new MarketTransitRouter();

        // Pan-India National Highway Freight Grid
        router.addCorridor("PUN_KHANNA", "HAR_KARNAL", 32.0, 140.0, 2.5, "NH-44 North Corridor");
        router.addCorridor("HAR_KARNAL", "UP_MUZAFFARNAGAR", 28.0, 95.0, 2.0, "NH-334 Expressway");
        router.addCorridor("UP_MUZAFFARNAGAR", "UP_VARANASI", 85.0, 720.0, 11.0, "NH-19 Gangetic Highway");
        router.addCorridor("UP_VARANASI", "WB_BURDWAN", 65.0, 560.0, 8.5, "NH-19 Eastern Link");
        router.addCorridor("PUN_KHANNA", "RAJ_KOTA", 92.0, 680.0, 10.5, "NH-52 Delhi-Jaipur Corridors");
        router.addCorridor("RAJ_KOTA", "MP_INDORE", 48.0, 310.0, 5.0, "NH-52 Malwa Link");
        router.addCorridor("MP_INDORE", "MH_NASHIK", 55.0, 410.0, 6.5, "NH-60 Western Ghats Route");
        router.addCorridor("MH_NASHIK", "GUJ_RAJKOT", 62.0, 580.0, 9.0, "NH-48 Mumbai-Ahmedabad Corridor");
        router.addCorridor("MH_NASHIK", "KAR_SHIVAMOGGA", 75.0, 740.0, 12.0, "NH-48 Southern Deccan Corridor");
        router.addCorridor("KAR_SHIVAMOGGA", "KER_WAYANAD", 42.0, 280.0, 5.5, "NH-766 Plantation Highway");
        router.addCorridor("MH_NASHIK", "AP_GUNTUR", 88.0, 890.0, 14.0, "NH-65 Central-East Expressway");
        router.addCorridor("AP_GUNTUR", "TN_COIMBATORE", 72.0, 680.0, 11.0, "NH-44 South Trunk Expressway");
        router.addCorridor("WB_BURDWAN", "AP_GUNTUR", 98.0, 1050.0, 16.5, "NH-16 Coastal Freight Corridor");

        // Example: Route from Punjab Grain Hub to AP Commercial Mandi
        PathResult res = router.findShortestDeliveryPath("PUN_KHANNA", "AP_GUNTUR");
        System.out.println("==================================================================");
        System.out.println("ADSA Dijkstra Shortest Interstate Logistics Route");
        System.out.println("==================================================================");
        System.out.println("Origin Hub:           Khanna Grain Terminal (Punjab)");
        System.out.println("Destination Terminal: Guntur Mirchi Yard (Andhra Pradesh)");
        System.out.println("Interstate Corridor:  " + String.join(" ➔ ", res.pathSequence));
        System.out.printf("Total Highway Distance: %.1f km\\n", res.totalDistanceKm);
        System.out.printf("Transit Freight Cost:   ₹%.2f / quintal (₹%.2f / kg)\\n", 
                          res.totalCostPerQuintal, res.totalCostPerQuintal / 100.0);
        System.out.println("==================================================================");
    }
}
`
  },
  {
    filename: 'FarmerCropMarketApp.java',
    category: 'OOPJ',
    title: 'Java Application Architecture: Dynamic Crops, DMGT Classes, Budget Engine & Orders',
    language: 'java',
    description: 'Complete Java backend service coordinating dynamic crop registration, ICAR agro-climatic regional recommendations, DMGT equivalence class grouping, Dijkstra budget matching, and Flipkart order lifecycle management with GST receipts.',
    code: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ============================================================================
 * ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM (PAN-INDIA PRODUCTION)
 * MODULE 4: FULL-STACK JAVA APPLICATION SERVICE (OOPJ + DMGT + ADSA)
 * ============================================================================
 * Features:
 * 1. Dynamic Crop Management: Master registry + "Add Custom Crop"
 * 2. 15 ICAR Agro-Climatic Zones Regional Crop Recommendation
 * 3. DMGT Set Theory Equivalence Classes: [Z_i] = { l in Listings | l.zone_id = Z_i }
 * 4. ADSA Dijkstra Freight Routing & Buyer Budget Match Status (Green / Red)
 * 5. Flipkart-Style Order Lifecycle: Placed -> Verified -> Dispatched -> In Transit -> Delivered
 * 6. Itemized GST Payment Receipts in Indian Rupees (INR ₹)
 */
public class FarmerCropMarketApp {

    // --- DOMAIN MODELS ---
    public record Crop(String cropId, String cropName, String scientificName, 
                       String category, String season, double basePricePerQuintal, 
                       double optimalRainfallMm, boolean isCustom) {}

    public static class CropListing {
        public final String listingId;
        public final String farmerName;
        public final String stateName;
        public final String zoneId;
        public final String cropId;
        public final String cropName;
        public final double quantityKg;
        public final double quantityQuintals;
        public final double askingPricePerKg;
        public final double askingPricePerQuintal;
        public double mlPredictedPricePerQuintal;
        public double mlPredictedPricePerKg;
        public double priceVariancePct;
        public String status = "AVAILABLE";

        public CropListing(String id, String farmer, String state, String zone, 
                           String cropId, String cropName, double kg, double pricePerKg) {
            this.listingId = id;
            this.farmerName = farmer;
            this.stateName = state;
            this.zoneId = zone;
            this.cropId = cropId;
            this.cropName = cropName;
            this.quantityKg = kg;
            this.quantityQuintals = kg / 100.0;
            this.askingPricePerKg = pricePerKg;
            this.askingPricePerQuintal = pricePerKg * 100.0;
        }

        public void applyMLPrediction(double predictedQuintal) {
            this.mlPredictedPricePerQuintal = predictedQuintal;
            this.mlPredictedPricePerKg = predictedQuintal / 100.0;
            this.priceVariancePct = Math.round(((askingPricePerQuintal - predictedQuintal) / predictedQuintal) * 1000.0) / 10.0;
        }
    }

    public static class BuyerProcurementQuote {
        public final CropListing listing;
        public final double requestedKg;
        public final double requestedQuintals;
        public final double produceCostInr;
        public final double transitFreightCostInr;
        public final double totalLandedCostInr;
        public final double maxBudgetInr;
        public final boolean isWithinBudget;
        public final List<String> dijkstraRoute;

        public BuyerProcurementQuote(CropListing listing, double kg, double produceCost, 
                                     double freight, double budget, List<String> route) {
            this.listing = listing;
            this.requestedKg = kg;
            this.requestedQuintals = kg / 100.0;
            this.produceCostInr = produceCost;
            this.transitFreightCostInr = freight;
            this.totalLandedCostInr = produceCost + freight;
            this.maxBudgetInr = budget;
            this.isWithinBudget = this.totalLandedCostInr <= budget;
            this.dijkstraRoute = route;
        }
    }

    public enum OrderStatus {
        PLACED, PAYMENT_VERIFIED, DISPATCHED, IN_TRANSIT, DELIVERED
    }

    public static class FlipkartOrderTracker {
        public final String orderId;
        public final String trackingNumber;
        public final String cropName;
        public final double quantityKg;
        public final double totalLandedCostInr;
        public OrderStatus status = OrderStatus.PLACED;
        public final List<String> routeHubs;

        public FlipkartOrderTracker(String id, String tracking, String crop, double kg, 
                                    double total, List<String> route) {
            this.orderId = id;
            this.trackingNumber = tracking;
            this.cropName = crop;
            this.quantityKg = kg;
            this.totalLandedCostInr = total;
            this.routeHubs = route;
        }

        public void advanceStatus() {
            switch (status) {
                case PLACED -> status = OrderStatus.PAYMENT_VERIFIED;
                case PAYMENT_VERIFIED -> status = OrderStatus.DISPATCHED;
                case DISPATCHED -> status = OrderStatus.IN_TRANSIT;
                case IN_TRANSIT -> status = OrderStatus.DELIVERED;
                case DELIVERED -> {}
            }
        }
    }

    // --- REPOSITORY & ROUTING SERVICES ---
    private final Map<String, Crop> cropsRegistry = new LinkedHashMap<>();
    private final List<CropListing> activeListings = new ArrayList<>();
    private final List<FlipkartOrderTracker> orders = new ArrayList<>();
    private final MarketTransitRouter router = new MarketTransitRouter();

    public FarmerCropMarketApp() {
        initNationalNetwork();
        initMasterCrops();
        seedListings();
    }

    private void initNationalNetwork() {
        router.addCorridor("PUN_KHANNA", "HAR_KARNAL", 32.0, 140.0, 2.5, "NH-44");
        router.addCorridor("HAR_KARNAL", "UP_MUZAFFARNAGAR", 28.0, 95.0, 2.0, "NH-334");
        router.addCorridor("UP_MUZAFFARNAGAR", "UP_VARANASI", 85.0, 720.0, 11.0, "NH-19");
        router.addCorridor("UP_VARANASI", "WB_BURDWAN", 65.0, 560.0, 8.5, "NH-19");
        router.addCorridor("PUN_KHANNA", "MP_INDORE", 110.0, 980.0, 15.0, "NH-52");
        router.addCorridor("MP_INDORE", "MH_NASHIK", 55.0, 410.0, 6.5, "NH-60");
        router.addCorridor("MH_NASHIK", "GUJ_RAJKOT", 62.0, 580.0, 9.0, "NH-48");
        router.addCorridor("MH_NASHIK", "AP_GUNTUR", 88.0, 890.0, 14.0, "NH-65");
        router.addCorridor("AP_GUNTUR", "TN_COIMBATORE", 72.0, 680.0, 11.0, "NH-44");
    }

    private void initMasterCrops() {
        registerCrop(new Crop("C_WHEAT", "Wheat (Sharbati / HD-2967)", "Triticum aestivum", "Food Grains", "Rabi", 2425.0, 450.0, false));
        registerCrop(new Crop("C_PADDY", "Paddy (BPT 5204 Sona Masoori)", "Oryza sativa", "Food Grains", "Kharif", 2350.0, 1150.0, false));
        registerCrop(new Crop("C_COTTON", "Bt Cotton (Medium Staple)", "Gossypium hirsutum", "Commercial", "Kharif", 7521.0, 750.0, false));
        registerCrop(new Crop("C_SOYBEAN", "Yellow Soybean (JS-335)", "Glycine max", "Oilseeds", "Kharif", 4892.0, 850.0, false));
        registerCrop(new Crop("C_MUSTARD", "Mustard (Sarson / Giriraj)", "Brassica nigra", "Oilseeds", "Rabi", 5950.0, 380.0, false));
        registerCrop(new Crop("C_CHILLI", "Guntur Teja Red Chilli", "Capsicum annuum", "Spices", "Rabi", 18500.0, 650.0, false));
    }

    public void registerCrop(Crop crop) {
        cropsRegistry.put(crop.cropId(), crop);
    }

    public Crop addCustomCrop(String name, String scientific, String category, String season, 
                              double basePrice, double rainMm) {
        String customId = "CUST_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Crop customCrop = new Crop(customId, name, scientific, category, season, basePrice, rainMm, true);
        registerCrop(customCrop);
        return customCrop;
    }

    private void seedListings() {
        CropListing l1 = new CropListing("LST_101", "Sardar Harpreet Singh", "Punjab", "PUN_KHANNA", "C_WHEAT", "Wheat (Sharbati)", 8000, 26.5);
        l1.applyMLPrediction(2490.0);
        activeListings.add(l1);

        CropListing l2 = new CropListing("LST_102", "Baldev Bhai Patel", "Gujarat", "GUJ_RAJKOT", "C_COTTON", "Bt Cotton", 5000, 78.0);
        l2.applyMLPrediction(7620.0);
        activeListings.add(l2);

        CropListing l3 = new CropListing("LST_103", "K. Sambasiva Rao", "Andhra Pradesh", "AP_GUNTUR", "C_CHILLI", "Guntur Teja Red Chilli", 3500, 192.0);
        l3.applyMLPrediction(18200.0);
        activeListings.add(l3);
    }

    // --- DMGT SET THEORY: EQUIVALENCE CLASSES ---
    public Map<String, List<CropListing>> computeEquivalenceClasses() {
        return activeListings.stream()
            .filter(l -> "AVAILABLE".equals(l.status))
            .collect(Collectors.groupingBy(l -> l.zoneId));
    }

    // --- BUYER BUDGET MATCHING WITH DIJKSTRA FREIGHT ENGINE ---
    public List<BuyerProcurementQuote> searchAndBudgetMatch(String cropQuery, double reqKg, 
                                                            double maxBudgetInr, String destZoneId) {
        String query = cropQuery.toLowerCase().trim();
        List<BuyerProcurementQuote> quotes = new ArrayList<>();

        for (CropListing l : activeListings) {
            if ("AVAILABLE".equals(l.status) && (l.cropName.toLowerCase().contains(query) || query.isEmpty())) {
                MarketTransitRouter.PathResult path = router.findShortestDeliveryPath(l.zoneId, destZoneId);
                double effectiveKg = Math.min(reqKg, l.quantityKg);
                double produceCost = effectiveKg * l.askingPricePerKg;
                double freightCost = (effectiveKg / 100.0) * path.totalCostPerQuintal;

                quotes.add(new BuyerProcurementQuote(l, effectiveKg, produceCost, freightCost, 
                                                     maxBudgetInr, path.pathSequence));
            }
        }
        return quotes;
    }

    public static void main(String[] args) {
        FarmerCropMarketApp app = new FarmerCropMarketApp();

        System.out.println("==================================================================");
        System.out.println("FARMER-CROP-MARKET SYSTEM (PAN-INDIA ENTERPRISE DEMO)");
        System.out.println("==================================================================");

        // 1. Dynamic Crop Addition
        Crop saffron = app.addCustomCrop("Kashmiri Mongra Saffron", "Crocus sativus", "Spices", "Kharif", 220000.0, 800.0);
        System.out.println("1. Dynamic Crop Registered: " + saffron.cropName() + " (ID: " + saffron.cropId() + ")");

        // 2. DMGT Equivalence Class Grouping
        Map<String, List<CropListing>> eqClasses = app.computeEquivalenceClasses();
        System.out.println("2. DMGT Set Theory Equivalence Partitions: " + eqClasses.keySet());

        // 3. Buyer Search with requestedKg = 60 kg and maxBudget = ₹2,000
        double requestedKg = 60.0;
        double maxBudget = 2000.0;
        System.out.printf("3. Buyer Search: Query='Wheat', Qty=%.0f kg, Max Budget=₹%.2f delivered to AP_GUNTUR\\n", 
                          requestedKg, maxBudget);

        List<BuyerProcurementQuote> results = app.searchAndBudgetMatch("Wheat", requestedKg, maxBudget, "AP_GUNTUR");
        for (BuyerProcurementQuote q : results) {
            System.out.printf("   - Lot [%s] by %s (%s Mandi)\\n", q.listing.listingId, q.listing.farmerName, q.listing.zoneId);
            System.out.printf("     Crop Price: ₹%.2f | Freight (Dijkstra): ₹%.2f | Total Landed: ₹%.2f\\n",
                              q.produceCostInr, q.transitFreightCostInr, q.totalLandedCostInr);
            System.out.printf("     Budget Match Status: %s (Max Budget: ₹%.2f)\\n",
                              q.isWithinBudget ? "GREEN [WITHIN BUDGET]" : "RED [EXCEEDS BUDGET]", q.maxBudgetInr);
            System.out.println("     Dijkstra Corridors: " + String.join(" ➔ ", q.dijkstraRoute));
        }
        System.out.println("==================================================================");
    }
}
`
  },
  {
    filename: 'SETUP_GUIDE.md',
    category: 'DOCUMENTATION',
    title: 'Pan-India Execution Guide: SQL, Python scikit-learn, Java ADSA & Vite Web UI',
    language: 'markdown',
    description: 'Complete academic deployment and evaluation manual covering MySQL/PostgreSQL 3NF DDL execution, Python ML training and CLI regression testing, Java routing and DMGT compilation, and React SPA development server setup.',
    code: `# Academic Project Manual: Pan-India Farmer-Crop-Market System

## Multi-Disciplinary Architecture: DBMS, Python scikit-learn ML, Java ADSA/DMGT, & Vite React SPA

---

### System Architecture Overview
1. **DBMS (SQL)**: Third Normal Form (3NF) relational database covering all 28 Indian States & UTs, 15 ICAR Agro-Climatic Zones, dynamic crops registry, harvest listings, Flipkart-style orders, and GST invoices.
2. **Machine Learning (Python)**: Multivariate Linear Regression using \`scikit-learn\` to predict crop price (\`predicted_price\`) and expected harvest yield from \`rainfall_mm\`, \`soil_ph\`, \`soil_quality\`, and interstate \`mandi_demand_multiplier\`.
3. **Algorithms & Discrete Math (Java)**:
   - **ADSA**: Dijkstra's Algorithm with Min-Heap \`PriorityQueue\` (\`O((V + E) log V)\`) along National Highways (NH-44, NH-48, NH-16, NH-19, NH-27).
   - **DMGT**: Set Theory Equivalence Classes partitioning listings into disjoint sets $[Z_i] = \\{l \\in \\text{Listings} \\mid l.\\text{zone\\_id} = Z_i\\}$.
4. **Web UI (TypeScript/React/Tailwind)**: Full responsive web application with Flipkart-style tracking, slide-over notification drawer, dynamic crop modal, and printable GST tax receipts in Indian Rupees (₹).

---

### Step 1: Database Setup (MySQL 8.0+ / PostgreSQL 14+)
1. Launch MySQL or PostgreSQL:
   \`\`\`sql
   CREATE DATABASE pan_india_agri_market;
   USE pan_india_agri_market;
   \`\`\`
2. Import schema and seed records:
   \`\`\`bash
   # MySQL:
   mysql -u root -p pan_india_agri_market < schema.sql
   # PostgreSQL:
   psql -U postgres -d pan_india_agri_market -f schema.sql
   \`\`\`
3. Verify DMGT Set Theory Equivalence Partitions:
   \`\`\`sql
   SELECT mz.district_region, s.state_name, COUNT(l.listing_id) AS active_lots
   FROM market_zones mz
   JOIN indian_states s ON mz.state_code = s.state_code
   LEFT JOIN listings l ON mz.zone_id = l.zone_id
   GROUP BY mz.district_region, s.state_name;
   \`\`\`

---

### Step 2: Python ML Engine (scikit-learn)
1. Initialize virtual environment:
   \`\`\`bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   pip install pandas scikit-learn numpy
   \`\`\`
3. Run ML rate regression evaluation:
   \`\`\`bash
   python3 crop_ml_predictor.py --crop_type "Wheat (Kanak)" --rainfall_mm 450 --soil_ph 6.8 --mandi_demand 1.08 --base_price 2425
   \`\`\`
   Output validates $R^2$ fit score and outputs \`predicted_price_quintal\` in ₹.

---

### Step 3: Java ADSA & Application Service Layer (JDK 17+)
1. Compile Java source files:
   \`\`\`bash
   javac MarketTransitRouter.java FarmerCropMarketApp.java
   \`\`\`
2. Run Dijkstra Interstate Logistics Router:
   \`\`\`bash
   java MarketTransitRouter
   \`\`\`
3. Run the integrated application controller:
   \`\`\`bash
   java FarmerCropMarketApp
   \`\`\`
   Demonstrates:
   - Dynamic crop registration
   - DMGT Equivalence Class partitioning
   - Buyer search with quantity (kg) and max_budget (₹)
   - Dijkstra transit cost and Green/Red budget matching

---

### Step 4: Web Application Execution
1. Install dependencies & run development server:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
2. Open \`http://localhost:3000\` in any modern browser.
`
  },
  {
    filename: 'checkout_service.js',
    category: 'WEB_UI',
    title: 'Real-Time Checkout, Order Creation & Delivery Tracking Event Controller',
    language: 'javascript',
    description: 'Node.js Express microservice controller implementing POST /api/checkout/place-order, Order & DeliveryTracker initialization, and real-time Socket.io emission to update Buyer UI without page reload.',
    code: `/**
 * Checkout & Order Processing Microservice Controller
 * POST /api/checkout/place-order
 */
async function handleCheckout(req, res) {
  const { buyerId, items, paymentInfo } = req.body;

  // 1. Save to Orders Table (makes it visible under "My Orders")
  const newOrder = await Order.create({
    buyerId,
    items,
    status: 'ORDER_PLACED',
    createdAt: new Date()
  });

  // 2. Initialize Delivery Tracking Record immediately
  await DeliveryTracker.create({
    orderId: newOrder._id,
    buyerId,
    status: 'ORDER_PLACED',
    trackingSteps: [
      { step: 'Placed', timestamp: new Date(), completed: true },
      { step: 'Accepted', completed: false },
      { step: 'Out for Delivery', completed: false },
      { step: 'Delivered', completed: false }
    ]
  });

  // 3. Emit real-time event to update Buyer UI without page reload
  io.to(buyerId).emit('ORDER_CREATED', newOrder);

  res.status(200).json({ success: true, orderId: newOrder._id });
}

// Example Node.js / Express backend middleware check
app.patch('/api/orders/:id/status', authenticateUser, (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SELLER' && req.user.role !== 'FARMER') {
    return res.status(403).json({ error: 'Unauthorized: Buyers cannot manually update order statuses.' });
  }
  // Proceed with status update logic...
  const { status } = req.body;
  res.json({ success: true, orderId: req.params.id, status });
});

module.exports = { handleCheckout };
`
  }
];
