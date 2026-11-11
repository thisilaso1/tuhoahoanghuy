import React, { useEffect, useState } from 'react';
import type { NatalChart } from '../../domain/types';
import { useApp } from '../../context/AppContext';
import { palaceReadingPayload, type PalaceReading } from '../../api/namPhai';

type Result = { dau_vao: { gioi_tinh: string; can_chi: NatalChart['birthCanChi']; cung_chu: { ten: string; dia_chi: string; thien_can: string } }; luan_giai: PalaceReading['luan_giai']; sources: { title: string }[] };
export const VuKhucReading: React.FC<{ chart: NatalChart; palaceIndex: number }> = ({ chart, palaceIndex }) => {
  const { authenticatedUser } = useApp();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState('');
  const payload = JSON.stringify(palaceReadingPayload(chart, palaceIndex, attempt > 0));
  useEffect(() => {
    setResult(null); setError(''); setLoading(false);
    if (!authenticatedUser) return;
    const controller = new AbortController();
    setLoading(true);
    setProgress('Đang gửi thông tin cung vị, chính tinh, phụ tinh, Can Chi và giới tính…');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/ai/palace', { method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: payload });
        let data = await response.json();
        if (!response.ok) throw new Error(response.status === 401 ? 'Vui lòng đăng nhập để luận cung.' : data.error === 'ai_busy' ? 'Model đang bận. Bạn bấm thử lại sau nhé.' : data.error === 'vu_khuc_not_in_palace' ? 'Lá số trên máy chủ không có Vũ Khúc tại cung này. Vui lòng an lại lá số.' : 'Model chưa trả được lời luận hợp lệ. Bạn có thể thử lại.');
        while (!controller.signal.aborted && ['queued', 'running'].includes(data.status)) {
          setProgress(data.status === 'running' ? 'Model đang luận cung này…' : 'Đã nhận đủ thông tin cung. Đang chờ lượt GPU; hệ thống sẽ tự chạy tiếp.');
          await new Promise(resolve => setTimeout(resolve, 2500));
          if (controller.signal.aborted) return;
          const poll = await fetch('/api/auth/ai/palace/' + data.id, { signal: controller.signal });
          if (!poll.ok) throw new Error('Không đọc được tiến độ luận cung. Vui lòng thử lại.');
          data = await poll.json();
        }
        if (data.status === 'failed') throw new Error('Model chưa trả được lời luận hợp lệ. Thông tin cung đã được lưu, bạn có thể bấm luận lại.');
        if (!controller.signal.aborted) setResult(data);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Không kết nối được model.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [payload, authenticatedUser?.id, attempt]);
  return <section className="mt-4 rounded-xl border border-amber-600/30 bg-slate-950/70 p-4" aria-label="Luận Vũ Khúc theo cung">
    <h4 className="font-serif text-base text-amber-200">Vũ Khúc · Luận cung Nam Phái</h4>
    {!authenticatedUser && <p className="mt-2 text-sm text-stone-300">Đăng nhập để model luận Vũ Khúc tại cung đang chọn.</p>}
    {loading && <p role="status" className="mt-2 text-sm text-stone-300">{progress}</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    {result && <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-200">
      <p className="text-xs text-amber-200">Cung {result.dau_vao.cung_chu.ten} · {result.dau_vao.cung_chu.thien_can} {result.dau_vao.cung_chu.dia_chi} · {result.dau_vao.gioi_tinh} · Năm sinh {result.dau_vao.can_chi.year.stem} {result.dau_vao.can_chi.year.branch}</p>
      <p>{result.luan_giai.tong_quan}</p>
      {([['mat_thuan','Mặt thuận'],['diem_can_luu_y','Điểm cần lưu ý'],['thong_tin_con_thieu','Thông tin còn thiếu']] as const).map(([key,title]) => result.luan_giai[key].length > 0 && <div key={key}><strong className="text-amber-200">{title}</strong><ul className="mt-1 list-disc pl-5">{result.luan_giai[key].map((text,index) => <li key={index}>{text}</li>)}</ul></div>)}
      <p className="text-xs text-stone-400">Nguồn: {result.sources.map(source => source.title).join(', ') || 'Chưa có nguồn đã duyệt phù hợp'}</p>
      <details><summary className="cursor-pointer text-xs text-amber-200">Xem JSON và dữ liệu gửi model</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(result,null,2)}</pre></details>
    </div>}
    {authenticatedUser && !loading && <button className="mt-3 rounded-lg border border-amber-600/30 px-3 py-1.5 text-xs text-amber-200" onClick={() => setAttempt(value => value + 1)}>Luận lại cung này</button>}
  </section>;
};
