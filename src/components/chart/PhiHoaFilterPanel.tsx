import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Filter, Settings2, X } from 'lucide-react';
import { STEMS, Stem, TransformationType } from '../../domain/types';
import { getTuHoaRules, TuHoaSchool } from '../../domain/tuHoaEngine';

export type PhiHoaVisibility = Record<TransformationType, boolean>;
export type NamPhaiRelationOptions = { tamHop: boolean; xungChieu: boolean; giapCung: boolean; lines: boolean; highlight: boolean; laiNhan: boolean };
export type NamPhaiLayoutMode = 'auto' | 'compact' | 'wide';

export const DEFAULT_PHI_HOA_VISIBILITY: PhiHoaVisibility = {
  Lộc: true,
  Quyền: true,
  Khoa: true,
  Kỵ: true,
};

const OPTIONS: { type: TransformationType; symbol: string }[] = [
  { type: 'Lộc', symbol: 'A' },
  { type: 'Quyền', symbol: 'B' },
  { type: 'Khoa', symbol: 'C' },
  { type: 'Kỵ', symbol: 'D' },
];

interface PhiHoaFilterPanelProps {
  visibility: PhiHoaVisibility;
  onChange: (visibility: PhiHoaVisibility) => void;
  school: TuHoaSchool;
  birthStem: Stem;
  selectedPalaceStems: Array<{ name: string; stem: Stem }>;
  namPhaiRelationOptions?: NamPhaiRelationOptions;
  onNamPhaiRelationChange?: (options: NamPhaiRelationOptions) => void;
  namPhaiLayoutMode?: NamPhaiLayoutMode;
  onNamPhaiLayoutChange?: (mode: NamPhaiLayoutMode) => void;
}

