import { FlyingTransformation } from './tuHoaEngine';
import { Palace, TransformationType } from './types';

export type QiTransformation = 'LOC' | 'QUYEN' | 'KHOA' | 'KY';
export type QiPattern = 'SAME_QI_CYCLE' | 'MIXED_QI_CYCLE' | 'DISSIPATING_CHAIN' | 'CONVERGENT_FLOW' | 'MIXED_CONVERGENCE' | 'DIVERGENT_FLOW' | 'OVERLAPPING_CYCLES' | 'INCOMING_BRANCH' | 'OUTGOING_BRANCH' | 'OPPOSITE_FLOW' | 'DIRECT_FLOW' | 'LINEAR_CHAIN' | 'MIXED_LINEAR_CHAIN' | 'INDEPENDENT_CHAINS' | 'ORDINARY_CHAIN' | 'DISSIPATION';

export interface QiEdge {
  id: string;
  sourcePalaceId: string;
  targetPalaceId: string;
  transformation: QiTransformation;
  carrierStarId: string;
  isLyTam: boolean;
  isHuongTam: boolean;
  layer: 'NATAL_PALACE';
  sourcePalaceName?: string;
  sourceStem?: string;
  sourceBranch?: string;
  targetPalaceName?: string;
  targetStem?: string;
  targetBranch?: string;
  profileId?: string;
}

export interface QiCycle {
  id: string;
  palaceIds: string[];
  edges: QiEdge[];
  pattern: 'SAME_QI_CYCLE' | 'MIXED_QI_CYCLE';
  transformations: QiTransformation[];
}

export interface QiGraphAnalysis {
  edges: QiEdge[];
  flowEdges: QiEdge[];
  dissipationEdges: QiEdge[];
  cycles: QiCycle[];
  stronglyConnectedComponents: string[][];
  convergencePalaceIds: string[];
  dissipatingPalaceIds: string[];
  truncatedCycleCount: number;
  patterns: QiPattern[];
}

export type QiGraphScope = 'selected' | 'follow' | 'full';
export interface ScopedQiGraph { edges: QiEdge[]; nodes: Set<string> }

/** Apply view scope without mutating or dropping edges from the source calculation graph. */
export function scopeQiGraph(edges: QiEdge[], selectedPalaceIds: string[], allPalaceIds: string[], scope: QiGraphScope, maxDepth = 12): ScopedQiGraph {
  const nodes = new Set(scope === 'full' ? allPalaceIds : selectedPalaceIds);
  if (scope === 'follow') {
    const queue = [...nodes];
    const depth = new Map(queue.map((node) => [node, 0]));
    while (queue.length) {
      const source = queue.shift()!;
      const nextDepth = (depth.get(source) ?? 0) + 1;
      if (nextDepth > maxDepth) continue;
      edges.filter((edge) => !edge.isLyTam && edge.sourcePalaceId === source).forEach((edge) => {
        if (!nodes.has(edge.targetPalaceId)) { nodes.add(edge.targetPalaceId); depth.set(edge.targetPalaceId, nextDepth); queue.push(edge.targetPalaceId); }
      });
    }
  }
  const scopedEdges = scope === 'full'
    ? edges
    : edges.filter((edge) => nodes.has(edge.sourcePalaceId) && (edge.isLyTam || nodes.has(edge.targetPalaceId)));
  return { edges: scopedEdges, nodes };
}

const typeToCode: Record<TransformationType, QiTransformation> = { Lộc: 'LOC', Quyền: 'QUYEN', Khoa: 'KHOA', Kỵ: 'KY' };
const palaceOrder = (id: string) => Number(id.replace(/^palace-/, ''));

export function buildQiEdges(edges: FlyingTransformation[], palaces: Palace[] = []): QiEdge[] {
  const palaceById = new Map(palaces.map((palace) => [`palace-${palace.index}`, palace]));
  return edges.map((edge) => ({
    id: edge.id,
    sourcePalaceId: edge.sourcePalaceId,
    targetPalaceId: edge.targetPalaceId,
    transformation: typeToCode[edge.type],
    carrierStarId: edge.star,
    isLyTam: edge.mode === 'ly_tam',
    isHuongTam: edge.mode === 'huong_tam',
    layer: 'NATAL_PALACE',
    sourcePalaceName: edge.sourcePalaceName,
    sourceStem: edge.sourceStem,
    sourceBranch: palaces.find((palace) => palace.index === edge.sourcePalaceIndex)?.branch,
    targetPalaceName: edge.targetPalaceName,
    targetStem: palaceById.get(edge.targetPalaceId)?.stem,
    targetBranch: palaceById.get(edge.targetPalaceId)?.branch,
    profileId: edge.profileId,
  }));
}

