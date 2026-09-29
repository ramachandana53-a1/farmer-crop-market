# Farmer-Crop-Market System: Academic Project Implementation Guide
**Department of Computer Science & Engineering**  
*Curriculum Domains: Database Management Systems (DBMS), Discrete Mathematical Structures & Graph Theory (DMGT), Advanced Data Structures & Algorithms (ADSA), Machine Learning (Python/scikit-learn), Object-Oriented Programming in Java (OOPJ)*

---

## 1. Project Abstract & Architectural Overview
The **Farmer-Crop-Market System** is a unified multi-disciplinary engineering project designed to eliminate agricultural market inefficiencies, information asymmetry, and transit logistics friction. The system bridges agricultural producers (Farmers), institutional purchasers (Buyers), regional agronomic conditions, and transportation logistics through:

1. **Relational Data Tier (DBMS)**: Normalized Third Normal Form (3NF) MySQL/PostgreSQL schema governing entity relationships between Farmers, Buyers, Crops, Market Zones, and Crop Listings.
2. **Algorithmic Routing Tier (DMGT & ADSA)**: Mathematical model of logistics hubs as a weighted directed graph $G = (V, E)$, implementing Dijkstra's algorithm with Min-Priority Queues for optimal freight cost calculation.
3. **Machine Learning Predictive Tier (Python)**: Multivariate linear regression pipeline built with `scikit-learn` and `pandas` that predicts crop equilibrium price and expected yield using rainfall, soil quality index, and historical market metrics, persisted with `sqlite3`/`mysql`.
4. **Application Tier (OOPJ)**: Clean Object-Oriented Java domain model applying polymorphic hierarchies (`User` -> `Farmer`, `Buyer`), encapsulation, service orchestration, and interactive CLI menus.

---

## 2. Theoretical Foundations & Academic Formulations

### 2.1 DBMS: Entity-Relationship & 3NF Normalization
- **Entities & Primary Keys**:
  - `MARKET_ZONES` (`zone_id` PK)
  - `FARMERS` (`farmer_id` PK, `zone_id` FK)
  - `BUYERS` (`buyer_id` PK, `zone_id` FK)
  - `CROPS` (`crop_id` PK)
  - `LISTINGS` (`listing_id` PK, `farmer_id` FK, `crop_id` FK, `zone_id` FK)
  - `TRANSIT_ROUTES` (`(source_zone_id, destination_zone_id)` Composite PK)

- **Normalization Proof (3NF)**:
  - **1NF**: All column domains are atomic. No multi-valued attributes or repeating groups.
  - **2NF**: In 1NF and no non-prime attribute is partially dependent on any candidate key. The only composite primary key resides in `TRANSIT_ROUTES`, where `transit_cost_per_ton`, `distance_km`, and `avg_duration_hours` depend strictly on both endpoints `(source, dest)`.
  - **3NF**: In 2NF and no transitive functional dependency exists ($X \to Y$ where $X$ is not a superkey). For example, crop base prices and optimal growth conditions reside strictly in `CROPS`, not in `LISTINGS`.

### 2.2 DMGT & ADSA: Graph Theory & Shortest Path Analysis
- **Formal Graph Definition**:  
  Let $G = (V, E)$ where:
  - $V = \{ z_1, z_2, \dots, z_n \}$ is the set of Market Zone vertices.
  - $E \subseteq V \times V$ represents bidirectional or directed transit corridors.
  - $w: E \to \mathbb{R}^+$ defines the non-negative transit cost per metric ton.
- **Dijkstra's Greedy Invariant**:  
  For each settled vertex $u \in S$, $dist[u] = \delta(s, u)$ is the exact shortest distance from source $s$. Edge relaxation maintains:
  $$\text{if } dist[u] + w(u, v) < dist[v] \implies dist[v] = dist[u] + w(u, v), \quad \pi[v] = u$$
- **Complexity**:
  - **Time**: $\mathcal{O}((|V| + |E|) \log |V|)$ using binary min-heap (`java.util.PriorityQueue`).
  - **Space**: $\mathcal{O}(|V| + |E|)$ via Adjacency List.

### 2.3 Machine Learning: Multivariate Linear Regression
The regression problem is formalized under Ordinary Least Squares (OLS):
$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\varepsilon}$$
$$\min_{\boldsymbol{\beta}} \|\mathbf{y} - \mathbf{X}\boldsymbol{\beta}\|_2^2 \implies \boldsymbol{\beta}^* = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{y}$$

1. **Yield Model**:
   $$\text{Expected\_Yield} = \alpha_0 + \alpha_1(\text{Rainfall}) + \alpha_2(\text{Soil\_Quality}) + \varepsilon$$
