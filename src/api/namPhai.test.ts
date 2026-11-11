import { afterEach, describe, expect, it, vi } from 'vitest';
import { birthInputFromChart, generateServerNamPhaiChart, readingRequest } from './namPhai';
import { generateNatalChart } from '../domain/tuViEngine';
const input = { name: 'Test', date: '2000-09-25', time: '10:20', gender: 'Nam' as const, calendar: 'solar' as const, forecastYear: 2026 };
afterEach(() => vi.unstubAllGlobals());
describe('Nam Phai backend contract', () => {
  it('sends birth data instead of trusting client star positions', () => {
    const chart = generateNatalChart(input);
    chart.palaces[0].majorStars = [{ name: 'Sao giả', category: 'major' }];
    expect(birthInputFromChart(chart)).toEqual(input);
    expect(birthInputFromChart(chart)).not.toHaveProperty('palaces');
  });
  it('uses the server chart and propagates validation errors', async () => {
    const chart = generateNatalChart(input);
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ chart }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Ngày sinh không hợp lệ' }) });
    vi.stubGlobal('fetch', fetchMock);
    expect(await generateServerNamPhaiChart(input)).toEqual(chart);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/charts/nam-phai');
    expect(JSON.parse(options.body)).toEqual({ school: 'nam_phai', birthInput: input });
    await expect(generateServerNamPhaiChart(input)).rejects.toThrow('Ngày sinh không hợp lệ');
  });
  it('requires login for private reading jobs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'unauthenticated' }) }));
    await expect(readingRequest('', { school: 'nam_phai', birthInput: input })).rejects.toThrow('đăng nhập');
  });
});
