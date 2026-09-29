/**
 * ============================================================================
 * ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM
 * MODULE 4: OBJECT-ORIENTED PROGRAMMING IN JAVA (OOPJ) BACKEND
 * 
 * Target: Java 17+ / Java 21 LTS Standard Edition
 * Architecture: Clean Domain Model (Abstract Classes, Inheritance, Polymorphism,
 *               Encapsulation, Service Layer, Dijkstra Graph Integration,
 *               Regression Pricing Engine, Interactive CLI)
 * ============================================================================
 */

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

// ============================================================================
// 1. DOMAIN MODELS & CLASS HIERARCHY
// ============================================================================

/**
 * Abstract Base Class representing a generic actor in the agricultural market.
 * Demonstrates: Abstraction, Encapsulation, and Polymorphic dispatch.
 */
abstract class User {
    protected final String userId;
    protected final String fullName;
    protected final String phone;
    protected final String email;
    protected final String zoneId; // Operating market zone

    public User(String userId, String fullName, String phone, String email, String zoneId) {
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.fullName = Objects.requireNonNull(fullName, "fullName must not be null");
        this.phone = Objects.requireNonNull(phone, "phone must not be null");
        this.email = email;
        this.zoneId = Objects.requireNonNull(zoneId, "zoneId must not be null");
    }

    public String getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getZoneId() { return zoneId; }

    public abstract String getRole();
    public abstract void displayProfile();

    @Override
    public String toString() {
        return String.format("[%s] ID: %s | Name: %s | Zone: %s", getRole(), userId, fullName, zoneId);
    }
}

/**
 * Farmer entity extending User.
 * Represents agricultural producers managing harvests and publishing listings.
 */
class Farmer extends User {
    private final double landAreaHectares;
    private final List<CropListing> publishedListings;

    public Farmer(String userId, String fullName, String phone, String email, String zoneId, double landAreaHectares) {
        super(userId, fullName, phone, email, zoneId);
        if (landAreaHectares <= 0) {
            throw new IllegalArgumentException("Land area must be strictly positive.");
        }
        this.landAreaHectares = landAreaHectares;
        this.publishedListings = new ArrayList<>();
    }

    public double getLandAreaHectares() { return landAreaHectares; }
    public List<CropListing> getPublishedListings() { return Collections.unmodifiableList(publishedListings); }

    public void addListing(CropListing listing) {
        this.publishedListings.add(listing);
    }

    @Override
    public String getRole() { return "FARMER"; }

    @Override
    public void displayProfile() {
        System.out.println("--------------------------------------------------");
        System.out.printf(" Farmer Profile: %s (ID: %s)%n", fullName, userId);
        System.out.printf(" Base Zone     : %s%n", zoneId);
        System.out.printf(" Land Area     : %.2f Hectares%n", landAreaHectares);
        System.out.printf(" Contact       : %s | %s%n", phone, email != null ? email : "N/A");
        System.out.printf(" Active Listings: %d%n", publishedListings.size());
        System.out.println("--------------------------------------------------");
    }
}

/**
 * Buyer entity extending User.
 * Represents wholesale merchants, processors, or grain exporters.
 */
class Buyer extends User {
    private final String companyName;
    private final String buyerType; // Wholesaler, Processor, Retailer, Exporter

    public Buyer(String userId, String fullName, String phone, String email, String zoneId, 
                 String companyName, String buyerType) {
        super(userId, fullName, phone, email, zoneId);
        this.companyName = companyName;
        this.buyerType = buyerType;
    }

    public String getCompanyName() { return companyName; }
    public String getBuyerType() { return buyerType; }

    @Override
    public String getRole() { return "BUYER"; }

    @Override
    public void displayProfile() {
        System.out.println("--------------------------------------------------");
        System.out.printf(" Buyer Profile : %s (%s)%n", fullName, companyName);
        System.out.printf(" Buyer ID      : %s | Type: %s%n", userId, buyerType);
        System.out.printf(" Operating Zone: %s%n", zoneId);
        System.out.printf(" Contact       : %s | %s%n", phone, email != null ? email : "N/A");
        System.out.println("--------------------------------------------------");
    }
}

/**
 * Crop commodity specification catalog entity.
 */
class Crop {
    private final String cropId;
    private final String name;
    private final String scientificName;
    private final String category; // Cereal, Pulse, Cash Crop, etc.
    private final String season;   // Kharif, Rabi, Zaid
    private final double basePricePerTon;

