
import React, { useEffect, useMemo, useState } from 'react';
import type { NatalChart } from '../../domain/types';
import { useApp } from '../../context/AppContext';
import {
  palaceReadingPayload,
  type PalaceReading,
} from '../../api/namPhai';
import {
  combineStarReadings,
  isStarListOnly,
  type ReadingSource,
} from './combinePalaceReading';

type Result = {
  id?: string;
  status?: string;
  targetStarName?: string;
  mode?: string;
  dau_vao: {
    gioi_tinh: string;
    can_chi: NatalChart['birthCanChi'];
    cung_chu: {
      ten: string;
      dia_chi: string;
      thien_can: string;
      chinh_tinh?: { ten: string }[];
    };
  };
  luan_giai: PalaceReading['luan_giai'];
  sources: ReadingSource[];
};

type StarData = {
  name?: string;
  ten?: string;
  star?: string;
};

type PalaceData = {
  majorStars?: (string | StarData)[];
  mainStars?: (string | StarData)[];
  chinhTinh?: (string | StarData)[];
  chinh_tinh?: (string | StarData)[];
};

function normalizeStars(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const names = value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (item && typeof item === 'object') {
        const star = item as StarData;
        return String(
          star.name ?? star.ten ?? star.star ?? ''
        ).trim();
      }

      return '';
    })
    .filter(Boolean);

  return [...new Set(names)];
}

// Đọc chính tinh thực tế tại cung đang chọn.
function getPalaceMainStars(
  chart: NatalChart,
  palaceIndex: number,
  requestBody: Record<string, unknown>
): string[] {
  const chartData = chart as unknown as {
    palaces?: PalaceData[];
  };

  const palace = chartData.palaces?.[palaceIndex];

  const chartStars =
    palace?.majorStars ??
    palace?.mainStars ??
    palace?.chinhTinh ??
    palace?.chinh_tinh;

  if (Array.isArray(chartStars)) {
    return normalizeStars(chartStars);
  }

  // Fallback theo dữ liệu mà API helper tạo.
  const cungVi = requestBody.cung_vi as
    | Record<string, unknown>
    | undefined;

  const payloadStars =
    cungVi?.chinh_tinh ??
    cungVi?.mainStars ??
    cungVi?.majorStars ??
    requestBody.chinh_tinh;

  return normalizeStars(payloadStars);
}

