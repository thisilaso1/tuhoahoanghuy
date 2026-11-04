import React, { useState } from 'react';
import { ArrowDownRight, ArrowRight, Wind } from 'lucide-react';
import { FlyingTransformation } from '../../domain/tuHoaEngine';
import { TransformationType } from '../../domain/types';
import { PhiHoaVisibility } from './PhiHoaFilterPanel';

const TAB_ORDER: TransformationType[] = ['Lộc', 'Kỵ', 'Quyền', 'Khoa'];
const typeClass: Record<TransformationType, string> = { Lộc: 'single-qi-loc', Kỵ: 'single-qi-ky', Quyền: 'single-qi-quyen', Khoa: 'single-qi-khoa' };

interface SinglePalaceQiTabsProps { palaceIndex: number; transformations: FlyingTransformation[]; visibility: PhiHoaVisibility }

export const SinglePalaceQiTabs: React.FC<SinglePalaceQiTabsProps> = ({ palaceIndex, transformations, visibility }) => {
  const [activeType, setActiveType] = useState<TransformationType>('Lộc');
  const relations = transformations.filter((item) => item.sourcePalaceIndex === palaceIndex);
  const source = relations[0];
  const active = visibility[activeType] ? relations.find((item) => item.type === activeType) : undefined;
  if (!source) return null;

  return <section className="single-qi-panel" aria-label={`Biểu đồ Phi Hóa cung ${source.sourcePalaceName}`}>
    <div className="single-qi-heading"><div><span className="qi-kicker">SƠ ĐỒ PHI HÓA · CUNG ĐANG CHỌN</span><h2>{source.sourcePalaceName} <small>{source.sourceStem}</small></h2><p>Mỗi tab biểu thị một luồng hóa khí phát từ thiên can của cung này.</p></div><span className="single-qi-total">4 quan hệ</span></div>
    <div className="single-qi-tabs" role="tablist" aria-label="Chọn loại Hóa">
      {TAB_ORDER.map((type) => <button key={type} role="tab" aria-selected={activeType === type} className={`${typeClass[type]} ${activeType === type ? 'active' : ''}`} onClick={() => setActiveType(type)}><i>{type === 'Lộc' ? 'A' : type === 'Quyền' ? 'B' : type === 'Khoa' ? 'C' : 'D'}</i>Hóa {type}</button>)}
    </div>
    {active && <div className={`single-qi-diagram ${typeClass[active.type]}`} role="tabpanel" key={active.id}>
      <div className="single-qi-node source"><span>CUNG PHÁT</span><strong>{active.sourcePalaceName}</strong><small>{active.sourceStem}</small></div>
      <div className={`single-qi-connection ${active.mode === 'ly_tam' ? 'dissipating' : ''}`}>
        <span className="single-qi-carrier">{active.star}</span>
        {active.mode === 'ly_tam' ? <><Wind size={19} /><span className="single-qi-flow-caption">Thoát khí · Ly Tâm</span><ArrowDownRight className="single-qi-direction" size={20} /></> : <><ArrowRight className="single-qi-direction" size={20} /><span className="single-qi-flow-caption">{active.mode === 'huong_tam' ? 'Hướng Tâm · Đối cung' : 'Phi Hóa nhập cung'}</span></>}
        <strong className="single-qi-kind">Hóa {active.type}</strong>
      </div>
      {active.mode === 'ly_tam' ? <div className="single-qi-node exit"><span>KHÍ PHÁT TÁN</span><strong>Ra ngoài cung</strong><small>Không tạo cung đích giả</small></div> : <div className="single-qi-node target"><span>CUNG NHẬN</span><strong>{active.targetPalaceName}</strong><small>{active.mode === 'huong_tam' ? 'Đối cung' : 'Sao nhận hóa'}{active.mode === 'huong_tam' ? '' : ` · ${active.star}`}</small></div>}
    </div>}
    {active ? <div className="single-qi-description">{active.description}</div> : <div className="phi-hoa-empty" role="tabpanel">Đường Hóa {activeType} đang được ẩn trong bộ lọc.</div>}
  </section>;
};
