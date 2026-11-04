import React, { useMemo, useState } from 'react';
import { ArrowRight, CornerUpLeft, Wind } from 'lucide-react';
import { analyzeQiGraph, buildQiEdges, QiEdge } from '../../domain/qiGraph';
import { FlyingTransformation } from '../../domain/tuHoaEngine';
import { TransformationType } from '../../domain/types';
import { PhiHoaVisibility } from './PhiHoaFilterPanel';

const TAB_ORDER: TransformationType[] = ['Lộc', 'Kỵ', 'Quyền', 'Khoa'];
const typeName: Record<QiEdge['transformation'], string> = { LOC: 'Lộc', QUYEN: 'Quyền', KHOA: 'Khoa', KY: 'Kỵ' };
const cssType: Record<TransformationType, string> = { Lộc: 'single-qi-loc', Kỵ: 'single-qi-ky', Quyền: 'single-qi-quyen', Khoa: 'single-qi-khoa' };
const symbol: Record<TransformationType, string> = { Lộc: 'A', Quyền: 'B', Khoa: 'C', Kỵ: 'D' };

interface SelectedPalacesQiTabsProps { selectedPalaceIndices: number[]; palaceNames: string[]; transformations: FlyingTransformation[]; visibility: PhiHoaVisibility }

export const SelectedPalacesQiTabs: React.FC<SelectedPalacesQiTabsProps> = ({ selectedPalaceIndices, palaceNames, transformations, visibility }) => {
  const [activeType, setActiveType] = useState<TransformationType>('Lộc');
  const [showAllCycles, setShowAllCycles] = useState(false);
  const selected = new Set(selectedPalaceIndices);
  const selectedIds = new Set(selectedPalaceIndices.map((index) => `palace-${index}`));
  const sourceEdges = transformations.filter((edge) => selected.has(edge.sourcePalaceIndex) && visibility[edge.type]);
  const activeEdges = sourceEdges.filter((edge) => edge.type === activeType).sort((a, b) => selectedPalaceIndices.indexOf(a.sourcePalaceIndex) - selectedPalaceIndices.indexOf(b.sourcePalaceIndex));
  const graphEdges = useMemo(() => buildQiEdges(sourceEdges).filter((edge) => !edge.isLyTam && selectedIds.has(edge.sourcePalaceId) && selectedIds.has(edge.targetPalaceId)), [sourceEdges, selectedPalaceIndices.join(',')]);
  const analysis = useMemo(() => analyzeQiGraph(graphEdges), [graphEdges]);
  const cycleEdgeIds = new Set(analysis.cycles.flatMap((cycle) => cycle.edges.map((edge) => edge.id)));
  const cyclesToRender = showAllCycles ? analysis.cycles : analysis.cycles.slice(0, 4);
  const transformationById = new Map(sourceEdges.map((edge) => [edge.id, edge]));

  return <section className="single-qi-panel selected-qi-panel" aria-label="Biểu đồ Phi Hóa các cung đã chọn">
    <div className="single-qi-heading"><div><span className="qi-kicker">SƠ ĐỒ PHI HÓA · THỨ TỰ CUNG ĐÃ CHỌN</span><h2>{selectedPalaceIndices.length} cung liên kết</h2><p>Thứ tự chọn cung được giữ nguyên; mũi tên đi theo cạnh Phi Hóa thực tế.</p></div><span className="single-qi-total">{sourceEdges.length} quan hệ</span></div>
    <div className="selected-qi-order" aria-label="Thứ tự cung đã chọn">{selectedPalaceIndices.map((index, order) => <React.Fragment key={index}><span className="selected-qi-order-node"><i>{order + 1}</i>{palaceNames[index]}</span>{order < selectedPalaceIndices.length - 1 && <ArrowRight className="selected-qi-order-arrow" size={15} />}</React.Fragment>)}</div>
    <div className="single-qi-tabs" role="tablist" aria-label="Loại Hóa đang khảo sát">{TAB_ORDER.map((type) => <button key={type} role="tab" aria-selected={activeType === type} className={`${cssType[type]} ${activeType === type ? 'active' : ''}`} onClick={() => setActiveType(type)}><i>{symbol[type]}</i>Hóa {type}</button>)}</div>
    <div className="selected-qi-relations" role="tabpanel">
      {activeEdges.map((edge) => {
        const isLyTam = edge.mode === 'ly_tam';
        const targetSelected = selected.has(edge.targetPalaceIndex);
        const qiEdge = graphEdges.find((item) => item.id === edge.id);
        const isCycleEdge = Boolean(qiEdge && cycleEdgeIds.has(qiEdge.id));
        const sourceOrder = selectedPalaceIndices.indexOf(edge.sourcePalaceIndex);
        const targetOrder = selectedPalaceIndices.indexOf(edge.targetPalaceIndex);
        const returns = isCycleEdge && analysis.cycles.some((cycle) => cycle.edges.at(-1)?.id === qiEdge?.id);
        return <article className={`selected-qi-relation ${cssType[edge.type]} ${isCycleEdge ? 'cycle-edge' : ''}`} key={edge.id}>
          <div className="selected-qi-source"><i>{sourceOrder + 1}</i><div><small>CUNG PHÁT</small><strong>{edge.sourcePalaceName}</strong><em>{edge.sourceStem}</em></div></div>
          <div className="selected-qi-carrier"><span>Hóa {edge.type} · {edge.star}</span><div className="selected-qi-arrow-line"><span />{isLyTam ? <Wind size={17} /> : returns ? <CornerUpLeft size={18} /> : <ArrowRight size={18} />}<span /></div><small>{isLyTam ? 'Thoát khí · Ly Tâm' : returns ? `Quay lại ${edge.targetPalaceName}` : 'Phi Hóa nhập cung'}</small></div>
          <div className={`selected-qi-target ${targetSelected ? 'in-selection' : 'outside-selection'}`}><small>{isLyTam ? 'ĐIỂM PHÁT TÁN' : targetSelected ? `CUNG ĐÃ CHỌN · #${targetOrder + 1}` : 'CUNG NHẬN'}</small><strong>{isLyTam ? 'Ra ngoài cung' : edge.targetPalaceName}</strong><em>{isLyTam ? 'Không tạo cung đích giả' : edge.star}</em></div>
          {isCycleEdge && <span className="selected-qi-cycle-tag">{returns ? 'Khép vòng ↶' : 'Thuộc vòng khí'}</span>}
        </article>;
      })}
      {activeEdges.length === 0 && <div className="phi-hoa-empty">Đường Hóa {activeType} đang được ẩn trong bộ lọc.</div>}
    </div>
    {analysis.cycles.length > 0 && <div className="selected-qi-cycles"><div className="selected-qi-cycles-heading"><div><span className="qi-kicker">VÒNG KHÍ THỰC TẾ GIỮA CÁC CUNG ĐÃ CHỌN</span><p>{analysis.cycles.length} vòng có hướng khép kín · mỗi hàng là một cạnh Phi Hóa có thật</p></div>{analysis.cycles.length > 4 && <button onClick={() => setShowAllCycles((value) => !value)}>{showAllCycles ? 'Thu gọn' : `Xem thêm ${analysis.cycles.length - 4} vòng`}</button>}</div>{cyclesToRender.map((cycle) => <article key={cycle.id} className="selected-qi-cycle-diagram"><header><strong>{cycle.pattern === 'SAME_QI_CYCLE' ? `Vòng đồng khí ${typeName[cycle.transformations[0]]}` : `Vòng hỗn hợp ${cycle.transformations.map((type) => typeName[type]).join(' – ')}`}</strong><span>{cycle.palaceIds.length} cung · {cycle.edges.length} cạnh</span></header><div className="selected-qi-cycle-edges">{cycle.edges.map((edge, index) => { const relation = transformationById.get(edge.id); const sourceIndex = Number(edge.sourcePalaceId.replace('palace-', '')); const targetIndex = Number(edge.targetPalaceId.replace('palace-', '')); const closingEdge = index === cycle.edges.length - 1; const displayType = typeName[edge.transformation] as TransformationType; return <div key={`${cycle.id}:${edge.id}`} className={`selected-qi-relation ${cssType[displayType]} cycle-edge cycle-diagram-edge`}><div className="selected-qi-source"><i>{index + 1}</i><div><small>CUNG PHÁT</small><strong>{palaceNames[sourceIndex]}</strong><em>{relation?.sourceStem}</em></div></div><div className="selected-qi-carrier"><span>Hóa {typeName[edge.transformation]} · {edge.carrierStarId}</span><div className="selected-qi-arrow-line"><span />{closingEdge ? <CornerUpLeft size={18} /> : <ArrowRight size={18} />}<span /></div><small>{closingEdge ? `Quay lại ${palaceNames[targetIndex]} · Khép vòng` : 'Phi Hóa theo chiều cạnh'}</small></div><div className="selected-qi-target in-selection"><small>CUNG ĐÍCH · #{selectedPalaceIndices.indexOf(targetIndex) + 1}</small><strong>{palaceNames[targetIndex]}</strong><em>{edge.carrierStarId}</em></div></div>; })}</div></article>)}</div>}
    <p className="single-qi-description">Các cung nhận ngoài vùng chọn vẫn được ghi rõ; vòng khí chỉ kết luận khi có đủ cạnh khép kín trong dữ liệu thực.</p>
  </section>;
};
