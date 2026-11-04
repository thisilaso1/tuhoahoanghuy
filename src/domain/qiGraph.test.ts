import { describe, expect, it } from 'vitest';
import { analyzeQiGraph, QiEdge, scopeQiGraph } from './qiGraph';
import { layoutQiGraph } from './qiLayout';

const edge = (id: string, from: string, to: string, transformation: QiEdge['transformation'] = 'KY', ly = false): QiEdge => ({
  id, sourcePalaceId: `palace-${from}`, targetPalaceId: `palace-${to}`, transformation,
  carrierStarId: `star-${id}`, isLyTam: ly, isHuongTam: false, layer: 'NATAL_PALACE',
});

describe('Khâm Thiên qi graph analysis', () => {
  it('finds a real mixed two-palace cycle and preserves both edges', () => {
    const result = analyzeQiGraph([edge('mk', '0', '11', 'KY'), edge('hm', '11', '0', 'LOC')]);
    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0]).toMatchObject({ pattern: 'MIXED_QI_CYCLE', palaceIds: ['palace-0', 'palace-11'] });
    expect(result.cycles[0].edges.map((item) => item.transformation)).toEqual(['KY', 'LOC']);
  });

  it('keeps Ly Tâm dissipation outside cycle detection', () => {
    // Golden mạch: Mệnh → Huynh Đệ → Nô Bộc, then Nô Bộc self-transforms Kỵ.
    const result = analyzeQiGraph([edge('ab', '0', '11'), edge('bc', '11', '5'), edge('cc', '5', '5', 'KY', true)]);
    expect(result.cycles).toHaveLength(0);
    expect(result.flowEdges).toHaveLength(2);
    expect(result.dissipationEdges.map((item) => item.sourcePalaceId)).toEqual(['palace-5']);
    expect(result.patterns).toContain('DISSIPATING_CHAIN');
  });

  it('preserves a cycle alongside a Ly Tâm exit at a cycle node', () => {
    const result = analyzeQiGraph([
      edge('ab', '0', '1', 'LOC'), edge('bc', '1', '2', 'QUYEN'), edge('ca', '2', '0', 'KHOA'), edge('bb', '1', '1', 'KY', true),
    ]);
    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0].pattern).toBe('MIXED_QI_CYCLE');
    expect(result.dissipatingPalaceIds).toEqual(['palace-1']);
  });

  it('reports overlapping simple cycles without inventing a combined cycle', () => {
    const result = analyzeQiGraph([
      edge('ab', '0', '1'), edge('bc', '1', '2'), edge('ca', '2', '0'), edge('bd', '1', '3'), edge('db', '3', '1'),
    ]);
    expect(result.cycles).toHaveLength(2);
    expect(result.cycles.map((cycle) => cycle.palaceIds)).toEqual([['palace-0', 'palace-1', 'palace-2'], ['palace-1', 'palace-3']]);
    expect(result.stronglyConnectedComponents).toEqual([['palace-0', 'palace-1', 'palace-2', 'palace-3']]);
    expect(result.patterns).toContain('OVERLAPPING_CYCLES');
  });

  it('classifies a same-qi cycle and retains each edge', () => {
    const result = analyzeQiGraph([edge('ab', '0', '1'), edge('bc', '1', '2'), edge('ca', '2', '0')]);
    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0].pattern).toBe('SAME_QI_CYCLE');
    expect(result.cycles[0].edges.map((item) => item.id)).toEqual(['ab', 'bc', 'ca']);
  });

  it('recognizes convergent sources without counting parallel edges from one source twice', () => {
    const parallelOnly = analyzeQiGraph([edge('a-loc', '0', '3', 'LOC'), edge('a-ky', '0', '3', 'KY')]);
    expect(parallelOnly.convergencePalaceIds).toEqual([]);
    const convergence = analyzeQiGraph([edge('a', '0', '3', 'KY'), edge('b', '1', '3', 'LOC'), edge('c', '2', '3', 'QUYEN')]);
    expect(convergence.convergencePalaceIds).toEqual(['palace-3']);
    expect(convergence.patterns).toContain('MIXED_CONVERGENCE');
  });

  it('classifies branching, opposite flow and independent chains from actual edges', () => {
    const graph = [
      { ...edge('ab', '0', '1', 'LOC'), isHuongTam: true }, edge('ac', '0', '2', 'KY'),
      edge('de', '3', '4', 'KHOA'), edge('fg', '5', '6', 'QUYEN'),
    ];
    const result = analyzeQiGraph(graph);
    expect(result.patterns).toContain('DIVERGENT_FLOW');
    expect(result.patterns).toContain('OPPOSITE_FLOW');
    expect(result.patterns).toContain('INDEPENDENT_CHAINS');
  });

  it('scopes selected-only, follows external palaces and preserves the full graph', () => {
    const edges = [edge('ab', '0', '1'), edge('bc', '1', '2'), edge('cd', '2', '3'), edge('exit', '3', '3', 'KY', true)];
    const selectedOnly = scopeQiGraph(edges, ['palace-0'], ['palace-0', 'palace-1', 'palace-2', 'palace-3'], 'selected');
    expect(selectedOnly.edges).toEqual([]);
    const followed = scopeQiGraph(edges, ['palace-0'], ['palace-0', 'palace-1', 'palace-2', 'palace-3'], 'follow');
    expect(followed.edges.map((item) => item.id)).toEqual(['ab', 'bc', 'cd', 'exit']);
    const full = scopeQiGraph(edges, [], ['palace-0', 'palace-1', 'palace-2', 'palace-3'], 'full');
    expect(full.edges).toHaveLength(4);
    expect(edges).toHaveLength(4);
  });

  it('does not keep a mixed cycle closed after filtering out one of its edge types', () => {
    const mixed = [edge('ab', '0', '1', 'LOC'), edge('bc', '1', '2', 'KY'), edge('ca', '2', '0', 'KY')];
    const kỵOnly = mixed.filter((item) => item.transformation === 'KY');
    expect(analyzeQiGraph(mixed).cycles).toHaveLength(1);
    expect(analyzeQiGraph(kỵOnly).cycles).toHaveLength(0);
  });

  it('lays out a linear chain from left to right and a convergence into the target', () => {
    const chain = [edge('ab', '0', '1'), edge('bc', '1', '2')];
    const chainAnalysis = analyzeQiGraph(chain);
    const chainLayout = layoutQiGraph(['palace-0', 'palace-1', 'palace-2'], chain, chainAnalysis.cycles);
    expect(chainLayout.get('palace-0')!.x).toBeLessThan(chainLayout.get('palace-1')!.x);
    expect(chainLayout.get('palace-1')!.x).toBeLessThan(chainLayout.get('palace-2')!.x);

    const incoming = [edge('ad', '0', '3'), edge('bd', '1', '3'), edge('cd', '2', '3')];
    const convergence = layoutQiGraph(['palace-0', 'palace-1', 'palace-2', 'palace-3'], incoming, []);
    expect(convergence.get('palace-3')!.x).toBeGreaterThan(convergence.get('palace-0')!.x);
    expect(new Set(['palace-0', 'palace-1', 'palace-2'].map((id) => convergence.get(id)!.y)).size).toBe(3);
  });

  it('keeps incoming branches outside the circular cycle node set', () => {
    const graph = [edge('xa', '0', '1'), edge('ab', '1', '2'), edge('bc', '2', '3'), edge('ca', '3', '1')];
    const cycles = analyzeQiGraph(graph).cycles;
    const layout = layoutQiGraph(['palace-0', 'palace-1', 'palace-2', 'palace-3'], graph, cycles);
    expect(cycles[0].palaceIds).toEqual(['palace-1', 'palace-2', 'palace-3']);
    expect(layout.get('palace-0')!.x).toBeLessThan(layout.get('palace-1')!.x);
    expect(new Set(layout.keys()).size).toBe(4);
  });
});