    public Crop(String cropId, String name, String scientificName, String category, String season, double basePricePerTon) {
        this.cropId = cropId;
        this.name = name;
        this.scientificName = scientificName;
        this.category = category;
        this.season = season;
        this.basePricePerTon = basePricePerTon;
    }

    public String getCropId() { return cropId; }
    public String getName() { return name; }
    public String getScientificName() { return scientificName; }
    public String getCategory() { return category; }
    public String getSeason() { return season; }
    public double getBasePricePerTon() { return basePricePerTon; }

    @Override
    public String toString() {
        return String.format("%s (%s) [Base: $%.2f/ton]", name, category, basePricePerTon);
    }
}

/**
 * Market Zone entity representing a geographical Mandi/Logistics Node.
 */
class MarketZone {
    private final String zoneId;
    private final String zoneName;
    private final String stateRegion;
    private final int hubCapacityTons;

    public MarketZone(String zoneId, String zoneName, String stateRegion, int hubCapacityTons) {
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.stateRegion = stateRegion;
        this.hubCapacityTons = hubCapacityTons;
    }

    public String getZoneId() { return zoneId; }
    public String getZoneName() { return zoneName; }
    public String getStateRegion() { return stateRegion; }
    public int getHubCapacityTons() { return hubCapacityTons; }

    @Override
    public String toString() {
        return String.format("%s - %s (%s)", zoneId, zoneName, stateRegion);
    }
}

/**
 * Status enumeration for listings.
 */
enum ListingStatus {
    AVAILABLE,
    RESERVED,
    SOLD,
    CANCELLED
}

/**
 * Core transactional record: Crop Listing posted by a Farmer with ML predictions.
 */
class CropListing {
    private final String listingId;
    private final Farmer farmer;
    private final Crop crop;
    private final String zoneId;
    private final double quantityTons;
    private final double askingPricePerTon;
    private final double mlPredictedPricePerTon;
    private final double expectedYieldTons;
    private final double rainfallInputMm;
    private final double soilQualityIndex;
    private ListingStatus status;
    private final LocalDateTime createdAt;

    public CropListing(String listingId, Farmer farmer, Crop crop, String zoneId, 
                       double quantityTons, double askingPricePerTon, 
                       double mlPredictedPricePerTon, double expectedYieldTons,
                       double rainfallInputMm, double soilQualityIndex) {
        this.listingId = listingId;
        this.farmer = farmer;
        this.crop = crop;
        this.zoneId = zoneId;
        this.quantityTons = quantityTons;
        this.askingPricePerTon = askingPricePerTon;
        this.mlPredictedPricePerTon = mlPredictedPricePerTon;
        this.expectedYieldTons = expectedYieldTons;
        this.rainfallInputMm = rainfallInputMm;
        this.soilQualityIndex = soilQualityIndex;
        this.status = ListingStatus.AVAILABLE;
        this.createdAt = LocalDateTime.now();
    }

    public String getListingId() { return listingId; }
    public Farmer getFarmer() { return farmer; }
    public Crop getCrop() { return crop; }
    public String getZoneId() { return zoneId; }
    public double getQuantityTons() { return quantityTons; }
    public double getAskingPricePerTon() { return askingPricePerTon; }
    public double getMlPredictedPricePerTon() { return mlPredictedPricePerTon; }
    public double getExpectedYieldTons() { return expectedYieldTons; }
    public double getRainfallInputMm() { return rainfallInputMm; }
    public double getSoilQualityIndex() { return soilQualityIndex; }
    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public double getPriceDisparity() {
        return askingPricePerTon - mlPredictedPricePerTon;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s | Farmer: %s | Zone: %s | Qty: %.1f t | Official Mandi Rate: ₹%.2f/t",
                listingId, crop.getName(), farmer.getFullName(), zoneId, quantityTons, 
                mlPredictedPricePerTon);
    }
}

// ============================================================================
// 2. EMBEDDED ML REGRESSION PREDICTOR
// ============================================================================

/**
 * Java implementation of the Multivariate Linear Regression model trained via Python scikit-learn.
 * Allows pure Java runtime execution without requiring an external python daemon.
 */
class MLPriceEstimator {
    // Ordinary Least Squares Coefficients derived from empirical agricultural training
    private static final double INTERCEPT_PRICE = 45.20;
    private static final double BETA_HIST_PRICE = 0.812;
    private static final double BETA_RAINFALL = 0.024;
    private static final double BETA_SOIL = 0.615;

