import { useRef, useState } from 'react';
import { Download, Eye, EyeOff, Printer, Search, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';
import { BirthInput, buildChart, canChiYear, transformationTargets, TU_HOA, STEMS } from './astrology';

const GRID: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4], 4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4], 2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

const defaultInput: BirthInput = {
  name: 'Nguyễn Minh An', date: '1992-08-18', hour: 9, gender: 'Nam', calendar: 'solar', forecastYear: new Date().getFullYear(),
};

function App() {
  const [form, setForm] = useState(defaultInput);
  const [chartInput, setChartInput] = useState(defaultInput);
  const [showAnnual, setShowAnnual] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = buildChart(chartInput);
  const birthYear = Number(chartInput.date.slice(0, 4));
  const birthCanChi = canChiYear(birthYear);
  const forecastCanChi = canChiYear(chartInput.forecastYear);
  const arrows = transformationTargets(chart, chartInput.forecastYear);

  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function downloadPng() {
    if (!chartRef.current) return;
    const dataUrl = await toPng(chartRef.current, { pixelRatio: 2, backgroundColor: '#f7f0df' });
    const link = document.createElement('a');
    link.download = `la-so-tu-hoa-${chartInput.name.trim().replaceAll(' ', '-').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <main>
      <header className="hero">
        <div className="brand-mark">天</div>
        <div>
          <p className="eyebrow">Mệnh bàn phương Đông</p>
          <h1>Tứ Hóa <i>Khâm Thiên</i></h1>
          <p className="hero-copy">Lập mệnh bàn, quan sát phi hóa và tra cứu Lộc · Quyền · Khoa · Kỵ trên cùng một đồ hình.</p>
        </div>
        <div className="seal">KHÂM<br />THIÊN</div>
      </header>

      <section className="workspace">
        <aside className="input-panel">
          <div className="section-heading"><span>01</span><div><small>Thông tin đương số</small><h2>An mệnh bàn</h2></div></div>
          <label>Họ và tên<input value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <div className="field-pair">
            <label>Ngày sinh<input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label>
            <label>Giờ sinh<select value={form.hour} onChange={(event) => update('hour', Number(event.target.value))}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}</select></label>
          </div>
          <div className="segmented">
            <button className={form.gender === 'Nam' ? 'active' : ''} onClick={() => update('gender', 'Nam')}>Nam</button>
            <button className={form.gender === 'Nữ' ? 'active' : ''} onClick={() => update('gender', 'Nữ')}>Nữ</button>
          </div>
          <label>Loại lịch<select value={form.calendar} onChange={(event) => update('calendar', event.target.value as BirthInput['calendar'])}><option value="solar">Dương lịch</option><option value="lunar">Âm lịch</option></select></label>
          <label>Năm cần xem<input type="number" min="1900" max="2200" value={form.forecastYear} onChange={(event) => update('forecastYear', Number(event.target.value))} /></label>
          <button className="primary" onClick={() => setChartInput(form)}><Sparkles size={17} /> Lập lá số</button>
          <p className="method-note">Bản tính nghiệm thu: Tứ Hóa theo Can năm xem; 12 cung và lớp hạn được dựng độc lập để thuận tiện hiệu chỉnh quy tắc môn phái.</p>
        </aside>

        <section className="chart-area">
          <div className="chart-toolbar">
            <div><small>Mệnh bàn đang xem</small><strong>{chartInput.name} · {forecastCanChi.stem} {forecastCanChi.branch} {chartInput.forecastYear}</strong></div>
            <div className="toolbar-actions">
              <button onClick={() => setShowArrows((value) => !value)}>{showArrows ? <Eye size={16} /> : <EyeOff size={16} />} Phi hóa</button>
              <button onClick={() => setShowAnnual((value) => !value)}>{showAnnual ? <Eye size={16} /> : <EyeOff size={16} />} Tiểu hạn</button>
              <button onClick={downloadPng}><Download size={16} /> PNG</button>
              <button onClick={() => window.print()}><Printer size={16} /> PDF</button>
            </div>
          </div>

          <div className="chart-frame" ref={chartRef}>
            <div className="chart-grid">
              {chart.map((palace) => (
                <article className="palace" key={palace.branch} style={{ gridRow: GRID[palace.index][0], gridColumn: GRID[palace.index][1] }}>
                  <header><b>{palace.name}</b><em>{palace.branch}</em></header>
                  <div className="stars major">{palace.majorStars.map((star) => <span key={star}>{star}</span>)}</div>
                  <div className="stars support">{palace.supportStars.map((star) => <span key={star}>{star}</span>)}</div>
                  <footer><span>ĐH {palace.decade}</span><span>Nguyệt {palace.lunarMonth}</span>{showAnnual && <strong>TH {palace.annualAge}</strong>}</footer>
                </article>
              ))}
              <div className="chart-center">
                <div className="yin-yang">☯</div>
                <p>ĐƯƠNG SỐ</p><h3>{chartInput.name}</h3>
                <dl><dt>Sinh năm</dt><dd>{birthCanChi.stem} {birthCanChi.branch} {birthYear}</dd><dt>Giờ sinh</dt><dd>{String(chartInput.hour).padStart(2, '0')}:00</dd><dt>Năm xem</dt><dd>{forecastCanChi.stem} {forecastCanChi.branch}</dd><dt>Âm dương</dt><dd>{chartInput.gender}</dd></dl>
              </div>
              {showArrows && <svg className="arrows" viewBox="0 0 1000 1000" aria-label="Đường phi hóa">
                <defs>{arrows.map(({ kind }) => <marker key={kind} id={`arrow-${kind}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" className={`fill-${kind}`} /></marker>)}</defs>
                {arrows.map(({ kind, target }, index) => {
                  const [row, column] = GRID[target];
                  const x = (column - .5) * 250; const y = (row - .5) * 250;
                  return <path key={kind} d={`M ${460 + index * 28} ${510 + index * 18} Q 500 ${y > 500 ? 700 : 300}, ${x} ${y}`} className={`arrow arrow-${kind}`} markerEnd={`url(#arrow-${kind})`} />;
                })}
              </svg>}
            </div>
            <div className="legend">{arrows.map(({ kind, star }) => <span key={kind} className={`tag tag-${kind}`}><i /> {kind}: {star}</span>)}</div>
          </div>
        </section>
      </section>

      <section className="lookup">
        <div className="section-heading light"><span>02</span><div><small>Tra cứu nhanh</small><h2>Bảng Tứ Hóa theo Thiên Can</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Thiên Can</th><th>Hóa Lộc</th><th>Hóa Quyền</th><th>Hóa Khoa</th><th>Hóa Kỵ</th></tr></thead><tbody>{STEMS.map((stem) => <tr key={stem} className={stem === forecastCanChi.stem ? 'selected' : ''}><th>{stem}</th><td>{TU_HOA[stem].Lộc}</td><td>{TU_HOA[stem].Quyền}</td><td>{TU_HOA[stem].Khoa}</td><td>{TU_HOA[stem].Kỵ}</td></tr>)}</tbody></table></div>
        <div className="search-hint"><Search size={18} /><span>Dòng <b>{forecastCanChi.stem}</b> đang được đánh dấu theo năm xem {chartInput.forecastYear}.</span></div>
      </section>
      <footer className="site-footer">Tứ Hóa Khâm Thiên · Công cụ nghiên cứu và tham khảo học thuật</footer>
    </main>
  );
}

export default App;
