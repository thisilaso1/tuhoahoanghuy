import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { birthInputFromChart, readingRequest, type ReadingJob, type PalaceReading } from '../../api/namPhai';

const stages: [PalaceReading['stage'], string][] = [
  ['cung_vi', '1 · Luận từng cung vị'], ['tam_hop', '2 · Phối hợp tam hợp'],
  ['xung_chieu', '3 · Xung chiếu'], ['giap_cung', '4 · Giáp cung'],
];
export const NamPhaiReadingPanel: React.FC = () => {
  const { activeChart, settings, authenticatedUser } = useApp();
  const [job, setJob] = useState<ReadingJob | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const key = authenticatedUser ? ['nam-phai-reading', authenticatedUser.id, activeChart.solarDate,
    activeChart.time, activeChart.gender, activeChart.forecastYear].join(':') : '';
  const currentKey = useRef(key);
  currentKey.current = key;
  useEffect(() => {
    setJob(null); setError('');
    if (!key) return;
    let disposed = false;
    const id = localStorage.getItem(key);
    if (id) readingRequest('/' + id).then(value => { if (!disposed) setJob(value); }).catch(e => { if (!disposed) setError(e.message); });
    return () => { disposed = true; };
  }, [key]);
  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return;
    let disposed = false;
    const timer = setTimeout(() => {
      readingRequest('/' + job.id).then(value => { if (!disposed) { setJob(value); setError(''); } })
        .catch(e => { if (!disposed) { setError(e.message); setJob(previous => previous ? { ...previous } : previous); } });
    }, 4000);
    return () => { disposed = true; clearTimeout(timer); };
  }, [job]);
  if (settings.school !== 'nam_phai') return null;
  const execute = async (action: 'start' | 'retry' | 'cancel') => {
    setBusy(true); setError('');
    try {
      const value = action === 'start'
        ? await readingRequest('', { school: 'nam_phai', birthInput: birthInputFromChart(activeChart) })
        : await readingRequest('/' + job!.id + '/' + action, {});
      if (key) localStorage.setItem(key, value.id);
      if (currentKey.current === key) setJob(value);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể luận giải.'); }
    finally { setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(job, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'luan-giai-nam-phai.json'; link.click(); URL.revokeObjectURL(url);
  };
  const pending = job && ['queued', 'running'].includes(job.status);
  return <section className="mb-6 rounded-2xl border border-amber-900/30 bg-slate-950/90 p-5 text-stone-200">
    <h2 className="font-serif text-xl text-amber-200">Luận lá số Nam Phái</h2>
    <p className="my-3 text-sm text-stone-400">Luận đủ 12 cung trước, sau đó lần lượt phối hợp tam hợp, xung chiếu và giáp cung. Bạn có thể đọc từng phần khi hoàn tất và quay lại theo dõi sau.</p>
    {!authenticatedUser ? <p className="text-sm">Đăng nhập để sử dụng luận giải theo lá số.</p> : <div className="flex flex-wrap gap-2">
      <button disabled={busy || Boolean(pending)} onClick={() => execute('start')} className="rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Luận lá số đang xem</button>
      {pending && <button disabled={busy} onClick={() => execute('cancel')} className="rounded-lg border border-amber-900/40 px-4 py-2 text-sm">Dừng luận</button>}
      {job && ['failed', 'cancelled'].includes(job.status) && <button disabled={busy} onClick={() => execute('retry')} className="rounded-lg border border-amber-900/40 px-4 py-2 text-sm">Tiếp tục từ phần chưa xong</button>}
      {job && job.results.length > 0 && <button onClick={download} className="rounded-lg border border-amber-900/40 px-4 py-2 text-sm">Tải JSON luận giải</button>}
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    {job && <div className="mt-4">
      <p className="text-sm">{job.chart.name} · {job.chart.solarDate.split('-').reverse().join('-')} · Năm xem {job.chart.forecastYear}</p>
      <p role="status" className="my-2 text-sm text-amber-200">{job.cursor}/{job.total} phần · {job.status === 'completed' ? 'Đã hoàn tất' : job.status === 'cancelled' ? 'Đã dừng' : job.status === 'failed' ? 'Đã tạm dừng vì lỗi' : job.current ? `${stages.find(([id]) => id === job.current!.stage)?.[1]} · ${job.current.palaceName}` : 'Đang chuẩn bị'}</p>
      <progress value={job.cursor} max={job.total} className="w-full accent-amber-200" />
      {job.error && <p className="my-2 text-sm text-stone-400">{job.error === 'invalid_model_json' ? 'Model chưa trả về JSON hợp lệ. Các phần đã xong vẫn được giữ; bạn có thể thử tiếp tục.' : job.error === 'ai_busy' ? 'GPU đang bận; hệ thống sẽ tự chờ để chạy tiếp.' : 'Model chưa sẵn sàng. Các phần đã xong được giữ lại.'}</p>}
      {stages.map(([stage, label]) => <div key={stage} className="mt-4">
        <h3 className="text-sm font-semibold text-amber-200">{label}</h3>
        {job.results.filter(r => r.stage === stage).map(result => <details key={result.palaceIndex} className="mt-2 rounded-lg border border-amber-900/30 p-3">
          <summary className="cursor-pointer text-sm">{result.palaceName} · {result.luan_giai.tong_quan}</summary>
          {([['luan_phu_tinh', 'Phụ tinh & bộ cách'], ['luan_giap_cung', 'Giáp cung'], ['luan_xung_chieu', 'Xung chiếu']] as const)
            .map(([key, title]) => (result[key]?.length ?? 0) > 0 && <div key={key} className="mt-2 text-sm">
              <strong className="text-amber-200">{title}</strong>
              <ul className="mt-1 space-y-1">{result[key]!.map((item, index) => <li key={index}>
                <span className="text-amber-100">{item.loai === 'cach' ? item.ten + (item.quan_he ? ' (' + item.quan_he + ')' : '') : item.ten}</span>: {item.luan_giai}
              </li>)}</ul>
            </div>)}
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
        </details>)}
      </div>)}
    </div>}
  </section>;
};