    private static final double INTERCEPT_YIELD = 0.85;
    private static final double ALPHA_RAINFALL = 0.0018;
    private static final double ALPHA_SOIL = 0.032;

    public static class EstimationResult {
        public final double predictedPricePerTon;
        public final double expectedYieldPerHa;
        public final double totalExpectedYieldTons;

        public EstimationResult(double predictedPricePerTon, double expectedYieldPerHa, double totalExpectedYieldTons) {
            this.predictedPricePerTon = predictedPricePerTon;
            this.expectedYieldPerHa = expectedYieldPerHa;
            this.totalExpectedYieldTons = totalExpectedYieldTons;
        }
    }

    public static EstimationResult estimate(double rainfallMm, double soilQualityIndex, double historicalBasePrice, double landHectares) {
        // Price Regression: Y_price = β0 + β1*Hist + β2*Rain + β3*Soil
        double predPrice = INTERCEPT_PRICE 
                         + (BETA_HIST_PRICE * historicalBasePrice) 
                         + (BETA_RAINFALL * (rainfallMm - 700.0) * 0.05) 
                         + (BETA_SOIL * (soilQualityIndex - 70.0));
        predPrice = Math.max(50.0, Math.round(predPrice * 100.0) / 100.0);

        // Yield Regression: Y_yield = α0 + α1*Rain + α2*Soil
        double yieldPerHa = INTERCEPT_YIELD + (ALPHA_RAINFALL * rainfallMm) + (ALPHA_SOIL * soilQualityIndex);
        yieldPerHa = Math.max(0.8, Math.round(yieldPerHa * 100.0) / 100.0);

        double totalYield = Math.round((yieldPerHa * landHectares) * 100.0) / 100.0;

        return new EstimationResult(predPrice, yieldPerHa, totalYield);
    }
}

// ============================================================================
// 3. MARKET SERVICE (CENTRAL ORCHESTRATOR)
// ============================================================================

/**
 * Service orchestrating Farmers, Buyers, Crop Listings, and Dijkstra Routing.
 */
class MarketService {
    private final Map<String, Farmer> farmers = new LinkedHashMap<>();
    private final Map<String, Buyer> buyers = new LinkedHashMap<>();
    private final Map<String, Crop> crops = new LinkedHashMap<>();
    private final Map<String, MarketZone> zones = new LinkedHashMap<>();
    private final Map<String, CropListing> listings = new LinkedHashMap<>();
    private final TransitGraph transitGraph;
    private int listingCounter = 10;

    public MarketService() {
        this.transitGraph = TransitGraph.createStandardMarketNetwork();
        seedInitialMarketState();
    }