export const VuKhucReading: React.FC<{
  chart: NatalChart;
  palaceIndex: number;
}> = ({ chart, palaceIndex }) => {
  const { authenticatedUser } = useApp();

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState('');

  // Dữ liệu phụ thuộc cung hiện tại.
  const { payload, displayStarName } = useMemo(() => {
    const original = palaceReadingPayload(
      chart,
      palaceIndex,
      attempt > 0
    ) as unknown as Record<string, unknown>;

    const stars = getPalaceMainStars(
      chart,
      palaceIndex,
      original
    );

    const starName = stars.length > 0
      ? stars.join(', ')
      : 'Vô Chính Diệu';

    const originalCungVi =
      original.cung_vi &&
      typeof original.cung_vi === 'object'
        ? original.cung_vi as Record<string, unknown>
        : {};

    // Không sử dụng mặc định Vũ Khúc.
    // Luôn gửi chính tinh của cung đang chọn.
    const normalizedPayload = {
      ...original,
      star: stars,
      mainStar: undefined,
      chinhTinh: undefined,
      chinh_tinh: undefined,
      cung_vi: {
        ...originalCungVi,
        chinh_tinh: stars,
        mainStar: undefined,
      },
    };

    return {
      payload: JSON.stringify(normalizedPayload),
      displayStarName: starName,
    };
  }, [chart, palaceIndex, attempt]);

  useEffect(() => {
    setResult(null);
    setError('');
    setLoading(false);

    if (!authenticatedUser) return;

    const controller = new AbortController();

    setLoading(true);
    setProgress(
      'Đang gửi thông tin cung vị, chính tinh, phụ tinh, Can Chi và giới tính…'
    );

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/ai/palace', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        let data = await response.json();

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Vui lòng đăng nhập để luận cung.'
              : data.error === 'ai_busy'
                ? 'Model đang bận. Bạn bấm thử lại sau nhé.'
                : data.message ??
                  'Model chưa trả được lời luận hợp lệ. Bạn có thể thử lại.'
          );
        }

        // Giữ nguyên polling và cache phía backend.
        while (
          !controller.signal.aborted &&
          ['queued', 'running'].includes(data.status)
        ) {
          setProgress(
            data.status === 'running'
              ? `Model đang luận ${displayStarName} tại cung này…`
              : 'Đã nhận thông tin cung. Đang chờ lượt GPU; hệ thống sẽ tự chạy tiếp.'
          );

          await new Promise<void>((resolve) =>
            setTimeout(resolve, 2500)
          );

          if (controller.signal.aborted) return;

          const poll = await fetch(
            '/api/auth/ai/palace/' + data.id,
            { signal: controller.signal }
          );

          if (!poll.ok) {
            throw new Error(
              'Không đọc được tiến độ luận cung. Vui lòng thử lại.'
            );
          }

          data = await poll.json();
        }

        if (
          data.status === 'failed' ||
          data.status === 'cancelled'
        ) {
          throw new Error(
            'Model chưa trả được lời luận hợp lệ. Bạn có thể bấm luận lại.'
          );
        }

        if (
          data.status !== 'completed' ||
          !data.luan_giai
        ) {
          throw new Error(
            'Model chưa trả về dữ liệu luận giải hợp lệ.'
          );
        }

        if (!controller.signal.aborted) {
          setResult(data as Result);
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Không kết nối được model.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [payload, authenticatedUser?.id, displayStarName]);

  const currentStarName =
    result?.targetStarName || displayStarName;

  // Cung có từ 2 chính tinh: gom lời luận nguồn của từng sao thành một câu trả lời.
  const reading = useMemo(() => {
    if (!result) return null;
    const stars = (result.dau_vao.cung_chu.chinh_tinh ?? [])
      .map((star) => star.ten)
      .filter(Boolean);
    // mode 'case': the trained model already answered for the star pair + palace + branch.
    const combined = result.mode === 'case' ? null : combineStarReadings(stars, result.sources);
    const overview = result.luan_giai.tong_quan ?? '';
    const cung = result.dau_vao.cung_chu;
    return {
      main: combined
        ? `Cung ${cung.ten} (${cung.dia_chi}) có ${stars.join(' và ')} đồng cung. ${combined}`
        : overview,
      extra: combined && overview && !isStarListOnly(overview, stars) ? overview : '',
      hide: new Set(stars),
    };
  }, [result]);

  return (
    <section
      className="mt-4 rounded-xl border border-amber-600/30 bg-slate-950/70 p-4"
      aria-label={`Luận ${currentStarName} theo cung`}
    >
      <h4 className="font-serif text-base text-amber-200">
        {currentStarName} · Luận cung Nam Phái
      </h4>

      {!authenticatedUser && (
        <p className="mt-2 text-sm text-stone-300">
          Đăng nhập để model luận {currentStarName} tại cung đang chọn.
        </p>
      )}

      {loading && (
        <p
          role="status"
          className="mt-2 text-sm text-stone-300"
        >
          {progress}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-200">
          <p className="text-xs text-amber-200">
            Cung {result.dau_vao.cung_chu.ten}
            {' · '}
            {result.dau_vao.cung_chu.thien_can}
            {' '}
            {result.dau_vao.cung_chu.dia_chi}
            {' · '}
            {result.dau_vao.gioi_tinh}
            {' · Năm sinh '}
            {result.dau_vao.can_chi.year.stem}
            {' '}
            {result.dau_vao.can_chi.year.branch}
          </p>

          <p>{reading?.main}</p>
          {reading?.extra && <p>{reading.extra}</p>}

          {([
            ['mat_thuan', 'Mặt thuận'],
            ['diem_can_luu_y', 'Điểm cần lưu ý'],
            ['thong_tin_con_thieu', 'Thông tin còn thiếu'],
          ] as const).map(([key, title]) => {
            const items = (result.luan_giai[key] ?? []).filter(
              (text) => !reading?.hide.has(text.trim())
            );

            return items.length > 0 ? (
              <div key={key}>
                <strong className="text-amber-200">
                  {title}
                </strong>

                <ul className="mt-1 list-disc pl-5">
                  {items.map((text, index) => (
                    <li key={index}>{text}</li>
                  ))}
                </ul>
              </div>
            ) : null;
          })}

          <p className="text-xs text-stone-400">
            Nguồn:{' '}
            {result.sources?.map(
              (source) => source.title
            ).join(', ') ||
              'Chưa có nguồn đã duyệt phù hợp'}
          </p>

          <details>
            <summary className="cursor-pointer text-xs text-amber-200">
              Xem JSON và dữ liệu gửi model
            </summary>

            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {authenticatedUser && !loading && (
        <button
          className="mt-3 rounded-lg border border-amber-600/30 px-3 py-1.5 text-xs text-amber-200"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Luận lại cung này
        </button>
      )}
    </section>
  );
};