/** Analyze existing natal-palace relations only. Ly Tâm stays a source-equals-target relation, but is never a cycle edge. */
export function analyzeQiGraph(edges: QiEdge[], maxCycles = 100): QiGraphAnalysis {
  const flowEdges = edges.filter((edge) => !edge.isLyTam && edge.sourcePalaceId !== edge.targetPalaceId);
  const dissipationEdges = edges.filter((edge) => edge.isLyTam && edge.sourcePalaceId === edge.targetPalaceId);
  const nodes = [...new Set(flowEdges.flatMap((edge) => [edge.sourcePalaceId, edge.targetPalaceId]))].sort((a, b) => palaceOrder(a) - palaceOrder(b));
  const adjacency = new Map(nodes.map((node) => [node, flowEdges.filter((edge) => edge.sourcePalaceId === node)]));

  // Tarjan SCC decomposition; SCCs are clusters, not assumed to be a single simple cycle.
  let nextIndex = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const stronglyConnectedComponents: string[][] = [];
  const visit = (node: string) => {
    index.set(node, nextIndex); low.set(node, nextIndex); nextIndex += 1;
    stack.push(node); onStack.add(node);
    for (const edge of adjacency.get(node) ?? []) {
      const target = edge.targetPalaceId;
      if (!index.has(target)) { visit(target); low.set(node, Math.min(low.get(node)!, low.get(target)!)); }
      else if (onStack.has(target)) low.set(node, Math.min(low.get(node)!, index.get(target)!));
    }
    if (low.get(node) === index.get(node)) {
      const component: string[] = [];
      let current: string;
      do { current = stack.pop()!; onStack.delete(current); component.push(current); } while (current !== node);
      stronglyConnectedComponents.push(component.sort((a, b) => palaceOrder(a) - palaceOrder(b)));
    }
  };
  nodes.forEach((node) => { if (!index.has(node)) visit(node); });
  const cyclicComponents = stronglyConnectedComponents.filter((component) => component.length > 1);

  // Enumerate real simple cycles. Restrict each DFS to nodes >= its start to canonicalize rotations.
  const cycles: QiCycle[] = [];
  const cycleKeys = new Set<string>();
  let truncatedCycleCount = 0;
  for (const component of cyclicComponents) {
    const allowed = new Set(component);
    for (const start of component) {
      const path = [start];
      const pathEdges: QiEdge[] = [];
      const walk = (node: string) => {
        for (const edge of adjacency.get(node) ?? []) {
          const target = edge.targetPalaceId;
          if (!allowed.has(target) || palaceOrder(target) < palaceOrder(start)) continue;
          if (target === start && path.length >= 2) {
            const cycleEdges = [...pathEdges, edge];
            const key = cycleEdges.map((item) => item.id).join('|');
            if (cycleKeys.has(key)) continue;
            cycleKeys.add(key);
            if (cycles.length >= maxCycles) { truncatedCycleCount += 1; continue; }
            const transformations = [...new Set(cycleEdges.map((item) => item.transformation))];
            cycles.push({
              id: `cycle-${cycles.length + 1}`,
              palaceIds: [...path],
              edges: cycleEdges,
              pattern: transformations.length === 1 ? 'SAME_QI_CYCLE' : 'MIXED_QI_CYCLE',
              transformations,
            });
          } else if (!path.includes(target)) {
            path.push(target); pathEdges.push(edge); walk(target); pathEdges.pop(); path.pop();
          }
        }
      };
      walk(start);
    }
  }

  const incomingSources = new Map(nodes.map((node) => [node, new Set<string>()]));
  const incomingTypes = new Map(nodes.map((node) => [node, new Set<QiTransformation>()]));
  const outgoingTargets = new Map(nodes.map((node) => [node, new Set<string>()]));
  flowEdges.forEach((edge) => {
    incomingSources.get(edge.targetPalaceId)?.add(edge.sourcePalaceId);
    incomingTypes.get(edge.targetPalaceId)?.add(edge.transformation);
    outgoingTargets.get(edge.sourcePalaceId)?.add(edge.targetPalaceId);
  });
  const convergencePalaceIds = [...incomingSources].filter(([, sources]) => sources.size > 1).map(([node]) => node);
  const dissipatingPalaceIds = [...new Set(dissipationEdges.map((edge) => edge.sourcePalaceId))];
  const patterns: QiPattern[] = [];
  if (cycles.some((cycle) => cycle.pattern === 'SAME_QI_CYCLE')) patterns.push('SAME_QI_CYCLE');
  if (cycles.some((cycle) => cycle.pattern === 'MIXED_QI_CYCLE')) patterns.push('MIXED_QI_CYCLE');
  if (cycles.some((cycle) => cycle.palaceIds.some((node) => cycles.some((other) => other.id !== cycle.id && other.palaceIds.includes(node))))) patterns.push('OVERLAPPING_CYCLES');
  const hasDissipatingChain = dissipationEdges.some((exit) => flowEdges.some((edge) => edge.targetPalaceId === exit.sourcePalaceId));
  if (hasDissipatingChain) patterns.push('DISSIPATING_CHAIN');
  if (convergencePalaceIds.length) {
    patterns.push('CONVERGENT_FLOW');
    if (convergencePalaceIds.some((node) => (incomingTypes.get(node)?.size ?? 0) > 1)) patterns.push('MIXED_CONVERGENCE');
  }
  if ([...outgoingTargets.values()].some((targets) => targets.size > 1)) patterns.push('DIVERGENT_FLOW');
  if (flowEdges.some((edge) => edge.isHuongTam)) patterns.push('OPPOSITE_FLOW');
  if (flowEdges.length === 1) patterns.push('DIRECT_FLOW');
  const weakAdjacency = new Map(nodes.map((node) => [node, new Set<string>()]));
  flowEdges.forEach((edge) => { weakAdjacency.get(edge.sourcePalaceId)?.add(edge.targetPalaceId); weakAdjacency.get(edge.targetPalaceId)?.add(edge.sourcePalaceId); });
  const weakSeen = new Set<string>();
  let weakComponentCount = 0;
  nodes.forEach((node) => {
    if (weakSeen.has(node)) return;
    weakComponentCount += 1;
    const queue = [node]; weakSeen.add(node);
    while (queue.length) (weakAdjacency.get(queue.shift()!) ?? []).forEach((neighbor) => { if (!weakSeen.has(neighbor)) { weakSeen.add(neighbor); queue.push(neighbor); } });
  });
  if (weakComponentCount > 1 && flowEdges.length > 1) patterns.push('INDEPENDENT_CHAINS');
  if (!cycles.length && flowEdges.length > 1 && weakComponentCount === 1 && [...outgoingTargets.values()].every((targets) => targets.size <= 1) && [...incomingSources.values()].every((sources) => sources.size <= 1)) {
    patterns.push('LINEAR_CHAIN');
    if (new Set(flowEdges.map((edge) => edge.transformation)).size > 1) patterns.push('MIXED_LINEAR_CHAIN');
  }
  if (cycles.length) {
    const cycleNodes = new Set(cycles.flatMap((cycle) => cycle.palaceIds));
    if (flowEdges.some((edge) => !cycleNodes.has(edge.sourcePalaceId) && cycleNodes.has(edge.targetPalaceId))) patterns.push('INCOMING_BRANCH');
    if (flowEdges.some((edge) => cycleNodes.has(edge.sourcePalaceId) && !cycleNodes.has(edge.targetPalaceId))) patterns.push('OUTGOING_BRANCH');
  }
  if (dissipationEdges.length) patterns.push('DISSIPATION');
  if (!cycles.length && !dissipationEdges.length && flowEdges.length) patterns.push('ORDINARY_CHAIN');

  return { edges, flowEdges, dissipationEdges, cycles, stronglyConnectedComponents: cyclicComponents, convergencePalaceIds, dissipatingPalaceIds, truncatedCycleCount, patterns };
}