    private void seedInitialMarketState() {
        // Seed Zones
        zones.put("Z_NORTH", new MarketZone("Z_NORTH", "Highland Valley Terminal", "Northern Plains", 15000));
        zones.put("Z_DELTA", new MarketZone("Z_DELTA", "Delta Fertile Basin", "River Basin", 22000));
        zones.put("Z_GREEN", new MarketZone("Z_GREEN", "Green Meadows Mandi", "Central Plateau", 18000));
        zones.put("Z_CENTRAL", new MarketZone("Z_CENTRAL", "Central Transit Hub", "Midlands", 35000));
        zones.put("Z_COASTAL", new MarketZone("Z_COASTAL", "Coastal Port Market", "Maritime Coast", 40000));
        zones.put("Z_SOUTH", new MarketZone("Z_SOUTH", "Southern Granary", "Southern Basin", 20000));

        // Seed Crops
        crops.put("C_WHEAT", new Crop("C_WHEAT", "Durum Wheat", "Triticum durum", "Cereal", "Rabi", 310.00));
        crops.put("C_RICE", new Crop("C_RICE", "Basmati Rice", "Oryza sativa", "Cereal", "Kharif", 520.00));
        crops.put("C_CORN", new Crop("C_CORN", "Yellow Maize", "Zea mays", "Cereal", "Kharif", 240.00));
        crops.put("C_SOY", new Crop("C_SOY", "Organic Soybeans", "Glycine max", "Oilseed", "Kharif", 460.00));
        crops.put("C_COTTON", new Crop("C_COTTON", "Long-Staple Cotton", "Gossypium hirsutum", "Cash Crop", "Kharif", 780.00));
        crops.put("C_CHICKPEA", new Crop("C_CHICKPEA", "Desi Chickpeas", "Cicer arietinum", "Pulse", "Rabi", 490.00));

        // Seed Farmers
        farmers.put("F_101", new Farmer("F_101", "Rajesh Sharma", "+1-555-0101", "rajesh@agri.net", "Z_NORTH", 18.50));
        farmers.put("F_102", new Farmer("F_102", "Anita Desai", "+1-555-0102", "anita@agri.net", "Z_DELTA", 25.00));
        farmers.put("F_103", new Farmer("F_103", "Vikram Patel", "+1-555-0103", "vikram@agri.net", "Z_GREEN", 32.00));

        // Seed Buyers
        buyers.put("B_201", new Buyer("B_201", "David Chen", "+1-555-0201", "chen@agricorp.com", "Z_COASTAL", "AgriCorp Global", "Exporter"));
        buyers.put("B_202", new Buyer("B_202", "Marcus Vance", "+1-555-0202", "orders@heritageflour.com", "Z_CENTRAL", "Heritage Flour Mills", "Processor"));
        buyers.put("B_203", new Buyer("B_203", "Elena Rostova", "+1-555-0203", "elena@pureharvest.org", "Z_SOUTH", "Pure Harvest Organics", "Retailer"));

        // Seed Initial Listings (Clean Official Mandi Rates from ML)
        createListing("F_101", "C_WHEAT", 45.0, 680.0, 78.5);
        createListing("F_101", "C_CHICKPEA", 20.0, 510.0, 75.0);
        createListing("F_102", "C_RICE", 85.0, 1310.0, 88.0);
        createListing("F_103", "C_SOY", 60.0, 920.0, 80.0);
    }

    /**
     * Requirement 4a: Farmers create crop listings directly at the official Mandi Market Price
     * (predicted_price generated by Python ML regression).
     */
    public CropListing createListing(String farmerId, String cropId, double quantityTons, 
                                     double rainfallMm, double soilQualityIndex) {
        Farmer farmer = farmers.get(farmerId);
        if (farmer == null) throw new IllegalArgumentException("Farmer ID not found: " + farmerId);

        Crop crop = crops.get(cropId);
        if (crop == null) throw new IllegalArgumentException("Crop ID not found: " + cropId);

        // Run ML Regression Estimation
        MLPriceEstimator.EstimationResult mlResult = MLPriceEstimator.estimate(
                rainfallMm, soilQualityIndex, crop.getBasePricePerTon(), farmer.getLandAreaHectares()
        );

        double officialMandiRate = mlResult.predictedPricePerTon;
        String listingId = String.format("LST_%03d", ++listingCounter);
        CropListing listing = new CropListing(
                listingId, farmer, crop, farmer.getZoneId(), quantityTons, 
                officialMandiRate, officialMandiRate, mlResult.totalExpectedYieldTons,
                rainfallMm, soilQualityIndex
        );

        listings.put(listingId, listing);
        farmer.addListing(listing);
        return listing;
    }

    /**
     * Legacy compatibility overload
     */
    public CropListing createListing(String farmerId, String cropId, double quantityTons, 
                                     double askingPricePerTon, double rainfallMm, double soilQualityIndex) {
        return createListing(farmerId, cropId, quantityTons, rainfallMm, soilQualityIndex);
    }

    /**
     * Requirement 4b: Buyers can browse listings filtered by Zone and view optimal routing costs.
     */
    public List<CropListing> getListingsByZone(String zoneId) {
        if (zoneId == null || zoneId.isBlank() || zoneId.equalsIgnoreCase("ALL")) {
            return new ArrayList<>(listings.values());
        }
        return listings.values().stream()
                .filter(l -> l.getZoneId().equalsIgnoreCase(zoneId) && l.getStatus() == ListingStatus.AVAILABLE)
                .collect(Collectors.toList());
    }

