/**
 * ============================================================================
 * ACADEMIC PROJECT: FARMER-CROP-MARKET SYSTEM
 * MODULE 2: DISCRETE MATHEMATICS & GRAPH THEORY (DMGT) & ADSA
 * 
 * Topic: Weighted Directed Graph Representation & Dijkstra's Shortest Path
 * Target: Java 17+ / Java 21 LTS Standard Edition
 * ============================================================================
 * 
 * DISCRETE MATHEMATICAL FORMULATION (DMGT):
 * -----------------------------------------
 * Let the Market Logistics Transit Network be modeled as a directed, edge-weighted graph:
 *      G = (V, E, w)
 * where:
 *   - V = { z_1, z_2, ..., z_|V| } is the finite non-empty set of vertices (Market Zones).
 *   - E ⊆ V × V is the set of directed transit links between accessible zones.
 *   - w: E -> R^+ is the weight function assigning a strictly non-negative transit cost 
 *     per metric ton: w(u, v) >= 0 for all (u, v) ∈ E.
 * 
 * GRAPH REPRESENTATION: ADJACENCY LIST
 * ------------------------------------
 * An Adjacency List maps each vertex v ∈ V to a linked structure of outgoing edges:
 *      Adj[u] = { (v, cost, distance) | (u, v) ∈ E }
 * Space Complexity: Θ(|V| + |E|), which is optimal compared to Adjacency Matrix Θ(|V|^2)
 * for sparse agricultural transit graphs where |E| << |V|^2.
 * 
 * ALGORITHM: DIJKSTRA'S SHORTEST PATH WITH MIN-PRIORITY QUEUE
 * -----------------------------------------------------------
 * Computes the minimum delivery cost from a Farmer's source zone s ∈ V to all v ∈ V.
 * Greedily maintains:
 *   - dist[v]: upper bound on shortest distance from s to v.
 *   - parent[v]: predecessor node on the shortest path from s.
 *   - Priority Queue Q keyed on dist[v].
 * 
 * Relaxation Condition:
 *      if dist[u] + w(u, v) < dist[v]:
 *          dist[v] = dist[u] + w(u, v)
 *          parent[v] = u
 *          Q.insertOrDecreaseKey(v, dist[v])
 * 
 * Asymptotic Complexity:
 *   - Time Complexity: O((|V| + |E|) log |V|) using a binary min-heap.
 *   - Space Complexity: O(|V| + |E|) for graph storage and algorithm data structures.
 */

import java.util.*;

public class TransitGraph {

    // ------------------------------------------------------------------------
    // Nested Class: TransitEdge (Directed Weighted Edge in Graph)
    // ------------------------------------------------------------------------
    public static class TransitEdge {
        private final String targetZoneId;
        private final double transitCostPerTon; // Edge weight w(u, v)
        private final double distanceKm;
        private final double durationHours;

        public TransitEdge(String targetZoneId, double transitCostPerTon, double distanceKm, double durationHours) {
            this.targetZoneId = targetZoneId;
            this.transitCostPerTon = transitCostPerTon;
            this.distanceKm = distanceKm;
            this.durationHours = durationHours;
        }

        public String getTargetZoneId() { return targetZoneId; }
        public double getTransitCostPerTon() { return transitCostPerTon; }
        public double getDistanceKm() { return distanceKm; }
        public double getDurationHours() { return durationHours; }

        @Override
        public String toString() {
            return String.format("-> %s (Cost: $%.2f/ton, %.1f km, %.1f hrs)", 
                    targetZoneId, transitCostPerTon, distanceKm, durationHours);
        }
    }

    // ------------------------------------------------------------------------
    // Nested Class: PathNode (Used in Priority Queue for Dijkstra)
    // ------------------------------------------------------------------------
    private static class PathNode implements Comparable<PathNode> {
        private final String zoneId;
        private final double accumulatedCost;

        public PathNode(String zoneId, double accumulatedCost) {
            this.zoneId = zoneId;
            this.accumulatedCost = accumulatedCost;
        }

