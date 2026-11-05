import { getNamPhaiPalaceRelations } from './namPhaiPalaceRelationEngine';

export type EdgeSide = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';
export type RelationType = 'tam-hop' | 'tam-hop-bridge' | 'xung-chieu' | 'giap-cung';

export interface ChartRect { left: number; top: number; width: number; height: number }
export interface EdgeAnchor { palaceId: number; side: EdgeSide; x: number; y: number }
export interface RelationGeometry {
  source: EdgeAnchor;
  target: EdgeAnchor;
  relationType: RelationType;
}

export interface RelationAnchorOptions { cornerPadding?: number }

const center = (rect: ChartRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

function getBoardBounds(rects: ReadonlyMap<number, ChartRect>): ChartRect {
  const values = [...rects.values()];
  const left = Math.min(...values.map((rect) => rect.left));
  const top = Math.min(...values.map((rect) => rect.top));
  const right = Math.max(...values.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...values.map((rect) => rect.top + rect.height));
  return { left, top, width: right - left, height: bottom - top };
}

function getInwardSides(rect: ChartRect, board: ChartRect): EdgeSide[] {
  const point = center(rect);
  const boardCenter = center(board);
  // Normalize against one palace dimension so the chart's aspect ratio does
  // not make a corner palace look like a side palace.
  const dx = (point.x - boardCenter.x) / rect.width;
  const dy = (point.y - boardCenter.y) / rect.height;
  const xSide: EdgeSide = dx < 0 ? 'RIGHT' : 'LEFT';
  const ySide: EdgeSide = dy < 0 ? 'BOTTOM' : 'TOP';
  if (Math.abs(dx) >= 1 && Math.abs(dy) >= 1) return [xSide, ySide];
  return [Math.abs(dx) > Math.abs(dy) ? xSide : ySide];
}

function pointOnInwardEdge(
  rect: ChartRect,
  board: ChartRect,
  ordinal: number,
  total: number,
  requestedPadding: number,
  anchorAtInnerCorner = false,
): { side: EdgeSide; x: number; y: number } {
  const inwardSides = getInwardSides(rect, board);
  // Corner palaces use one of their two inward-facing edges, near the inner
  // corner. This keeps the line clear of star labels while preserving the
  // chart's inner-corner direction.
  const isCorner = inwardSides.length === 2;
  const sideIndex = ordinal % inwardSides.length;
  const side = inwardSides[sideIndex];
  const palaceCenter = center(rect);
  const boardCenter = center(board);
  if (isCorner && anchorAtInnerCorner) {
    return {
      side,
      x: palaceCenter.x < boardCenter.x ? rect.left + rect.width : rect.left,
      y: palaceCenter.y < boardCenter.y ? rect.top + rect.height : rect.top,
    };
  }
  const horizontal = side === 'TOP' || side === 'BOTTOM';
  const length = horizontal ? rect.width : rect.height;
  const padding = Math.min(Math.max(0, requestedPadding), length * 0.25);
  const usable = Math.max(0, length - 2 * padding);
  const perSideOrdinal = isCorner ? Math.floor(ordinal / inwardSides.length) : ordinal;
  const perSideTotal = isCorner ? Math.ceil(total / inwardSides.length) : total;
  const cornerReach = Math.max(padding, Math.min(length * 0.4, length - padding));
  const offset = isCorner
    ? padding + (cornerReach - padding) * ((perSideOrdinal + 1) / (perSideTotal + 1))
    : padding + usable * ((perSideOrdinal + 1) / (perSideTotal + 1));
  if (side === 'TOP') return { side, x: isCorner && palaceCenter.x < boardCenter.x ? rect.left + rect.width - offset : rect.left + offset, y: rect.top };
  if (side === 'BOTTOM') return { side, x: isCorner && palaceCenter.x > boardCenter.x ? rect.left + offset : rect.left + rect.width - offset, y: rect.top + rect.height };
  if (side === 'LEFT') return { side, x: rect.left, y: isCorner && palaceCenter.y < boardCenter.y ? rect.top + rect.height - offset : rect.top + offset };
  return { side, x: rect.left + rect.width, y: isCorner && palaceCenter.y > boardCenter.y ? rect.top + offset : rect.top + rect.height - offset };
}

interface PendingRelation { targetIndex: number; relationType: RelationType }

export function calculateNamPhaiRelationGeometry(
  rects: ReadonlyMap<number, ChartRect>,
  selectedIndex: number,
  enabled: { tamHop: boolean; xungChieu: boolean; giapCung: boolean },
  options: RelationAnchorOptions = {},
): RelationGeometry[] {
  const sourceRect = rects.get(selectedIndex);
  if (!sourceRect || rects.size === 0) return [];
  const board = getBoardBounds(rects);
  const relations = getNamPhaiPalaceRelations(selectedIndex);
  const pending: PendingRelation[] = [
    ...(enabled.tamHop ? relations.tamHop.map((targetIndex) => ({ targetIndex, relationType: 'tam-hop' as const })) : []),
    ...(enabled.xungChieu ? [{ targetIndex: relations.xungChieu, relationType: 'xung-chieu' as const }] : []),
    ...(enabled.giapCung ? relations.giapCung.map((targetIndex) => ({ targetIndex, relationType: 'giap-cung' as const })) : []),
  ].filter(({ targetIndex }) => rects.has(targetIndex));

  const padding = options.cornerPadding ?? 18;
  const sharedSource = pointOnInwardEdge(sourceRect, board, 0, 1, padding, true);
  const relationGeometry: RelationGeometry[] = pending.flatMap((item) => {
    const targetRect = rects.get(item.targetIndex);
    if (!targetRect) return [];
    const target = pointOnInwardEdge(targetRect, board, 0, 1, padding, true);
    return [{
      source: { palaceId: selectedIndex, ...sharedSource },
      target: { palaceId: item.targetIndex, ...target },
      relationType: item.relationType,
    }];
  });
  const tamHopTargets = relationGeometry.filter(({ relationType }) => relationType === 'tam-hop');
  if (tamHopTargets.length === 2) {
    relationGeometry.push({
      source: tamHopTargets[0].target,
      target: tamHopTargets[1].target,
      relationType: 'tam-hop-bridge',
    });
  }
  return relationGeometry;
}