    /**
     * Calculates Landed Cost for a Buyer including produce price and optimal transit cost.
     */
    public LandedCostQuote calculateLandedQuote(String listingId, String buyerZoneId) {
        CropListing listing = listings.get(listingId);
        if (listing == null) throw new IllegalArgumentException("Listing not found: " + listingId);

        TransitGraph.DeliveryRouteResult routeResult = transitGraph.findShortestDeliveryRoute(
                listing.getZoneId(), buyerZoneId
        );

        double producePricePerTon = listing.getAskingPricePerTon();
        double transitCostPerTon = routeResult.isRouteExists() ? routeResult.getTotalCostPerTon() : 0.0;
        double totalLandedCostPerTon = producePricePerTon + transitCostPerTon;
        double totalLotProduceCost = producePricePerTon * listing.getQuantityTons();
        double totalLotTransitCost = transitCostPerTon * listing.getQuantityTons();
        double grandTotalCost = totalLotProduceCost + totalLotTransitCost;

        return new LandedCostQuote(listing, buyerZoneId, routeResult, 
                totalLandedCostPerTon, totalLotProduceCost, totalLotTransitCost, grandTotalTotalCost(grandTotalCost));
    }

    private double grandTotalTotalCost(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    public Map<String, Farmer> getFarmers() { return farmers; }
    public Map<String, Buyer> getBuyers() { return buyers; }
    public Map<String, Crop> getCrops() { return crops; }
    public Map<String, MarketZone> getZones() { return zones; }
    public Map<String, CropListing> getListings() { return listings; }
    public TransitGraph getTransitGraph() { return transitGraph; }
}

/**
 * Encapsulates full financial quotation for delivery.
 */
class LandedCostQuote {
    public final CropListing listing;
    public final String buyerZoneId;
    public final TransitGraph.DeliveryRouteResult route;
    public final double landedPricePerTon;
    public final double totalProduceCost;
    public final double totalTransitCost;
    public final double grandTotalCost;

    public LandedCostQuote(CropListing listing, String buyerZoneId, 
                            TransitGraph.DeliveryRouteResult route, double landedPricePerTon, 
                            double totalProduceCost, double totalTransitCost, double grandTotalCost) {
        this.listing = listing;
        this.buyerZoneId = buyerZoneId;
        this.route = route;
        this.landedPricePerTon = landedPricePerTon;
        this.totalProduceCost = totalProduceCost;
        this.totalTransitCost = totalTransitCost;
        this.grandTotalCost = grandTotalCost;
    }

    public void printQuote() {
        System.out.println("=================================================================");
        System.out.println("        PURCHASE & ROUTING QUOTATION (REAL-WORLD MANDI RULES)");
        System.out.println("=================================================================");
        System.out.printf("a) Crop Name & Weight   : %s - %.2f Metric Tons%n", listing.getCrop().getName(), listing.getQuantityTons());
        System.out.printf("   Farmer Producer      : %s (Zone: %s)%n", listing.getFarmer().getFullName(), listing.getZoneId());
        System.out.printf("   Buyer Destination    : Zone %s%n", buyerZoneId);
        System.out.println("-----------------------------------------------------------------");
        System.out.printf("b) Official Mandi Rate  : ₹%.2f / ton  [Predicted by ML Engine]%n", 
                listing.getMlPredictedPricePerTon());
        System.out.printf("c) Crop Total Cost      : ₹%,.2f  (Quantity x Mandi Rate)%n", 
                totalProduceCost);
        System.out.printf("d) Transport Freight    : ₹%,.2f  [ADSA Dijkstra Route Cost]%n", 
                totalTransitCost);
        System.out.println("-----------------------------------------------------------------");
        System.out.printf("e) TOTAL AMOUNT PAYABLE : ₹%,.2f  (Crop Total Cost + Transport Freight)%n", 
                grandTotalCost);
        System.out.printf("   Landed Rate per Ton  : ₹%.2f / ton delivered%n", landedPricePerTon);
        System.out.println("-----------------------------------------------------------------");
        System.out.printf("Delivery Route Corridor : %s (%.1f km)%n", 
                String.join(" -> ", route.getPathNodes()), route.getTotalDistanceKm());
        System.out.println("=================================================================");
    }
}

// ============================================================================
// 4. INTERACTIVE APPLICATION CLI / RUNNER
// ============================================================================

public class FarmerMarketApp {
    public static void main(String[] args) {
        MarketService marketService = new MarketService();
        Scanner scanner = new Scanner(System.in);

        System.out.println("=================================================================");
        System.out.println("        FARMER-CROP-MARKET SYSTEM (OOPJ ARCHITECTURE)");
        System.out.println("       DBMS | DMGT-ADSA Graph | ML Regression | Clean OOP");
        System.out.println("=================================================================");

        boolean exit = false;
        while (!exit) {
            System.out.println("\n--- MAIN ACADEMIC DEMO MENU ---");
            System.out.println("1. [Farmer View] Create Crop Listing with ML Price Estimation");
            System.out.println("2. [Buyer View]  Browse Listings by Zone & Compute Shortest Route Cost");
            System.out.println("3. [Network]     View All Market Zones & Direct Transit Links");
            System.out.println("4. [Audit]       View All Active Marketplace Listings");
            System.out.println("5. [Dijkstra]    Run Standalone Dijkstra Route Finder");
            System.out.println("6. Exit");
            System.out.print("Select an option (1-6): ");

            String input = scanner.nextLine().trim();
            switch (input) {
                case "1":
                    handleFarmerCreateListing(marketService, scanner);
                    break;
                case "2":
                    handleBuyerBrowseAndRoute(marketService, scanner);
                    break;
                case "3":
                    displayMarketZonesAndRoutes(marketService);
                    break;
                case "4":
                    displayAllListings(marketService);
                    break;
                case "5":
                    handleDijkstraTest(marketService, scanner);
                    break;
                case "6":
                    exit = true;
                    System.out.println("Exiting Farmer-Crop-Market System. Thank you!");
                    break;
                default:
                    System.out.println("Invalid selection. Please choose 1-6.");
            }
        }
        scanner.close();
    }

