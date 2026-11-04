import { QiCycle, QiEdge } from './qiGraph';

export interface QiPoint { x: number; y: number }

/** Responsive graph layout: directed chains use layers; cycles stay grouped in a central loop. */
export function layoutQiGraph(nodeIds: string[], edges: QiEdge[], cycles: QiCycle[]): Map<string, QiPoint> {
  const positions = new Map<string, QiPoint>();
  if (!nodeIds.length) return positions;
  const center = { x: 600, y: 410 };
  const cycleNodes = [...new Set(cycles.flatMap((cycle) => cycle.palaceIds))].filter((id) => nodeIds.includes(id));

  if (cycleNodes.length) {
    const rx = cycleNodes.length > 7 ? 330 : cycleNodes.length > 3 ? 285 : 205;
    const ry = cycleNodes.length > 7 ? 300 : cycleNodes.length > 3 ? 250 : 175;
    cycleNodes.forEach((id, index) => {
      const angle = -Math.PI / 2 + index * 2 * Math.PI / cycleNodes.length;
      positions.set(id, { x: center.x + Math.cos(angle) * rx, y: center.y + Math.sin(angle) * ry });
    });

    const cycleSet = new Set(cycleNodes);
    const incomingDistance = new Map(cycleNodes.map((id) => [id, 0]));
    const outgoingDistance = new Map(cycleNodes.map((id) => [id, 0]));
    const incomingQueue = [...cycleNodes];
    while (incomingQueue.length) {
      const current = incomingQueue.shift()!;
      for (const edge of edges) if (!edge.isLyTam && edge.targetPalaceId === current && !incomingDistance.has(edge.sourcePalaceId)) {
        incomingDistance.set(edge.sourcePalaceId, (incomingDistance.get(current) ?? 0) + 1);
        incomingQueue.push(edge.sourcePalaceId);
      }
    }
    const outgoingQueue = [...cycleNodes];
    while (outgoingQueue.length) {
      const current = outgoingQueue.shift()!;
      for (const edge of edges) if (!edge.isLyTam && edge.sourcePalaceId === current && !outgoingDistance.has(edge.targetPalaceId)) {
        outgoingDistance.set(edge.targetPalaceId, (outgoingDistance.get(current) ?? 0) + 1);
        outgoingQueue.push(edge.targetPalaceId);
      }
    }
    const incomingNodes = nodeIds.filter((id) => !cycleSet.has(id) && incomingDistance.has(id));
    const outgoingNodes = nodeIds.filter((id) => !cycleSet.has(id) && !incomingDistance.has(id) && outgoingDistance.has(id));
    const incomingMax = Math.max(1, ...incomingNodes.map((id) => incomingDistance.get(id) ?? 1));
    const outgoingMax = Math.max(1, ...outgoingNodes.map((id) => outgoingDistance.get(id) ?? 1));
    const placeBranch = (ids: string[], distances: Map<string, number>, side: 'left' | 'right', maxDepth: number) => {
      const maxOffset = center.x - rx - 95;
      const spacing = maxOffset / maxDepth;
      const layers = new Map<number, string[]>();
      ids.forEach((id) => { const depth = distances.get(id) ?? 1; layers.set(depth, [...(layers.get(depth) ?? []), id]); });
      layers.forEach((layerIds, depth) => layerIds.forEach((id, index) => {
        const y = layerIds.length === 1 ? center.y : 100 + index * (620 / Math.max(1, layerIds.length - 1));
        const x = center.x + (side === 'left' ? -1 : 1) * (rx + depth * spacing);
        positions.set(id, { x, y });
      }));
    };
    placeBranch(incomingNodes, incomingDistance, 'left', incomingMax);
    placeBranch(outgoingNodes, outgoingDistance, 'right', outgoingMax);
    const detached = nodeIds.filter((id) => !positions.has(id));
    detached.forEach((id, index) => positions.set(id, { x: 100 + index * (1000 / Math.max(1, detached.length - 1)), y: 790 }));
    return positions;
  }

  // With no cycle, use longest-path layers in this DAG. This naturally lays out chains,
  // convergence and divergence without inventing reverse edges.
  const incoming = new Map(nodeIds.map((id) => [id, 0]));
  const outgoing = new Map(nodeIds.map((id) => [id, [] as string[]]));
  edges.filter((edge) => !edge.isLyTam).forEach((edge) => {
    if (!incoming.has(edge.sourcePalaceId) || !incoming.has(edge.targetPalaceId)) return;
    outgoing.get(edge.sourcePalaceId)?.push(edge.targetPalaceId);
    incoming.set(edge.targetPalaceId, (incoming.get(edge.targetPalaceId) ?? 0) + 1);
  });
  const queue = nodeIds.filter((id) => incoming.get(id) === 0);
  const layers = new Map(nodeIds.map((id) => [id, 0]));
  while (queue.length) {
    const source = queue.shift()!;
    for (const target of outgoing.get(source) ?? []) {
      layers.set(target, Math.max(layers.get(target) ?? 0, (layers.get(source) ?? 0) + 1));
      incoming.set(target, (incoming.get(target) ?? 0) - 1);
      if (incoming.get(target) === 0) queue.push(target);
    }
  }
  const maxLayer = Math.max(0, ...layers.values());
  const columns = new Map<number, string[]>();
  nodeIds.forEach((id) => { const layer = layers.get(id) ?? 0; columns.set(layer, [...(columns.get(layer) ?? []), id]); });
  columns.forEach((ids, layer) => ids.forEach((id, index) => {
    const x = maxLayer === 0 ? center.x : 95 + layer * (1010 / maxLayer);
    const y = ids.length === 1 ? center.y : 90 + index * (670 / Math.max(1, ids.length - 1));
    positions.set(id, { x, y });
  }));
  return positions;
}
