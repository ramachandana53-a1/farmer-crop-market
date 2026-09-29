import { DijkstraResult, DijkstraStep, TransitRoute } from '../types';

/**
 * Dijkstra's Single-Source Shortest Path Algorithm for Andhra Pradesh Agricultural Freight
 * Computes the minimum freight transit cost (in ₹ per Quintal) between AP district mandi hubs.
 * Time Complexity: Θ((V + E) log V) with priority queue relaxation.
 */
export function runDijkstra(
  routes: TransitRoute[],
  allZoneIds: string[],
  sourceZoneId: string,
  destZoneId: string
): DijkstraResult {
  if (sourceZoneId === destZoneId) {
    return {
      sourceZoneId,
      destZoneId,
      routeExists: true,
      totalCostPerQuintal: 0,
      totalCostPerTon: 0,
      totalDistanceKm: 0,
      totalDurationHours: 0,
      path: [sourceZoneId],
      hopDetails: [],
      steps: [
        {
          stepNumber: 1,
          currentNode: sourceZoneId,
          distanceMap: { [sourceZoneId]: 0 },
          predecessorMap: { [sourceZoneId]: null },
          settledNodes: [sourceZoneId],
          actionDescription: 'Source district is identical to destination hub. Direct local mandi trade (Freight: ₹0.00).',
        },
      ],
    };
  }

  // Build Adjacency Map
  const adj = new Map<string, TransitRoute[]>();
  allZoneIds.forEach((id) => adj.set(id, []));
  routes.forEach((r) => {
    if (!adj.has(r.sourceZoneId)) adj.set(r.sourceZoneId, []);
    adj.get(r.sourceZoneId)!.push(r);
  });

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const edgeUsed: Record<string, TransitRoute> = {};
  const settled = new Set<string>();
  const steps: DijkstraStep[] = [];

  allZoneIds.forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });
  dist[sourceZoneId] = 0;

  // Min-Priority Queue items: { node, cost }
  const queue: Array<{ node: string; cost: number }> = [{ node: sourceZoneId, cost: 0 }];
  let stepCounter = 1;

  while (queue.length > 0) {
    // Priority queue extract minimum
    queue.sort((a, b) => a.cost - b.cost);
    const { node: u, cost: uCost } = queue.shift()!;

    if (settled.has(u)) continue;
    settled.add(u);

    // Record algorithm step snapshot
    steps.push({
      stepNumber: stepCounter++,
      currentNode: u,
      distanceMap: { ...dist },
      predecessorMap: { ...prev },
      settledNodes: Array.from(settled),
      actionDescription: `Settled AP District node '${u}' with verified minimum transit cost of ₹${uCost.toFixed(2)}/quintal. Relaxing outgoing highway edges.`,
    });

    if (u === destZoneId) {
      break;
    }

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      const v = edge.destZoneId;
      if (settled.has(v)) continue;

      const edgeCost = edge.transitCostPerQuintal ?? edge.transitCostPerTon ?? 0;
      const alt = dist[u] + edgeCost;
      if (alt < dist[v]) {
        dist[v] = Math.round(alt * 100) / 100;
        prev[v] = u;
        edgeUsed[v] = edge;

        // Push relaxed node to priority queue
        queue.push({ node: v, cost: dist[v] });

        steps.push({
          stepNumber: stepCounter++,
          currentNode: v,
          distanceMap: { ...dist },
          predecessorMap: { ...prev },
          settledNodes: Array.from(settled),
          actionDescription: `Edge Relaxation: Found lower cost corridor ${u} -> ${v} (${edge.highwayRef || 'Corridor'}) costing ₹${edgeCost.toFixed(2)}/q. Updated distance to ₹${dist[v].toFixed(2)}/q.`,
        });
      }
    }
  }

  // Check if destination was reached
  if (dist[destZoneId] === Infinity) {
    return {
      sourceZoneId,
      destZoneId,
      routeExists: false,
      totalCostPerQuintal: 0,
      totalCostPerTon: 0,
      totalDistanceKm: 0,
      totalDurationHours: 0,
      path: [],
      hopDetails: [],
      steps,
    };
  }

  // Reconstruct shortest path
  const path: string[] = [];
  let curr: string | null = destZoneId;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }

  // Compute hops, distance, and duration
  let totalDistance = 0;
  let totalDuration = 0;
  const hopDetails: Array<{
    from: string;
    to: string;
    cost: number;
    distance: number;
    duration: number;
    highway?: string;
  }> = [];

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = edgeUsed[to];
    if (edge) {
      totalDistance += edge.distanceKm;
      totalDuration += edge.durationHours;
      const c = edge.transitCostPerQuintal ?? edge.transitCostPerTon ?? 0;
      hopDetails.push({
        from,
        to,
        cost: c,
        distance: edge.distanceKm,
        duration: edge.durationHours,
        highway: edge.highwayRef,
      });
    }
  }

  const finalCost = dist[destZoneId];

  return {
    sourceZoneId,
    destZoneId,
    routeExists: true,
    totalCostPerQuintal: finalCost,
    totalCostPerTon: finalCost, // Compatibility
    totalDistanceKm: totalDistance,
    totalDurationHours: totalDuration,
    path,
    hopDetails,
    steps,
  };
}