        @Override
        public int compareTo(PathNode other) {
            return Double.compare(this.accumulatedCost, other.accumulatedCost);
        }
    }

    // ------------------------------------------------------------------------
    // Nested Class: DeliveryRouteResult (Encapsulates Route Calculation)
    // ------------------------------------------------------------------------
    public static class DeliveryRouteResult {
        private final String sourceZoneId;
        private final String destinationZoneId;
        private final boolean routeExists;
        private final double totalCostPerTon;
        private final double totalDistanceKm;
        private final List<String> pathNodes;
        private final List<String> stepDetails;

        public DeliveryRouteResult(String sourceZoneId, String destinationZoneId, 
                                   boolean routeExists, double totalCostPerTon, 
                                   double totalDistanceKm, List<String> pathNodes, 
                                   List<String> stepDetails) {
            this.sourceZoneId = sourceZoneId;
            this.destinationZoneId = destinationZoneId;
            this.routeExists = routeExists;
            this.totalCostPerTon = totalCostPerTon;
            this.totalDistanceKm = totalDistanceKm;
            this.pathNodes = Collections.unmodifiableList(pathNodes);
            this.stepDetails = Collections.unmodifiableList(stepDetails);
        }

        public String getSourceZoneId() { return sourceZoneId; }
        public String getDestinationZoneId() { return destinationZoneId; }
        public boolean isRouteExists() { return routeExists; }
        public double getTotalCostPerTon() { return totalCostPerTon; }
        public double getTotalDistanceKm() { return totalDistanceKm; }
        public List<String> getPathNodes() { return pathNodes; }
        public List<String> getStepDetails() { return stepDetails; }

        public void printSummary() {
            System.out.println("=================================================");
            System.out.println("   OPTIMAL LOGISTICS ROUTE VIA DIJKSTRA'S ALGORITHM");
            System.out.println("=================================================");
            System.out.printf("Origin Zone       : %s%n", sourceZoneId);
            System.out.printf("Destination Zone  : %s%n", destinationZoneId);
            if (!routeExists) {
                System.out.println("Status            : NO DIRECT OR TRANSIT PATH FOUND!");
                return;
            }
            System.out.printf("Optimal Path      : %s%n", String.join(" -> ", pathNodes));
            System.out.printf("Min Transit Cost  : $%.2f per ton%n", totalCostPerTon);
            System.out.printf("Total Distance    : %.1f km%n", totalDistanceKm);
            System.out.println("Hop-by-Hop Breakdown:");
            for (String step : stepDetails) {
                System.out.println("  " + step);
            }
            System.out.println("=================================================");
        }
    }

    // ------------------------------------------------------------------------
    // Graph State: Adjacency List Structure
    // ------------------------------------------------------------------------
    private final Map<String, List<TransitEdge>> adjacencyList;
    private final Map<String, String> zoneNames; // Optional human-readable labels

    public TransitGraph() {
        this.adjacencyList = new HashMap<>();
        this.zoneNames = new HashMap<>();
    }

    /**
     * Registers a Market Zone vertex in the graph.
     */
    public void addZone(String zoneId, String readableName) {
        adjacencyList.putIfAbsent(zoneId, new ArrayList<>());
        zoneNames.put(zoneId, readableName);
    }

    /**
     * Adds a directed weighted transit edge from source to destination.
     */
    public void addDirectedRoute(String sourceZoneId, String destZoneId, 
                                 double costPerTon, double distanceKm, double durationHours) {
        if (!adjacencyList.containsKey(sourceZoneId) || !adjacencyList.containsKey(destZoneId)) {
            throw new IllegalArgumentException("Source or Destination zone does not exist in graph.");
        }
        if (costPerTon < 0) {
            throw new IllegalArgumentException("Dijkstra requires non-negative edge costs. Given: " + costPerTon);
        }
        adjacencyList.get(sourceZoneId).add(new TransitEdge(destZoneId, costPerTon, distanceKm, durationHours));
    }