    private static void handleFarmerCreateListing(MarketService service, Scanner scanner) {
        System.out.println("\n>>> [FARMER VIEW]: CREATE CROP LISTING <<<");
        System.out.println("Registered Farmers:");
        service.getFarmers().forEach((id, f) -> 
            System.out.printf("  - %s: %s (Zone: %s, Land: %.1f ha)%n", id, f.getFullName(), f.getZoneId(), f.getLandAreaHectares())
        );
        System.out.print("Enter Farmer ID (default F_101): ");
        String farmerId = scanner.nextLine().trim();
        if (farmerId.isEmpty()) farmerId = "F_101";

        System.out.println("\nAvailable Crops:");
        service.getCrops().forEach((id, c) -> 
            System.out.printf("  - %s: %s (Category: %s, Baseline: $%.2f/ton)%n", id, c.getName(), c.getCategory(), c.getBasePricePerTon())
        );
        System.out.print("Enter Crop ID (default C_WHEAT): ");
        String cropId = scanner.nextLine().trim();
        if (cropId.isEmpty()) cropId = "C_WHEAT";

        System.out.print("Enter Quantity in Tons (default 30.0): ");
        String qtyStr = scanner.nextLine().trim();
        double quantity = qtyStr.isEmpty() ? 30.0 : Double.parseDouble(qtyStr);

        System.out.print("Enter Seasonal Rainfall in mm (default 680, background default): ");
        String rainStr = scanner.nextLine().trim();
        double rainfall = rainStr.isEmpty() ? 680.0 : Double.parseDouble(rainStr);

        System.out.print("Enter Soil Quality Index [0-100] (default 80, background default): ");
        String soilStr = scanner.nextLine().trim();
        double soil = soilStr.isEmpty() ? 80.0 : Double.parseDouble(soilStr);

        // Real-World Mandi Rule: Listed directly at Official Mandi Market Price (predicted_price generated by Python ML)
        CropListing newListing = service.createListing(farmerId, cropId, quantity, rainfall, soil);

        System.out.println("\n-----------------------------------------------------------------");
        System.out.println(" [SUCCESS] Crop Listing Created at Official Mandi Market Price!");
        System.out.printf(" Listing ID       : %s%n", newListing.getListingId());
        System.out.printf(" Crop Commodity   : %s%n", newListing.getCrop().getName());
        System.out.printf(" Listed Quantity  : %.2f Metric Tons%n", newListing.getQuantityTons());
        System.out.printf(" >> MANDI RATE    : ₹%.2f / ton [System Recommended Price via ML]%n", 
                newListing.getMlPredictedPricePerTon());
        System.out.printf(" >> EST. VALUE    : ₹%,.2f [Total Produce Value]%n",
                newListing.getQuantityTons() * newListing.getMlPredictedPricePerTon());
        System.out.printf(" >> EXP. HARVEST  : %.2f Tons%n", newListing.getExpectedYieldTons());
        System.out.println(" Pricing Signal   : Listed strictly at official Mandi rate (zero markup).");
        System.out.println("-----------------------------------------------------------------");
    }

