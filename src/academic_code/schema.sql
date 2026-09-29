-- ============================================================================
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

-- Table 8: LISTINGS (Harvest Lots Listed at Official Mandi Market Price predicted_price)
CREATE TABLE listings (
    listing_id VARCHAR(30) PRIMARY KEY,
    farmer_id VARCHAR(25) NOT NULL,
    crop_id VARCHAR(25) NOT NULL,
    zone_id VARCHAR(25) NOT NULL,
    quantity_quintals DECIMAL(10, 2) NOT NULL CHECK (quantity_quintals > 0),
    quantity_available_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_available_kg > 0),
    predicted_price DECIMAL(10, 2) NOT NULL CHECK (predicted_price > 0), -- Official Mandi Rate (₹/Quintal) from Python ML
    asking_price_per_quintal DECIMAL(10, 2) NOT NULL CHECK (asking_price_per_quintal > 0), -- Equals predicted_price (Zero Markups)
    ml_predicted_price_per_quintal DECIMAL(10, 2) NOT NULL CHECK (ml_predicted_price_per_quintal > 0),
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
        CHECK (order_status IN ('PLACED', 'PAID', 'PACKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
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

-- Query 3: Real-Time Demand Aggregation (Most Demanded Crops by Buyer Volume & Price Velocity)
SELECT 
    c.crop_id,
    c.crop_name,
    c.category,
    COUNT(o.order_id) AS total_buyer_orders,
    COALESCE(SUM(o.quantity_kg), 0) AS total_kg_purchased,
    COALESCE(AVG(o.produce_cost_inr / o.quantity_kg), c.base_price_per_quintal / 100.0) AS avg_realized_price_per_kg,
    COALESCE(SUM(o.total_landed_cost_inr), 0) AS gross_merchandise_value_inr,
    CASE 
        WHEN COUNT(o.order_id) >= 2 THEN 'HIGH_DEMAND'
        ELSE 'MODERATE_TRADE'
    END AS demand_classification
FROM crops c
LEFT JOIN orders o ON c.crop_id = o.crop_id AND o.order_status != 'CANCELLED'
GROUP BY c.crop_id, c.crop_name, c.category, c.base_price_per_quintal
ORDER BY total_buyer_orders DESC, total_kg_purchased DESC;