    /**
     * Adds a bidirectional route (common for transport highways).
     */
    public void addBidirectionalRoute(String zoneA, String zoneB, 
                                      double costPerTon, double distanceKm, double durationHours) {
        addDirectedRoute(zoneA, zoneB, costPerTon, distanceKm, durationHours);
        addDirectedRoute(zoneB, zoneA, costPerTon, distanceKm, durationHours);
    }

    public Set<String> getAllZoneIds() {
        return Collections.unmodifiableSet(adjacencyList.keySet());
    }

    public List<TransitEdge> getNeighbors(String zoneId) {
        return Collections.unmodifiableList(adjacencyList.getOrDefault(zoneId, Collections.emptyList()));
    }

    public String getZoneName(String zoneId) {
        return zoneNames.getOrDefault(zoneId, zoneId);
    }

    /**
     * CORE ADSA IMPLEMENTATION:
     * Computes the shortest delivery route from sourceZoneId to destinationZoneId
     * using Dijkstra's Algorithm with Min-Priority Queue.
     */
    public DeliveryRouteResult findShortestDeliveryRoute(String sourceZoneId, String destinationZoneId) {
        if (!adjacencyList.containsKey(sourceZoneId) || !adjacencyList.containsKey(destinationZoneId)) {
            return new DeliveryRouteResult(sourceZoneId, destinationZoneId, false, 
                    Double.POSITIVE_INFINITY, 0, Collections.emptyList(), Collections.emptyList());
        }

        // Trivial case: Source == Destination
        if (sourceZoneId.equals(destinationZoneId)) {
            return new DeliveryRouteResult(sourceZoneId, destinationZoneId, true, 0.0, 0.0, 
                    List.of(sourceZoneId), List.of("Origin equals destination (Local delivery)."));
        }

        // Distance table d[v]
        Map<String, Double> minCostTo = new HashMap<>();
        // Predecessor map π[v] for backtracking
        Map<String, String> predecessor = new HashMap<>();
        // Edge used to reach node v (for metric retrieval)
        Map<String, TransitEdge> edgeTo = new HashMap<>();

        // Initialize all distances to positive infinity
        for (String zone : adjacencyList.keySet()) {
            minCostTo.put(zone, Double.POSITIVE_INFINITY);
        }
        minCostTo.put(sourceZoneId, 0.0);

        PriorityQueue<PathNode> pq = new PriorityQueue<>();
        pq.add(new PathNode(sourceZoneId, 0.0));

        Set<String> settled = new HashSet<>();

        while (!pq.isEmpty()) {
            PathNode current = pq.poll();
            String u = current.zoneId;

            // Stale entry in priority queue check
            if (settled.contains(u)) continue;
            settled.add(u);

            // Optimization: if we settled the destination, we can terminate early
            if (u.equals(destinationZoneId)) {
                break;
            }

            // Relax all outgoing edges (u, v) ∈ E
            for (TransitEdge edge : adjacencyList.getOrDefault(u, Collections.emptyList())) {
                String v = edge.getTargetZoneId();
                if (settled.contains(v)) continue;

                double newCost = minCostTo.get(u) + edge.getTransitCostPerTon();
                if (newCost < minCostTo.get(v)) {
                    minCostTo.put(v, newCost);
                    predecessor.put(v, u);
                    edgeTo.put(v, edge);
                    pq.add(new PathNode(v, newCost));
                }
            }
        }

        // Check if destination was reachable
        if (minCostTo.get(destinationZoneId) == Double.POSITIVE_INFINITY) {
            return new DeliveryRouteResult(sourceZoneId, destinationZoneId, false, 
                    Double.POSITIVE_INFINITY, 0, Collections.emptyList(), Collections.emptyList());
        }

        // Reconstruct path from destination to source via π[v]
        LinkedList<String> path = new LinkedList<>();
        String step = destinationZoneId;
        while (step != null) {
            path.addFirst(step);
            step = predecessor.get(step);
        }

        // Calculate total distance and detailed hop breakdown
        double totalDistance = 0;
        List<String> hopDetails = new ArrayList<>();

        for (int i = 0; i < path.size() - 1; i++) {
            String u = path.get(i);
            String v = path.get(i + 1);
            TransitEdge edge = edgeTo.get(v);
            if (edge != null) {
                totalDistance += edge.getDistanceKm();
                hopDetails.add(String.format("Hop %d: [%s (%s)] -> [%s (%s)] | Cost: $%.2f/ton, Dist: %.1f km, Duration: %.1f hrs",
                        (i + 1), u, getZoneName(u), v, getZoneName(v), 
                        edge.getTransitCostPerTon(), edge.getDistanceKm(), edge.getDurationHours()));
            }
        }

        return new DeliveryRouteResult(
                sourceZoneId, destinationZoneId, true, 
                minCostTo.get(destinationZoneId), totalDistance, 
                path, hopDetails
        );
    }