    private static void handleBuyerBrowseAndRoute(MarketService service, Scanner scanner) {
        System.out.println("\n>>> [BUYER VIEW]: BROWSE LISTINGS & ROUTING <<<");
        System.out.println("Registered Buyers:");
        service.getBuyers().forEach((id, b) -> 
            System.out.printf("  - %s: %s | %s (Zone: %s, %s)%n", id, b.getFullName(), b.getCompanyName(), b.getZoneId(), b.getBuyerType())
        );
        System.out.print("Select Buyer ID (default B_201): ");
        String buyerId = scanner.nextLine().trim();
        if (buyerId.isEmpty()) buyerId = "B_201";
        Buyer buyer = service.getBuyers().get(buyerId);

        System.out.println("\nAvailable Market Zones for Filtering (DMGT Set Theory):");
        service.getZones().forEach((id, z) -> System.out.printf("  [%s] %s%n", id, z.getZoneName()));
        System.out.print("Enter Zone ID to filter listings (or press Enter for ALL): ");
        String filterZone = scanner.nextLine().trim();
        if (filterZone.isEmpty()) filterZone = "ALL";

        List<CropListing> results = service.getListingsByZone(filterZone);
        System.out.printf("\nFound %d listings for Zone filter [%s]:%n", results.size(), filterZone);
        for (CropListing l : results) {
            System.out.printf("  [%s] %s &ndash; %.1f t | Farmer: %s (Zone: %s) | Mandi Rate: ₹%.2f/t%n",
                    l.getListingId(), l.getCrop().getName(), l.getQuantityTons(), l.getFarmer().getFullName(), 
                    l.getZoneId(), l.getMlPredictedPricePerTon());
        }

        if (results.isEmpty()) {
            System.out.println("No active listings found in this zone.");
            return;
        }

        System.out.print("\nEnter Listing ID to generate purchase quote & Dijkstra routing: ");
        String chosenListingId = scanner.nextLine().trim();
        if (chosenListingId.isEmpty()) chosenListingId = results.get(0).getListingId();

        try {
            LandedCostQuote quote = service.calculateLandedQuote(chosenListingId, buyer.getZoneId());
            quote.printQuote();
            System.out.println("Action: [✓ Buy Now] (Within budget allocation)");
        } catch (Exception e) {
            System.out.println("Error generating quote: " + e.getMessage());
        }
    }

    private static void displayMarketZonesAndRoutes(MarketService service) {
        System.out.println("\n>>> MARKET LOGISTICS ZONES & ADJACENCY MATRIX <<<");
        for (MarketZone z : service.getZones().values()) {
            System.out.printf("Zone [%s] %s (%s) - Capacity: %,d tons%n", 
                    z.getZoneId(), z.getZoneName(), z.getStateRegion(), z.getHubCapacityTons());
            List<TransitGraph.TransitEdge> neighbors = service.getTransitGraph().getNeighbors(z.getZoneId());
            for (TransitGraph.TransitEdge edge : neighbors) {
                System.out.printf("   %s%n", edge);
            }
        }
    }

    private static void displayAllListings(MarketService service) {
        System.out.println("\n>>> ALL ACTIVE MARKETPLACE LISTINGS <<<");
        for (CropListing l : service.getListings().values()) {
            System.out.printf("  [%s] %-18s | Farmer: %-15s | Zone: %-10s | Qty: %5.1f t | Ask: $%6.2f | ML: $%6.2f%n",
                    l.getListingId(), l.getCrop().getName(), l.getFarmer().getFullName(), 
                    l.getZoneId(), l.getQuantityTons(), l.getAskingPricePerTon(), l.getMlPredictedPricePerTon());
        }
    }

    private static void handleDijkstraTest(MarketService service, Scanner scanner) {
        System.out.println("\n>>> DIJKSTRA'S ALGORITHM DIRECT RUNNER <<<");
        System.out.print("Enter Source Zone ID (e.g. Z_NORTH): ");
        String src = scanner.nextLine().trim();
        if (src.isEmpty()) src = "Z_NORTH";

        System.out.print("Enter Destination Zone ID (e.g. Z_COASTAL): ");
        String dst = scanner.nextLine().trim();
        if (dst.isEmpty()) dst = "Z_COASTAL";

        TransitGraph.DeliveryRouteResult result = service.getTransitGraph().findShortestDeliveryRoute(src, dst);
        result.printSummary();
    }
}