2. **Price Model**:
   $$\text{Predicted\_Price} = \beta_0 + \beta_1(\text{Historical\_Price}) + \beta_2(\text{Rainfall\_Deviation}) + \beta_3(\text{Soil\_Quality}) + \varepsilon$$

---

## 3. Step-by-Step Setup & Execution Instructions

### Prerequisites
- **Java**: OpenJDK 17 or 21 LTS (`java -version`, `javac -version`)
- **Python**: Python 3.9+ with `pip`
- **DBMS**: MySQL 8.0+ / PostgreSQL 14+ / SQLite3

---

### Step 1: Database Setup (MySQL or PostgreSQL)
```bash
# For MySQL:
mysql -u root -p < schema.sql

# For PostgreSQL:
psql -U postgres -d postgres -f schema.sql
```
*To verify tables:*
```sql
SELECT mz.zone_name, COUNT(l.listing_id) AS active_listings, SUM(l.quantity_tons) AS total_tons
FROM market_zones mz
LEFT JOIN listings l ON mz.zone_id = l.zone_id
GROUP BY mz.zone_name;
```

---

### Step 2: Running the Python Machine Learning Script
1. Install dependencies:
   ```bash
   pip install pandas numpy scikit-learn
   ```
2. Execute regression training & prediction CLI:
   ```bash
   # Standard Run:
   python3 crop_ml_predictor.py --rainfall 680 --soil 82 --hist-price 310 --land 18.5

   # Save outputs to SQLite audit database:
   python3 crop_ml_predictor.py --rainfall 720 --soil 85 --hist-price 320 --save-db

   # JSON output mode (ideal for API microservices):
   python3 crop_ml_predictor.py --rainfall 680 --soil 80 --hist-price 310 --json
   ```

---

### Step 3: Compiling and Running Standalone ADSA Java Module
1. Compile:
   ```bash
   javac TransitGraph.java
   ```
2. Run Dijkstra test scenarios:
   ```bash
   java TransitGraph
   ```

---

### Step 4: Compiling and Running the Complete OOPJ System
1. Compile both Java source files:
   ```bash
   javac TransitGraph.java FarmerMarketApp.java
   ```
2. Launch the interactive CLI menu:
   ```bash
   java FarmerMarketApp
   ```
3. Interactive Testing:
   - **Option 1**: Create a new listing as Farmer `F_101`, input seasonal rainfall and soil index, and inspect the real-time ML predicted price.
   - **Option 2**: Browse as Buyer `B_201`, filter by Zone `Z_NORTH`, select listing `LST_001`, and review the optimal Dijkstra transit path and net landed invoice.
   - **Option 5**: Run arbitrary source-to-destination Dijkstra routing calculations.

---

## 4. Academic Viva Voce / Oral Examination Questions & Answers

**Q1: Why choose an Adjacency List over an Adjacency Matrix for this logistics network?**  
*Answer:* In real-world logistics, transport links are sparse ($\mathcal{O}(|E|) \approx 2\text{ to }4 \times |V|$). An Adjacency Matrix requires $\mathcal{O}(|V|^2)$ memory and makes edge iteration $\mathcal{O}(|V|)$ per vertex. An Adjacency List uses $\mathcal{O}(|V| + |E|)$ space and traverses only existing adjacent vertices, which is computationally optimal for Dijkstra's algorithm.

**Q2: Can Dijkstra's algorithm work with negative edge weights? Why or why not?**  
*Answer:* No. Dijkstra relies on the greedy assumption that once a vertex is removed from the priority queue (settled), its shortest path distance is finalized and cannot be improved. A negative edge weight later in the graph could violate this property, requiring the Bellman-Ford algorithm ($\mathcal{O}(|V| \cdot |E|)$) or Johnson's algorithm.

**Q3: How does the schema achieve 3NF? Give a concrete example.**  
*Answer:* A table is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key. In `LISTINGS`, if we stored `crop_base_price` or `farmer_phone`, they would depend on `crop_id` and `farmer_id` (non-superkeys in `LISTINGS`), violating 3NF. By maintaining dedicated `CROPS` and `FARMERS` tables, we remove data redundancy, anomaly hazards (insert/update/delete), and ensure pure functional dependencies.

**Q4: How does Ordinary Least Squares (OLS) evaluate fit in the regression model?**  
*Answer:* OLS calculates the Coefficient of Determination ($R^2$):
$$R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}} = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
An $R^2$ close to 1.0 indicates that the majority of variance in harvest price and yield is successfully explained by the environmental features (rainfall, soil quality, historical momentum).