    /**
     * Factory method: Populates the standard academic market network.
     */
    public static TransitGraph createStandardMarketNetwork() {
        TransitGraph graph = new TransitGraph();

        // 1. Add Vertices (Market Zones)
        graph.addZone("Z_NORTH", "Highland Valley Terminal");
        graph.addZone("Z_DELTA", "Delta Fertile Basin");
        graph.addZone("Z_GREEN", "Green Meadows Mandi");
        graph.addZone("Z_CENTRAL", "Central Transit Hub");
        graph.addZone("Z_COASTAL", "Coastal Port Market");
        graph.addZone("Z_SOUTH", "Southern Granary");

        // 2. Add Edges (Symmetric transit highways)
        graph.addBidirectionalRoute("Z_NORTH", "Z_DELTA", 32.50, 450.0, 8.5);
        graph.addBidirectionalRoute("Z_NORTH", "Z_GREEN", 27.00, 380.0, 7.0);
        graph.addBidirectionalRoute("Z_DELTA", "Z_CENTRAL", 38.00, 520.0, 10.0);
        graph.addBidirectionalRoute("Z_GREEN", "Z_CENTRAL", 19.50, 260.0, 5.0);
        graph.addBidirectionalRoute("Z_CENTRAL", "Z_COASTAL", 24.00, 340.0, 6.5);
        graph.addBidirectionalRoute("Z_CENTRAL", "Z_SOUTH", 42.00, 590.0, 11.5);
        graph.addBidirectionalRoute("Z_GREEN", "Z_COASTAL", 35.00, 480.0, 9.5);
        graph.addBidirectionalRoute("Z_SOUTH", "Z_COASTAL", 46.00, 620.0, 12.0);

        return graph;
    }

    // ------------------------------------------------------------------------
    // Standalone Verification Test Runner
    // ------------------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("  DMGT & ADSA MODULE: TRANSIT GRAPH & DIJKSTRA'S ALGORITHM");
        System.out.println("=================================================================");

        TransitGraph network = createStandardMarketNetwork();

        // Test Scenario 1: Farmer in Z_NORTH sending grain to Buyer in Z_COASTAL
        System.out.println("\n[Test Scenario 1]: Farmer Zone: Z_NORTH -> Buyer Market: Z_COASTAL");
        DeliveryRouteResult result1 = network.findShortestDeliveryRoute("Z_NORTH", "Z_COASTAL");
        result1.printSummary();

        // Test Scenario 2: Farmer in Z_DELTA sending rice to Buyer in Z_SOUTH
        System.out.println("\n[Test Scenario 2]: Farmer Zone: Z_DELTA -> Buyer Market: Z_SOUTH");
        DeliveryRouteResult result2 = network.findShortestDeliveryRoute("Z_DELTA", "Z_SOUTH");
        result2.printSummary();

        // Test Scenario 3: Local delivery within same zone
        System.out.println("\n[Test Scenario 3]: Farmer Zone: Z_GREEN -> Buyer Market: Z_GREEN");
        DeliveryRouteResult result3 = network.findShortestDeliveryRoute("Z_GREEN", "Z_GREEN");
        result3.printSummary();
    }
}