export const PhiHoaFilterPanel: React.FC<PhiHoaFilterPanelProps> = ({ visibility, onChange, school, birthStem, selectedPalaceStems, namPhaiRelationOptions, onNamPhaiRelationChange, namPhaiLayoutMode, onNamPhaiLayoutChange }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'filter' | 'table'>('filter');
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const allEnabled = OPTIONS.every(({ type }) => visibility[type]);
  const allDisabled = OPTIONS.every(({ type }) => !visibility[type]);
  const namPhaiSettings: Array<[keyof NamPhaiRelationOptions, string]> = [
    ['tamHop', 'Tam Hợp'], ['xungChieu', 'Xung Chiếu'], ['giapCung', 'Giáp Cung'],
    ['lines', 'Hiển thị đường nối'], ['highlight', 'Làm nổi cung liên hệ'], ['laiNhan', 'Đánh dấu Lai Nhân Cung'],
  ];
  const hasDisabledNamPhaiSetting = namPhaiRelationOptions
    ? namPhaiSettings.some(([key]) => !namPhaiRelationOptions[key])
    : false;
  const rules = getTuHoaRules(school);
  const selectedStems = new Map<Stem, string[]>();
  selectedPalaceStems.forEach(({ name, stem }) => selectedStems.set(stem, [...(selectedStems.get(stem) ?? []), name]));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const setAll = (enabled: boolean) => onChange({ Lộc: enabled, Quyền: enabled, Khoa: enabled, Kỵ: enabled });

  return <aside ref={panelRef} className={`phi-hoa-filter ${open ? 'is-open' : ''}`} aria-label="Tiện ích lá số">
    <div className="phi-hoa-filter-actions-top">
    <button ref={triggerRef} className="phi-hoa-filter-trigger" type="button" aria-label={school === 'nam_phai' ? 'Tiện ích Nam Phái' : 'Bộ lọc Phi Hóa'} title={school === 'nam_phai' ? 'Tiện ích Nam Phái' : 'Bộ lọc Phi Hóa'} aria-expanded={open} aria-haspopup="dialog" onClick={() => { setActiveTab('filter'); setOpen((value) => !value); }}>
      <Settings2 size={18} />
      {(school === 'nam_phai' ? hasDisabledNamPhaiSetting : !allEnabled) && <span className="phi-hoa-filter-active-dot" aria-label="Đang tùy chỉnh" />}
    </button>
    {school === 'kham_thien' && <button className={`phi-hoa-table-trigger ${open && activeTab === 'table' ? 'is-active' : ''}`} type="button" aria-label="Mở Bảng Tứ Hóa" title="Tra cứu Bảng Tứ Hóa" aria-expanded={open && activeTab === 'table'} onClick={() => { setActiveTab('table'); setOpen(true); }}>
      <BookOpen size={15} /><span>Bảng Tứ Hóa</span>
    </button>}
    </div>
    {open && <div className={`phi-hoa-filter-content ${activeTab === 'table' ? 'is-table-tab' : ''}`} role="dialog" aria-label="Tiện ích lá số">
      <header className="phi-hoa-filter-heading"><span><Settings2 size={14} /> {school === 'nam_phai' ? 'TIỆN ÍCH NAM PHÁI' : 'TIỆN ÍCH LÁ SỐ'}</span><button className="phi-hoa-filter-close" type="button" aria-label="Đóng tiện ích" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}><X size={15} /></button></header>
      {school === 'kham_thien' && <div className="phi-hoa-tool-tabs" role="tablist" aria-label="Tiện ích lá số">
        <button type="button" role="tab" aria-selected={activeTab === 'filter'} className={activeTab === 'filter' ? 'selected' : ''} onClick={() => setActiveTab('filter')}><Filter size={13} /> Bộ lọc Phi Hóa</button>
        <button type="button" role="tab" aria-selected={activeTab === 'table'} className={activeTab === 'table' ? 'selected' : ''} onClick={() => setActiveTab('table')}><BookOpen size={13} /> Bảng Tứ Hóa</button>
      </div>}
      {school === 'nam_phai' ? <div className="phi-hoa-tool-panel nam-phai-tool-panel" role="tabpanel" aria-label="Tiện ích Nam Phái">
        <p className="phi-hoa-filter-note">Tùy chỉnh quan hệ và bố cục lá số</p>
        <div className="phi-hoa-filter-options">
          {namPhaiSettings.map(([key, label]) => <label key={key} className="phi-hoa-filter-option">
            <input type="checkbox" checked={namPhaiRelationOptions?.[key] ?? false} onChange={(event) => onNamPhaiRelationChange?.({ ...namPhaiRelationOptions!, [key]: event.target.checked })} />
            <span>{label}</span>
          </label>)}
        </div>
        <label className="nam-phai-layout-option"><span>Bố cục lá số</span>
          <select value={namPhaiLayoutMode ?? 'auto'} onChange={(event) => onNamPhaiLayoutChange?.(event.target.value as NamPhaiLayoutMode)}>
            <option value="auto">Tự động</option><option value="compact">Gọn</option><option value="wide">Rộng</option>
          </select>
        </label>
      </div> : activeTab === 'filter' ? <div className="phi-hoa-tool-panel" role="tabpanel" aria-label="Bộ lọc Phi Hóa">
      <p className="phi-hoa-filter-note">Chỉ lọc đường và sơ đồ</p>
      <div className="phi-hoa-filter-options">
        {OPTIONS.map(({ type, symbol }) => <label key={type} className={`phi-hoa-filter-option phi-hoa-${type === 'Lộc' ? 'loc' : type === 'Quyền' ? 'quyen' : type === 'Khoa' ? 'khoa' : 'ky'}`}>
          <input type="checkbox" checked={visibility[type]} onChange={(event) => onChange({ ...visibility, [type]: event.target.checked })} />
          <i aria-hidden="true">{symbol}</i><span>Hóa {type}</span>
        </label>)}
      </div>
      <div className="phi-hoa-filter-actions">
        <button type="button" onClick={() => setAll(true)} disabled={allEnabled}>Chọn hết</button>
        <button type="button" onClick={() => setAll(false)} disabled={allDisabled}>Ẩn hết</button>
      </div>
      </div> : <div className="tuhoa-quick-reference" role="tabpanel" aria-label="Bảng Tứ Hóa Thập Thiên Can">
        <div className="tuhoa-reference-heading"><div><strong>Bảng Tứ Hóa Thập Thiên Can</strong><small>{school === 'kham_thien' ? 'Profile Khâm Thiên' : 'Profile Nam Phái'}</small></div><div className="tuhoa-reference-legend"><span className="phi-hoa-loc">A Lộc</span><span className="phi-hoa-quyen">B Quyền</span><span className="phi-hoa-khoa">C Khoa</span><span className="phi-hoa-ky">D Kỵ</span></div></div>
        <div className="tuhoa-reference-scroll"><table><thead><tr><th>Can</th><th>Lộc</th><th>Quyền</th><th>Khoa</th><th>Kỵ</th></tr></thead><tbody>{STEMS.map((stem) => {
          const labels = [birthStem === stem ? 'Can năm sinh' : '', ...(selectedStems.get(stem) ?? []).map((name) => `Can cung ${name}`)].filter(Boolean);
          return <tr key={stem} className={`${birthStem === stem ? 'is-birth-stem' : ''} ${(selectedStems.has(stem)) ? 'is-selected-palace-stem' : ''}`}><th scope="row"><span>{stem}</span>{labels.length > 0 && <small>{labels.join(' · ')}</small>}</th><td>{rules[stem].Lộc}</td><td>{rules[stem].Quyền}</td><td>{rules[stem].Khoa}</td><td>{rules[stem].Kỵ}</td></tr>;
        })}</tbody></table></div>
      </div>}
    </div>}
  </aside>;
};
