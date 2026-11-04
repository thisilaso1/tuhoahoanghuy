import React, { useEffect, useMemo, useRef, useState, useId } from 'react';
import { Download, ImageDown, Maximize, Pause, Play, Printer, RotateCcw, Wind, ZoomIn, ZoomOut } from 'lucide-react';
import { analyzeQiGraph, buildQiEdges, QiCycle, QiEdge, QiPattern, scopeQiGraph } from '../../domain/qiGraph';
import { FlyingTransformation } from '../../domain/tuHoaEngine';
import { Palace, TransformationType } from '../../domain/types';
import { PhiHoaVisibility } from './PhiHoaFilterPanel';
import { toPng } from 'html-to-image';
import { layoutQiGraph } from '../../domain/qiLayout';

type AnalysisMode = 'selected' | 'follow' | 'full';
const codeToType: Record<QiEdge['transformation'], TransformationType> = { LOC: 'Lộc', QUYEN: 'Quyền', KHOA: 'Khoa', KY: 'Kỵ' };
const typeName: Record<QiEdge['transformation'], string> = { LOC: 'Lộc', QUYEN: 'Quyền', KHOA: 'Khoa', KY: 'Kỵ' };
const typeClass: Record<QiEdge['transformation'], string> = { LOC: 'qi-loc', QUYEN: 'qi-quyen', KHOA: 'qi-khoa', KY: 'qi-ky' };
const patternName = (cycle: QiCycle) => cycle.pattern === 'SAME_QI_CYCLE'
  ? `Vòng Tuần Hoàn Hóa ${typeName[cycle.transformations[0]]}`
  : `Vòng Phi Hóa Hỗn Hợp: ${cycle.transformations.map((type) => typeName[type]).join(' – ')}`;
const patternLabel: Record<QiPattern, string> = {
  SAME_QI_CYCLE: 'Vòng đồng khí', MIXED_QI_CYCLE: 'Vòng hỗn hợp', DISSIPATING_CHAIN: 'Chuỗi kết thúc Ly Tâm',
  CONVERGENT_FLOW: 'Hội tụ', MIXED_CONVERGENCE: 'Hội tụ nhiều loại Hóa', DIVERGENT_FLOW: 'Phân nhánh',
  OVERLAPPING_CYCLES: 'Vòng giao nhau', INCOMING_BRANCH: 'Nhánh đi vào vòng', OUTGOING_BRANCH: 'Nhánh đi khỏi vòng',
  OPPOSITE_FLOW: 'Có Hướng Tâm', DIRECT_FLOW: 'Phi Hóa một chiều', LINEAR_CHAIN: 'Xuyến liên tuyến tính',
  MIXED_LINEAR_CHAIN: 'Chuỗi hỗn hợp', INDEPENDENT_CHAINS: 'Các chuỗi độc lập', ORDINARY_CHAIN: 'Luồng chưa khép vòng', DISSIPATION: 'Thoát khí Ly Tâm',
};

interface QiFlowGraphProps { transformations: FlyingTransformation[]; palaceNames: string[]; palaces?: Palace[]; selectedPalaceIndices?: number[]; visibility?: PhiHoaVisibility; onTogglePalace?: (index: number) => void }

