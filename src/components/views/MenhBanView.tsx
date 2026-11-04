import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NatalChart12, ChartLayerVisibility, ChartTheme } from '../chart/NatalChart12';
import { ActiveChartForm } from '../chart/ActiveChartForm';
import { SinglePalaceQiTabs } from '../chart/SinglePalaceQiTabs';
import { SelectedPalacesQiTabs } from '../chart/SelectedPalacesQiTabs';
import { QiFlowGraph } from '../chart/QiFlowGraph';
import { DEFAULT_PHI_HOA_VISIBILITY, PhiHoaFilterPanel, PhiHoaVisibility } from '../chart/PhiHoaFilterPanel';
import { getFontEmbedCSS, toPng } from 'html-to-image';
import { calculateAllFlyingTransformations, TuHoaSchool } from '../../domain/tuHoaEngine';
import { AgeMatchMode, PalaceAgeOptions } from '../../domain/palaceAge';
import {
  Download,
  Eye,
  EyeOff,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Palette,
} from 'lucide-react';

export const MenhBanView: React.FC = () => {
  const {
    activeChart,
    createChart,
    focusedPalaceIndex,
    setFocusedPalaceIndex,
    sendMessageToThienCo,
    navigateTo,
  } = useApp();

  const [layers, setLayers] = useState<ChartLayerVisibility>({
    showBirthYear: true,
    showAnnual: true,
  });
  const [selectedPhiPalaceIndices, setSelectedPhiPalaceIndices] = useState<number[]>([]);
  const [phiHoaVisibility, setPhiHoaVisibility] = useState<PhiHoaVisibility>(DEFAULT_PHI_HOA_VISIBILITY);
  const [palaceAgeOptions, setPalaceAgeOptions] = useState<PalaceAgeOptions>({
    enabled: false,
    mode: 'FULL_CAN_CHI',
    startYear: 1920,
    endYear: 2030,
    nearestToBirthYearOnly: false,
  });

  const updatePalaceAgeOptions = (patch: Partial<PalaceAgeOptions>) => {
    setPalaceAgeOptions((current) => ({ ...current, ...patch }));
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [chartTheme, setChartTheme] = useState<ChartTheme>(() => {
    const saved = localStorage.getItem('hoai_nguyet_chart_theme');
    return saved === 'parchment' || saved === 'night' ? saved : 'paper';
  });
  const [school, setSchool] = useState<TuHoaSchool>('kham_thien');

  const changeChartTheme = (theme: ChartTheme) => {
    setChartTheme(theme);
    localStorage.setItem('hoai_nguyet_chart_theme', theme);
  };
  const changeSchool = (nextSchool: TuHoaSchool) => {
    setSchool(nextSchool);
    localStorage.setItem('hoai_nguyet_tuhoa_school', nextSchool);
  };

  const toggleLayer = (key: keyof ChartLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePhiPalace = (index: number) => {
    setSelectedPhiPalaceIndices((current) => current.includes(index)
      ? current.filter((selected) => selected !== index)
      : [...current, index]);
    setFocusedPalaceIndex(focusedPalaceIndex === index ? null : index);
  };

  const handleDownloadPng = async () => {
    if (!chartContainerRef.current) return;
    try {
      setIsExporting(true);
      await document.fonts.ready;
      // Tìm phần tử lá số thực (chart-export-frame) để render với kích thước cố định
      const chartEl = chartContainerRef.current.querySelector<HTMLElement>('.chart-export-frame') ?? chartContainerRef.current;
      const fontEmbedCSS = await getFontEmbedCSS(chartEl);
      // Luôn xuất ảnh 1200×1200 bất kể kích thước màn hình
      const dataUrl = await toPng(chartEl, {
        pixelRatio: 2,
        cacheBust: true,
        fontEmbedCSS,
        width: 1200,
        height: 1200,
        style: {
          width: '1200px',
          height: '1200px',
        },
        backgroundColor: chartTheme === 'paper' ? '#fbfcfd' : chartTheme === 'parchment' ? '#efe4d0' : '#0a111c',
      });
      const link = document.createElement('a');
      link.download = `la-so-hoai-nguyet-${activeChart.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Lỗi khi xuất PNG:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const natalFlows = calculateAllFlyingTransformations(activeChart, school);

  return (
    <div className="chart-workspace mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <ActiveChartForm chart={activeChart} onSubmit={createChart} />
      {/* Chart Workspace Toolbar */}
      <div className="chart-workspace-toolbar mb-4 flex flex-col gap-3 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        {/* Action Buttons & Layer Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="chart-theme-picker" role="group" aria-label="Màu nền lá số">
            <Palette size={14} />
            {([
              ['paper', 'Trắng'], ['parchment', 'Nâu giấy'], ['night', 'Xanh đêm'],
            ] as [ChartTheme, string][]).map(([theme, label]) => (
              <button key={theme} onClick={() => changeChartTheme(theme)} className={chartTheme === theme ? 'selected' : ''} aria-pressed={chartTheme === theme}>
                {label}
              </button>
            ))}
          </div>
          <div className="chart-theme-picker chart-school-picker" role="group" aria-label="Trường phái Tứ Hóa">
            <span className="chart-school-label">Phái</span>
            <button onClick={() => changeSchool('kham_thien')} className={school === 'kham_thien' ? 'selected' : ''} aria-pressed={school === 'kham_thien'}>Khâm Thiên</button>
            <button type="button" className="maintenance-option" disabled title="Tính năng Nam Phái đang bảo trì" aria-label="Nam Phái đang bảo trì">Nam Phái <small>Đang bảo trì</small></button>
          </div>
          <label className={`chart-age-toggle ${palaceAgeOptions.enabled ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={palaceAgeOptions.enabled}
              onChange={(event) => updatePalaceAgeOptions({ enabled: event.target.checked })}
            />
            Hiển thị tuổi ứng cung
          </label>
          {palaceAgeOptions.enabled && (
            <div className="chart-age-options" aria-label="Cấu hình tuổi ứng cung">
              <label>
                <span>Đối chiếu</span>
                <select value={palaceAgeOptions.mode} onChange={(event) => updatePalaceAgeOptions({ mode: event.target.value as AgeMatchMode })}>
                  <option value="FULL_CAN_CHI">Can Chi trùng</option>
                  <option value="BRANCH_ONLY">Chỉ trùng Chi</option>
                </select>
              </label>
              <label>
                <span>Từ năm</span>
                <input type="number" value={palaceAgeOptions.startYear} onChange={(event) => updatePalaceAgeOptions({ startYear: Number(event.target.value) })} />
              </label>
              <label>
                <span>Đến năm</span>
                <input type="number" value={palaceAgeOptions.endYear} onChange={(event) => updatePalaceAgeOptions({ endYear: Number(event.target.value) })} />
              </label>
              <label className="chart-age-nearest">
                <input type="checkbox" checked={palaceAgeOptions.nearestToBirthYearOnly} onChange={(event) => updatePalaceAgeOptions({ nearestToBirthYearOnly: event.target.checked })} />
                Gần năm sinh nhất
              </label>
            </div>
          )}
          {/* Toggles */}
          <button
            onClick={() => toggleLayer('showBirthYear')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${layers.showBirthYear ? 'border-sky-400/50 bg-sky-950/40 text-sky-200' : 'border-slate-800 bg-slate-900 text-stone-500'}`}
            title="Bật/Tắt Sinh Niên Tứ Hóa, không thay đổi các cạnh Phi Hóa"
          >
            {layers.showBirthYear ? <Eye size={13} /> : <EyeOff size={13} />} Sinh Niên
          </button>
          <button
            onClick={() => toggleLayer('showAnnual')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
              layers.showAnnual
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-stone-500'
            }`}
          >
            {layers.showAnnual ? <Eye size={13} /> : <EyeOff size={13} />} Tiểu Hạn
          </button>


          {/* Export PNG */}
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center gap-1 rounded-lg border border-stone-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-stone-200 hover:bg-slate-700 transition"
            title="Tải ảnh PNG độ nét cao"
          >
            <Download size={13} />
            <span>{isExporting ? 'Đang xuất...' : 'PNG'}</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-lg border border-stone-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-stone-200 hover:bg-slate-700 transition"
            title="In hoặc lưu PDF"
          >
            <Printer size={13} />
            <span>PDF</span>
          </button>

          {/* Reset Focus */}
          {(focusedPalaceIndex !== null || selectedPhiPalaceIndices.length > 0) && (
            <button
              onClick={() => { setFocusedPalaceIndex(null); setSelectedPhiPalaceIndices([]); }}
              className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
              title="Bỏ chọn cung và ẩn các đường Phi Hóa"
            >
              <RotateCcw size={13} />
              <span>Bỏ chọn cung ({selectedPhiPalaceIndices.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Give the birth chart the full row; palace details follow below it. */}
      <div className="chart-and-filter-layout">
        <div ref={chartContainerRef} className="w-full space-y-4">
          <NatalChart12
            chart={activeChart}
            focusedPalaceIndex={focusedPalaceIndex}
            selectedPhiPalaceIndices={selectedPhiPalaceIndices}
            palaceAgeOptions={palaceAgeOptions}
            onSelectPalace={togglePhiPalace}
            layers={layers}
            theme={chartTheme}
            school={school}
            phiHoaVisibility={phiHoaVisibility}
          />
        </div>
        <PhiHoaFilterPanel visibility={phiHoaVisibility} onChange={setPhiHoaVisibility} school={school} birthStem={activeChart.birthCanChi.year.stem} selectedPalaceStems={selectedPhiPalaceIndices.map((index) => ({ name: activeChart.palaces[index].name, stem: activeChart.palaces[index].stem }))} />

        {/* One selected palace gets four focused Hóa views; multiple selections use the cycle graph. */}
        {selectedPhiPalaceIndices.length === 1 && <SinglePalaceQiTabs palaceIndex={selectedPhiPalaceIndices[0]} transformations={natalFlows} visibility={phiHoaVisibility} />}
        {selectedPhiPalaceIndices.length > 1 && <SelectedPalacesQiTabs transformations={natalFlows} palaceNames={activeChart.palaces.map((palace) => palace.name)} selectedPalaceIndices={selectedPhiPalaceIndices} visibility={phiHoaVisibility} />}
        <QiFlowGraph transformations={natalFlows} palaceNames={activeChart.palaces.map((palace) => palace.name)} palaces={activeChart.palaces} selectedPalaceIndices={selectedPhiPalaceIndices} visibility={phiHoaVisibility} onTogglePalace={togglePhiPalace} />
      </div>

      {/* Bottom Quick Contextual Prompt Bar */}
      <div className="mt-6 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <Sparkles size={16} className="text-amber-400" />
            <span>Đàm đạo cùng Thiên Cơ về mệnh bàn này:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                sendMessageToThienCo('Phân tích cung Mệnh và cung Thân của tôi');
                navigateTo('/thien-co');
              }}
              className="rounded-full border border-amber-900/40 bg-slate-800/80 px-3 py-1 text-xs text-amber-200 hover:border-amber-500 hover:bg-slate-700 transition"
            >
              Cung Mệnh & Thân
            </button>
            <button
              onClick={() => {
                sendMessageToThienCo('Phân tích cung Tài Bạch năm 2026');
                navigateTo('/thien-co');
              }}
              className="rounded-full border border-amber-900/40 bg-slate-800/80 px-3 py-1 text-xs text-amber-200 hover:border-amber-500 hover:bg-slate-700 transition"
            >
              Cung Tài Bạch 2026
            </button>
            <button
              onClick={() => {
                sendMessageToThienCo('Phân tích cung Quan Lộc và con đường sự nghiệp');
                navigateTo('/thien-co');
              }}
              className="rounded-full border border-amber-900/40 bg-slate-800/80 px-3 py-1 text-xs text-amber-200 hover:border-amber-500 hover:bg-slate-700 transition"
            >
              Cung Quan Lộc
            </button>
            <button
              onClick={() => navigateTo('/tu-hoa')}
              className="flex items-center gap-1 rounded-full bg-emerald-600/30 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-600/50 transition"
            >
              <Layers size={13} />
              <span>Chuyên sâu Tứ Hóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