export const QiFlowGraph: React.FC<QiFlowGraphProps> = ({ transformations, palaceNames, palaces = [], selectedPalaceIndices, visibility, onTogglePalace }) => {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedPalaceIndices ?? palaceNames.map((_, index) => index));
  const selected = selectedPalaceIndices ?? localSelected;
  const [mode, setMode] = useState<AnalysisMode>('follow');
  const [filter, setFilter] = useState<'all' | QiEdge['transformation']>('all');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('1');
  const [replayIndex, setReplayIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const [activeEdge, setActiveEdge] = useState<QiEdge | null>(null);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  const [showAllCycles, setShowAllCycles] = useState(false);
  const [exporting, setExporting] = useState(false);
  const graphRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const graphId = useId().replace(/:/g, '');
  const allEdges = useMemo(() => buildQiEdges(transformations, palaces), [transformations, palaces]);
  useEffect(() => {
    if (selectedPalaceIndices) setLocalSelected(selectedPalaceIndices);
  }, [selectedPalaceIndices?.join(',')]);
  const selectedIds = new Set(selected.map((index) => `palace-${index}`));
  const eligible = useMemo(() => allEdges.filter((edge) => {
    if (visibility && !visibility[codeToType[edge.transformation]]) return false;
    return !visibility && (filter === 'all' || edge.transformation === filter) || Boolean(visibility);
  }), [allEdges, visibility, filter]);
  const scoped = useMemo(() => scopeQiGraph(eligible, selected.map((index) => `palace-${index}`), palaceNames.map((_, index) => `palace-${index}`), mode), [eligible, mode, selected.join(','), palaceNames.length]);
  const autoExpanded = new Set(mode === 'follow' ? [...scoped.nodes].filter((id) => !selectedIds.has(id)) : []);
  const analysis = useMemo(() => analyzeQiGraph(scoped.edges), [scoped.edges]);
  const visibleCycles = analysis.cycles;
  const cyclesToRender = showAllCycles ? visibleCycles : visibleCycles.slice(0, 4);
  const visibleFlows = analysis.flowEdges.filter((edge) => !visibleCycles.some((cycle) => cycle.edges.some((cycleEdge) => cycleEdge.id === edge.id)));

  const togglePalace = (index: number) => onTogglePalace
    ? onTogglePalace(index)
    : setLocalSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);

  useEffect(() => {
    if (!playing || !scoped.edges.length) return;
    const timer = window.setInterval(() => setReplayIndex((current) => {
      if (current + 1 >= scoped.edges.length) { setPlaying(false); return -1; }
      return current + 1;
    }), 760 / Number(speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, scoped.edges]);
  useEffect(() => {
    setPlaying(false);
    setReplayIndex(-1);
    setActiveEdge(null);
    setActiveNodeIndex(null);
    setShowAllCycles(false);
  }, [scoped.edges]);

  const handlePngExport = async () => {
    if (!graphRef.current) return;
    setExporting(true);
    try {
      const image = await toPng(graphRef.current, { pixelRatio: 2, backgroundColor: '#081321' });
      const link = document.createElement('a'); link.download = 'so-do-khi-van-phi-hoa.png'; link.href = image; link.click();
    } finally { setExporting(false); }
  };
  const handleSvgExport = () => {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = '.qi-loc{color:#55cf9d;fill:#55cf9d}.qi-quyen{color:#e4bd72;fill:#e4bd72}.qi-khoa{color:#69a9eb;fill:#69a9eb}.qi-ky{color:#f17c8d;fill:#f17c8d}.qi-network-edge{fill:none;stroke:currentColor;stroke-width:2.3;stroke-opacity:.8}.qi-network-edge.is-huong-tam{stroke-dasharray:10 4 2 4}.qi-network-edge-label{fill:currentColor;paint-order:stroke;stroke:#081321;stroke-width:5px;font:700 11px sans-serif;text-anchor:middle}.qi-network-node rect{fill:#182a3a;stroke:#b4cfdf;stroke-width:1.5}.qi-network-node-name{fill:#e6eef4;font:16px Georgia;text-anchor:middle}.qi-network-node-meta{fill:#9aafbe;font:10px sans-serif;text-anchor:middle}.qi-network-terminal circle{fill:#592d3a;stroke:#f17c8d;stroke-width:2}.qi-network-terminal text{fill:#ffb4bf;font:800 8px sans-serif;text-anchor:middle}';
    clone.insertBefore(style, clone.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'so-do-khi-van-phi-hoa.svg'; link.click(); URL.revokeObjectURL(url);
  };

  const nodeIds = [...scoped.nodes].sort((a, b) => Number(a.replace('palace-', '')) - Number(b.replace('palace-', '')));
  const center = { x: 600, y: 410 };
  const positions = layoutQiGraph(nodeIds, analysis.flowEdges, analysis.cycles);
  const outgoingTargets = new Map<string, Set<string>>();
  analysis.flowEdges.forEach((edge) => { if (!outgoingTargets.has(edge.sourcePalaceId)) outgoingTargets.set(edge.sourcePalaceId, new Set()); outgoingTargets.get(edge.sourcePalaceId)?.add(edge.targetPalaceId); });
  const transformGroup = `translate(${center.x * (1 - zoom) + pan.x} ${center.y * (1 - zoom) + pan.y}) scale(${zoom})`;
  const showCarrierLabels = scoped.edges.length <= 28;

  return (
    <section ref={graphRef} className="qi-graph-panel qi-flow-schematic" aria-label="Sơ đồ Khí Vận Phi Hóa Xuyến Liên">
      <div className="qi-graph-heading">
        <div><span className="qi-kicker">KHÂM THIÊN · ĐỒ THỊ KHÍ VẬN</span><h2>Sơ Đồ Khí Vận · Phi Hóa Xuyến Liên</h2><p>Luồng khí được dựng từ các cạnh Phi Hóa thực tế; Tự Hóa Ly Tâm kết thúc ở điểm thoát riêng, không tạo vòng giả.</p></div>
        <div className="qi-graph-count"><strong>{analysis.flowEdges.length}</strong><span>luồng liên cung</span><i>·</i><strong>{analysis.dissipationEdges.length}</strong><span>điểm ly tâm</span></div>
      </div>

      <div className="qi-graph-controls">
        <div className="qi-mode-switch" role="group" aria-label="Phạm vi sơ đồ">
          {([['selected', 'Cung đã chọn'], ['follow', 'Theo luồng phát'], ['full', 'Toàn bộ 12 cung']] as [AnalysisMode, string][]).map(([value, label]) => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}
        </div>
        <div className="qi-control-side">
          {!visibility && <label>Loại hóa <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Tất cả</option>{(['LOC', 'QUYEN', 'KHOA', 'KY'] as const).map((kind) => <option key={kind} value={kind}>{typeName[kind]}</option>)}</select></label>}
          <button className={`qi-play-button ${playing ? 'active' : ''}`} disabled={!scoped.edges.length} onClick={() => { if (playing) setPlaying(false); else { setReplayIndex((index) => index < 0 || index >= scoped.edges.length ? 0 : index); setPlaying(true); } }}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Tạm dừng' : 'Phát dòng khí'}</button>
          <button className="qi-icon-button" aria-label="Phát lại từ đầu" title="Phát lại" disabled={!scoped.edges.length} onClick={() => { setReplayIndex(0); setPlaying(true); }}><RotateCcw size={14} /></button>
          <button className="qi-icon-button" aria-label="Đặt lại sơ đồ" title="Đặt lại sơ đồ" onClick={() => { setPlaying(false); setReplayIndex(-1); setZoom(1); setPan({ x: 0, y: 0 }); }}><Maximize size={14} /></button>
          <label>Tốc độ <select value={speed} onChange={(event) => setSpeed(event.target.value)}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
          <div className="qi-zoom-controls" aria-label="Thu phóng sơ đồ"><button className="qi-icon-button" aria-label="Thu nhỏ" onClick={() => setZoom((value) => Math.max(.7, value - .15))}><ZoomOut size={14} /></button><span>{Math.round(zoom * 100)}%</span><button className="qi-icon-button" aria-label="Phóng to" onClick={() => setZoom((value) => Math.min(1.8, value + .15))}><ZoomIn size={14} /></button></div>
          <button className="qi-icon-button" aria-label="Xuất PNG" title="Xuất PNG" disabled={exporting} onClick={handlePngExport}><ImageDown size={14} /></button>
          <button className="qi-icon-button" aria-label="Xuất SVG" title="Xuất SVG" onClick={handleSvgExport}><Download size={14} /></button>
          <button className="qi-icon-button" aria-label="In hoặc lưu PDF" title="In hoặc lưu PDF" onClick={() => window.print()}><Printer size={14} /></button>
        </div>
      </div>

      <div className="qi-palace-selector"><span>{onTogglePalace ? 'Cung khởi điểm · đã chọn trên lá số' : 'Cung khởi điểm'}</span><div>{onTogglePalace
        ? selected.map((index) => <button key={palaceNames[index]} className="selected" aria-pressed="true" title="Bỏ cung này khỏi lựa chọn trên lá số" onClick={() => togglePalace(index)}>{palaceNames[index]} ×</button>)
        : palaceNames.map((name, index) => { const isSelected = selected.includes(index); const isExpanded = autoExpanded.has(`palace-${index}`); return <button key={name} className={`${isSelected ? 'selected' : ''} ${isExpanded ? 'auto-expanded' : ''}`} aria-pressed={isSelected} title={isExpanded ? 'Cung được mở rộng tự động từ mạch khí' : undefined} onClick={() => togglePalace(index)}>{name}{isExpanded ? ' ·' : ''}</button>; })}
        {onTogglePalace && selected.length === 0 && <span className="qi-no-start-palaces">Chưa chọn cung nào trên lá số.</span>}
      </div><small>{onTogglePalace ? 'Danh sách luôn đồng bộ với các cung đang chọn trên lá số.' : 'Trong chế độ Theo luồng phát, các cung đích được mở rộng theo cạnh thật, giới hạn trong 12 cung.'}</small></div>

      <div className="qi-analysis-summary">
        <span>{visibleCycles.length} vòng thật</span><span>{analysis.convergencePalaceIds.length} cung hội tụ</span><span>{analysis.dissipatingPalaceIds.length} cung có điểm thoát</span>
        {analysis.patterns.map((pattern) => <span key={pattern} className="qi-pattern-chip">{patternLabel[pattern]}</span>)}
      </div>

      {scoped.edges.length > 0 ? <>
        <div className="qi-network-stage" aria-label="Đồ thị Phi Hóa tương tác">
          <svg ref={svgRef} viewBox="0 0 1200 850" role="img" aria-label="Sơ đồ các cung và luồng Phi Hóa" onPointerDown={(event) => { const target = event.target as SVGElement; if (target === event.currentTarget || target.classList.contains('qi-network-background')) { setDrag({ x: event.clientX, y: event.clientY, originX: pan.x, originY: pan.y }); event.currentTarget.setPointerCapture(event.pointerId); } }} onPointerMove={(event) => { if (drag) { const scale = 1200 / event.currentTarget.getBoundingClientRect().width; setPan({ x: drag.originX + (event.clientX - drag.x) * scale, y: drag.originY + (event.clientY - drag.y) * scale }); } }} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} style={{ cursor: drag ? 'grabbing' : 'grab' }}>
            <defs><linearGradient id="qi-node-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#243b4e" /><stop offset="1" stopColor="#101e2c" /></linearGradient>{(['LOC', 'QUYEN', 'KHOA', 'KY'] as const).map((kind) => <marker key={kind} id={`${graphId}-arrow-${kind}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" className={typeClass[kind]} /></marker>)}</defs>
            <rect className="qi-network-background" width="1200" height="850" rx="18" />
            <g transform={transformGroup}>
              {scoped.edges.map((edge, index) => {
                const source = positions.get(edge.sourcePalaceId);
                if (!source) return null;
                const isExit = edge.isLyTam;
                const radialX = source.x - center.x; const radialY = source.y - center.y; const radialLength = Math.hypot(radialX, radialY) || 1;
                const ux = radialX / radialLength; const uy = radialY / radialLength;
                let target = positions.get(edge.targetPalaceId);
                let path = '';
                let labelX = source.x; let labelY = source.y;
                if (isExit) {
                  target = { x: source.x + ux * 143, y: source.y + uy * 143 };
                  const sx = source.x + ux * 34; const sy = source.y + uy * 29;
                  const ex = target.x - ux * 28; const ey = target.y - uy * 28;
                  const cx = (sx + ex) / 2 - uy * 24; const cy = (sy + ey) / 2 + ux * 24;
                  path = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`; labelX = cx; labelY = cy - 7;
                } else if (target) {
                  const dx = target.x - source.x; const dy = target.y - source.y; const length = Math.hypot(dx, dy) || 1;
                  const nx = -dy / length; const ny = dx / length;
                  const peers = scoped.edges.filter((item) => !item.isLyTam && ((item.sourcePalaceId === edge.sourcePalaceId && item.targetPalaceId === edge.targetPalaceId) || (item.sourcePalaceId === edge.targetPalaceId && item.targetPalaceId === edge.sourcePalaceId)));
                  const lane = (peers.findIndex((item) => item.id === edge.id) - (peers.length - 1) / 2) * 28;
                  const reverseLane = edge.sourcePalaceId.localeCompare(edge.targetPalaceId) > 0 ? 15 : 0;
                  const sx = source.x + dx / length * 72; const sy = source.y + dy / length * 58;
                  const ex = target.x - dx / length * 72; const ey = target.y - dy / length * 58;
                  const cx = (sx + ex) / 2 + nx * (lane + reverseLane); const cy = (sy + ey) / 2 + ny * (lane + reverseLane);
                  path = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`; labelX = (sx + 2 * cx + ex) / 4; labelY = (sy + 2 * cy + ey) / 4 - 7;
                }
                const replayState = playing ? index === replayIndex ? ' replay-current' : index < replayIndex ? ' replay-done' : ' replay-waiting' : '';
                return <g key={edge.id} className={`qi-network-edge-group ${typeClass[edge.transformation]}${replayState}`} role="button" tabIndex={0} aria-label={`${edge.sourcePalaceName} Hóa ${typeName[edge.transformation]} ${edge.carrierStarId} ${isExit ? 'thoát khí Ly Tâm' : `đến ${edge.targetPalaceName}`}`} onClick={(event) => { event.stopPropagation(); setActiveEdge(edge); setActiveNodeIndex(null); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveEdge(edge); } }}>
                  <title>{edge.sourcePalaceName} ({edge.sourceStem}) · Hóa {typeName[edge.transformation]} · {edge.carrierStarId} · {isExit ? 'Tự Hóa Ly Tâm, thoát khí' : `${edge.targetPalaceName}${edge.isHuongTam ? ' · Hướng Tâm' : ''}`}</title>
                  <path d={path} className={`qi-network-edge ${typeClass[edge.transformation]} ${edge.isHuongTam ? 'is-huong-tam' : ''}`} markerEnd={`url(#${graphId}-arrow-${edge.transformation})`} />
                  <text x={labelX} y={labelY} className={`qi-network-edge-label ${typeClass[edge.transformation]}`}><tspan>{edge.isLyTam ? `Tự Hóa ${typeName[edge.transformation]}` : `Hóa ${typeName[edge.transformation]}`}</tspan>{showCarrierLabels && <tspan x={labelX} dy="12" className="qi-network-edge-star">{edge.carrierStarId}</tspan>}{showCarrierLabels && edge.isHuongTam && <tspan x={labelX} dy="10" className="qi-network-edge-star">Hướng Tâm</tspan>}</text>
                  {isExit && target && <g className="qi-network-terminal"><circle cx={target.x} cy={target.y} r="25" /><text x={target.x} y={target.y + 4}>THOÁT KHÍ</text></g>}
                </g>;
              })}
              {nodeIds.map((id) => {
                const index = Number(id.replace('palace-', '')); const point = positions.get(id); if (!point) return null;
                const palace = palaces[index]; const cycleNode = analysis.cycles.some((cycle) => cycle.palaceIds.includes(id));
                const convergent = analysis.convergencePalaceIds.includes(id); const divergent = (outgoingTargets.get(id)?.size ?? 0) > 1;
                return <g key={id} className={`qi-network-node ${selectedIds.has(id) ? 'is-selected' : ''} ${autoExpanded.has(id) ? 'is-expanded' : ''} ${cycleNode ? 'is-cycle-node' : ''} ${convergent ? 'is-convergent' : ''} ${divergent ? 'is-divergent' : ''}`} role="button" tabIndex={0} aria-label={`Chọn cung ${palaceNames[index]}`} onClick={(event) => { event.stopPropagation(); setActiveNodeIndex(index); setActiveEdge(null); togglePalace(index); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveNodeIndex(index); togglePalace(index); } }}>
                  <rect x={point.x - 74} y={point.y - 31} width="148" height="62" rx="13" />
                  <text x={point.x} y={point.y - 3} className="qi-network-node-name">{palaceNames[index]}</text>
                  <text x={point.x} y={point.y + 16} className="qi-network-node-meta">{palace ? `${palace.stem} ${palace.branch}` : ''}{convergent ? ' · Hội tụ' : ''}{divergent ? ' · Phân nhánh' : ''}</text>
                </g>;
              })}
            </g>
          </svg>
          <span className="qi-network-hint">Kéo nền để di chuyển · bấm cung hoặc cạnh để xem chi tiết</span>
        </div>
        {(activeEdge || activeNodeIndex !== null) && <div className="qi-network-details">
          {activeEdge ? <><div><small>CUNG PHÁT</small><strong>{activeEdge.sourcePalaceName}</strong><span>{activeEdge.sourceStem} {activeEdge.sourceBranch ?? ''}</span></div><i className={`qi-flow-type ${typeClass[activeEdge.transformation]}`}>{activeEdge.isLyTam ? `Tự Hóa ${typeName[activeEdge.transformation]}` : `Hóa ${typeName[activeEdge.transformation]}`}</i><div><small>SAO MANG HÓA</small><strong>{activeEdge.carrierStarId}</strong><span>{activeEdge.isHuongTam ? `Hướng Tâm · Profile ${activeEdge.profileId ?? 'hiện tại'}` : activeEdge.isLyTam ? 'Ly Tâm · Thoát khí' : 'Phi Hóa nhập cung'}</span></div><div><small>{activeEdge.isLyTam ? 'ĐIỂM PHÁT TÁN' : 'CUNG NHẬN'}</small><strong>{activeEdge.isLyTam ? 'Ra ngoài cung' : activeEdge.targetPalaceName}</strong><span>{activeEdge.isLyTam ? 'Display terminal, không phải cung thứ 13' : `${activeEdge.targetStem ?? ''} ${activeEdge.targetBranch ?? ''}`}</span></div></> : <><div><small>CUNG ĐANG XEM</small><strong>{palaceNames[activeNodeIndex!]}</strong><span>{palaces[activeNodeIndex!]?.stem} {palaces[activeNodeIndex!]?.branch}</span></div><span>Cung đã được chọn làm điểm khởi đầu trong phạm vi sơ đồ.</span></>}
        </div>}
      </> : <div className="qi-empty">{Object.values(visibility ?? { Lộc: true, Quyền: true, Khoa: true, Kỵ: true }).every((enabled) => !enabled) ? 'Chưa có đường Phi Hóa được bật. Hãy chọn ít nhất một loại hóa khí để xem sơ đồ.' : selected.length === 0 && mode !== 'full' ? 'Chọn cung khởi điểm hoặc chuyển sang Toàn bộ 12 cung để xem sơ đồ.' : 'Không có quan hệ Phi Hóa phù hợp với lựa chọn hiện tại.'}</div>}

      {visibleCycles.length > 0 && <div className="qi-cycles-section">
        <div className="qi-cycles-section-heading"><h3>{visibleCycles.length} vòng có hướng thực</h3>{visibleCycles.length > 4 && <button type="button" onClick={() => setShowAllCycles((value) => !value)}>{showAllCycles ? 'Thu gọn' : `Xem thêm ${visibleCycles.length - 4} vòng`}</button>}</div>
        <div className="qi-cycle-list">
        {cyclesToRender.map((cycle) => <CycleCard key={cycle.id} cycle={cycle} palaceNames={palaceNames} dissipationEdges={analysis.dissipationEdges.filter((edge) => cycle.palaceIds.includes(edge.sourcePalaceId))} incoming={analysis.flowEdges.filter((edge) => !cycle.palaceIds.includes(edge.sourcePalaceId) && cycle.palaceIds.includes(edge.targetPalaceId))} outgoing={analysis.flowEdges.filter((edge) => cycle.palaceIds.includes(edge.sourcePalaceId) && !cycle.palaceIds.includes(edge.targetPalaceId))} playing={false} speed={speed} />)}
        </div>
      </div>}

      {(visibleFlows.length > 0 || analysis.dissipationEdges.length > 0) && <div className="qi-flow-list">
        <h3>{mode === 'selected' ? 'Quan hệ giữa các cung được chọn' : mode === 'full' ? 'Toàn bộ luồng khí nguyên bàn' : 'Các nhánh khí ngoài chu trình'}</h3>
        {visibleFlows.map((edge) => <div className="qi-flow-row" key={edge.id}><span className="qi-flow-palace">{palaceNames[Number(edge.sourcePalaceId.split('-')[1])]}</span><span className={`qi-flow-type ${typeClass[edge.transformation]}`}>{typeName[edge.transformation]}</span><span className="qi-flow-arrow">→</span><span className="qi-flow-palace">{palaceNames[Number(edge.targetPalaceId.split('-')[1])]}</span><small>{edge.carrierStarId}</small>{analysis.convergencePalaceIds.includes(edge.targetPalaceId) && <em>Hội tụ</em>}</div>)}
        {analysis.dissipationEdges.map((edge) => <div className="qi-flow-row qi-dissipation-row" key={edge.id}><span className="qi-flow-palace">{palaceNames[Number(edge.sourcePalaceId.split('-')[1])]}</span><span className={`qi-flow-type ${typeClass[edge.transformation]}`}>{typeName[edge.transformation]}</span><Wind size={14} /><span className="qi-dissipation-label">Thoát khí · Tự Hóa Ly Tâm</span><small>{edge.carrierStarId}</small></div>)}
      </div>}
      {analysis.truncatedCycleCount > 0 && <p className="qi-truncated-note">Còn {analysis.truncatedCycleCount} chu trình thực chưa hiển thị. Hãy thu hẹp cung hoặc bộ lọc để xem thêm.</p>}
    </section>
  );
};

interface CycleCardProps { cycle: QiCycle; palaceNames: string[]; dissipationEdges: QiEdge[]; incoming: QiEdge[]; outgoing: QiEdge[]; playing: boolean; speed: string }

const CycleCard: React.FC<CycleCardProps> = ({ cycle, palaceNames, dissipationEdges, incoming, outgoing, playing, speed }) => {
  const [showBranches, setShowBranches] = useState(false);
  const count = cycle.palaceIds.length;
  const radius = count === 2 ? 74 : 90;
  const center = 130;
  const positions = cycle.palaceIds.map((_, index) => {
    const angle = -Math.PI / 2 + index * 2 * Math.PI / count;
    return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  return <article className="qi-cycle-card">
    <div className="qi-cycle-title"><div><span className="qi-kicker">{cycle.pattern === 'SAME_QI_CYCLE' ? 'ĐỒNG KHÍ' : 'HỖN HỢP'} · {count} CUNG · {cycle.edges.length} CẠNH</span><h3>{patternName(cycle)}</h3></div><span className="qi-cycle-count">{cycle.edges.length} quan hệ</span></div>
    <div className={`qi-cycle-diagram ${playing ? 'is-playing' : ''}`} style={{ '--qi-speed': `${2.8 / Number(speed)}s` } as React.CSSProperties}>
      <svg viewBox="0 0 260 260" role="img" aria-label={cycle.palaceIds.map((id) => palaceNames[Number(id.split('-')[1])]).join(' → ')}>
        <defs>{(['LOC', 'QUYEN', 'KHOA', 'KY'] as const).map((kind) => <marker key={kind} id={`qi-arrow-${cycle.id}-${kind}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" className={typeClass[kind]} /></marker>)}</defs>
        {cycle.edges.map((edge, index) => {
          const from = positions[index]; const to = positions[(index + 1) % count];
          const dx = to.x - from.x; const dy = to.y - from.y; const distance = Math.hypot(dx, dy) || 1;
          const inset = 45;
          const sx = from.x + dx / distance * inset; const sy = from.y + dy / distance * inset;
          const ex = to.x - dx / distance * inset; const ey = to.y - dy / distance * inset;
          const bend = count === 2 ? (index === 0 ? -28 : 28) : 0;
          const mx = (from.x + to.x) / 2 + bend; const my = (from.y + to.y) / 2 + bend;
          const d = count === 2 ? `M${sx},${sy} Q${mx},${my} ${ex},${ey}` : `M${sx},${sy} L${ex},${ey}`;
          return <g key={edge.id}><path d={d} className={`qi-cycle-edge ${typeClass[edge.transformation]} ${playing ? 'flowing' : ''}`} style={{ animationDelay: `${index * .45}s` }} markerEnd={`url(#qi-arrow-${cycle.id}-${edge.transformation})`} /><text x={mx} y={my - 5} textAnchor="middle" className={`qi-edge-label ${typeClass[edge.transformation]}`}>{typeName[edge.transformation]} · {edge.carrierStarId}</text></g>;
        })}
        <circle cx="130" cy="130" r={radius + 35} className="qi-cycle-frame" />
      </svg>
      {cycle.palaceIds.map((id, index) => <div key={id} className="qi-cycle-node" style={{ left: `${positions[index].x / 260 * 100}%`, top: `${positions[index].y / 260 * 100}%` }}><strong>{palaceNames[Number(id.split('-')[1])]}</strong>{dissipationEdges.some((edge) => edge.sourcePalaceId === id) && <small>Thoát khí</small>}</div>)}
    </div>
    <div className="qi-cycle-meta"><span>{cycle.palaceIds.map((id) => palaceNames[Number(id.split('-')[1])]).join(' → ')} → {palaceNames[Number(cycle.palaceIds[0].split('-')[1])]}</span><span>{cycle.transformations.map((kind) => typeName[kind]).join(' · ')}</span></div>
    {(incoming.length > 0 || outgoing.length > 0 || dissipationEdges.length > 0) && <div className="qi-cycle-branches"><button type="button" onClick={() => setShowBranches((value) => !value)}>{showBranches ? 'Thu gọn chi tiết nhánh' : `Chi tiết nhánh: ${incoming.length} vào · ${outgoing.length} ra · ${dissipationEdges.length} điểm thoát`}</button>{showBranches && <>{incoming.length > 0 && <span>Nhánh vào: {incoming.map((edge) => `${palaceNames[Number(edge.sourcePalaceId.split('-')[1])]} · ${typeName[edge.transformation]} · ${edge.carrierStarId}`).join(', ')}</span>}{outgoing.length > 0 && <span>Nhánh ra: {outgoing.map((edge) => `${palaceNames[Number(edge.targetPalaceId.split('-')[1])]} · ${typeName[edge.transformation]} · ${edge.carrierStarId}`).join(', ')}</span>}{dissipationEdges.map((edge) => <span key={edge.id}>Thoát khí tại {palaceNames[Number(edge.sourcePalaceId.split('-')[1])]} · Tự Hóa {typeName[edge.transformation]} · {edge.carrierStarId}</span>)}</>}</div>}
  </article>;
};
