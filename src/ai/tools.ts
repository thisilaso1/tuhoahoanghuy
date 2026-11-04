import { BirthInput, NatalChart, Palace, PalaceName } from '../domain/types';
import { generateNatalChart } from '../domain/tuViEngine';
import {
  calculateAllFlyingTransformations,
  getAnnualTransformations,
  getBirthYearTransformations,
  getPalaceTransformationProfile,
  TuHoaSchool,
} from '../domain/tuHoaEngine';
import { generateHexagramFromTosses, tossCoins } from '../domain/kinhDichEngine';
import { CLASSICAL_ARTICLES, LEXICON_TERMS } from '../domain/knowledgeBase';
import { ToolCallTrace } from './types';

// Danh mục định nghĩa công cụ để gửi cho LLM hoặc điều phối nội bộ
export const ASTROLOGY_TOOL_DEFINITIONS = [
  {
    name: 'calculate_natal_chart',
    description: 'Tính toán mệnh bàn Tử Vi Đẩu Số hoàn chỉnh (12 cung, 14 chính tinh, phụ tinh, cục số, đại hạn) dựa trên ngày giờ sinh.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Họ và tên đương số' },
        date: { type: 'string', description: 'Ngày sinh định dạng YYYY-MM-DD' },
        time: { type: 'string', description: 'Giờ sinh định dạng HH:mm' },
        gender: { type: 'string', enum: ['Nam', 'Nữ'] },
        calendar: { type: 'string', enum: ['solar', 'lunar'] },
        forecastYear: { type: 'number', description: 'Năm cần xem vận hạn' },
      },
      required: ['name', 'date', 'time', 'gender'],
    },
  },
  {
    name: 'calculate_four_transformations',
    description: 'Tính toán hệ thống Tứ Hóa Khâm Thiên (Sinh Niên, Lưu Niên, Phi Hóa và Tự Hóa Ly/Hướng Tâm).',
    parameters: {
      type: 'object',
      properties: {
        forecastYear: { type: 'number', description: 'Năm cần xem lưu niên tứ hóa' },
        school: { type: 'string', enum: ['kham_thien', 'nam_phai'] },
      },
    },
  },
  {
    name: 'get_palace_details',
    description: 'Truy xuất chi tiết một cung vị (sao tọa thủ, tam phương tứ chính, phi hóa đi và đến).',
    parameters: {
      type: 'object',
      properties: {
        palaceName: {
          type: 'string',
          enum: [
            'Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc',
            'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'
          ],
        },
      },
      required: ['palaceName'],
    },
  },
  {
    name: 'get_fortune_period',
    description: 'Tính toán vận trình đại hạn 10 năm và lưu niên của năm bất kỳ cho đương số.',
    parameters: {
      type: 'object',
      properties: {
        targetYear: { type: 'number', description: 'Năm xem' },
      },
      required: ['targetYear'],
    },
  },
  {
    name: 'calculate_hexagram',
    description: 'Gieo hoặc lập quẻ Kinh Dịch lục hào, xác định quẻ chủ, quẻ biến, hào động, thế ứng và lời khuyên cổ nhân.',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Chủ đề người hỏi muốn chiêm bái' },
        lineValues: { type: 'array', items: { type: 'number' }, description: '6 giá trị hào (6, 7, 8, 9)' },
      },
      required: ['question'],
    },
  },
  {
    name: 'retrieve_knowledge_references',
    description: 'Tra cứu các trước tác cổ học và thuật ngữ kinh điển (Toàn Thư, Khâm Thiên Môn, Chu Dịch).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Thuật ngữ hoặc chủ đề cần tra cứu' },
      },
      required: ['query'],
    },
  },
];

// Trình thực thi công cụ tất định (Deterministic Engine Executor)
export class DeterministicToolExecutor {
  chart: NatalChart | null;

  constructor(chart: NatalChart | null = null) {
    this.chart = chart;
  }

  setChart(chart: NatalChart) {
    this.chart = chart;
  }

  execute(toolName: string, args: Record<string, any>): { result: any; trace: ToolCallTrace } {
    const startTime = performance.now();
    let result: any = null;

    switch (toolName) {
      case 'calculate_natal_chart': {
        const input: BirthInput = {
          name: args.name || 'Vô Danh Cư Sĩ',
          date: args.date || '1992-08-18',
          time: args.time || '09:30',
          gender: args.gender || 'Nam',
          calendar: args.calendar || 'solar',
          forecastYear: args.forecastYear || 2026,
        };
        result = generateNatalChart(input);
        this.chart = result;
        break;
      }

      case 'calculate_four_transformations': {
        if (!this.chart) throw new Error('Cần có mệnh bàn hợp lệ trước khi tính Tứ Hóa.');
        const school: TuHoaSchool = args.school || 'kham_thien';
        const year = args.forecastYear || this.chart.forecastYear || 2026;
        const birthTransformations = getBirthYearTransformations(this.chart, school);
        const annualTransformations = getAnnualTransformations(this.chart, year, school);
        const flying = calculateAllFlyingTransformations(this.chart, school);

        result = {
          school,
          forecastYear: year,
          birthTransformations,
          annualTransformations,
          flyingTotalCount: flying.length,
          flyingSample: flying.slice(0, 10),
        };
        break;
      }

      case 'get_palace_details': {
        if (!this.chart) throw new Error('Cần có mệnh bàn hợp lệ.');
        const palaceName = args.palaceName as PalaceName;
        const palace = this.chart.palaces.find((p) => p.name === palaceName);
        if (!palace) throw new Error(`Không tìm thấy cung ${palaceName}`);

        // Tam Phương Tứ Chính:
        // Đối cung: cách 6
        const opposite = this.chart.palaces[(palace.index + 6) % 12];
        // Tam hợp: cách 4 và 8
        const tamHop1 = this.chart.palaces[(palace.index + 4) % 12];
        const tamHop2 = this.chart.palaces[(palace.index + 8) % 12];

        const transformations = getPalaceTransformationProfile(this.chart, palace.index);

        result = {
          palace,
          tamPhuongTuChinh: {
            opposite: { name: opposite.name, branch: opposite.branch, stars: opposite.majorStars },
            tamHop1: { name: tamHop1.name, branch: tamHop1.branch, stars: tamHop1.majorStars },
            tamHop2: { name: tamHop2.name, branch: tamHop2.branch, stars: tamHop2.majorStars },
          },
          transformations,
        };
        break;
      }

      case 'get_fortune_period': {
        if (!this.chart) throw new Error('Cần có mệnh bàn hợp lệ.');
        const targetYear = args.targetYear || 2026;
        const birthYear = this.chart.lunarDate.year;
        const age = targetYear - birthYear + 1;

        // Tìm Đại Hạn tương ứng với tuổi này
        const decadePalace = this.chart.palaces.find(
          (p) => age >= p.decade.startAge && age <= p.decade.endAge
        );

        // Tìm Lưu Niên Tiểu Hạn
        const annualPalace = this.chart.palaces.find((p) => p.annualAge === ((age % 12) || 12));

        result = {
          targetYear,
          age,
          decade: {
            palaceName: decadePalace?.name || 'Mệnh',
            palaceBranch: decadePalace?.branch || 'Dần',
            startAge: decadePalace?.decade.startAge,
            endAge: decadePalace?.decade.endAge,
            stars: decadePalace?.majorStars || [],
          },
          annual: {
            palaceName: annualPalace?.name || 'Tài Bạch',
            palaceBranch: annualPalace?.branch || 'Thìn',
            stars: annualPalace?.majorStars || [],
          },
        };
        break;
      }

      case 'calculate_hexagram': {
        let lines: number[] = args.lineValues;
        if (!lines || lines.length !== 6) {
          lines = Array.from({ length: 6 }, () => tossCoins().sum);
        }
        result = generateHexagramFromTosses(lines, this.chart?.birthCanChi.day.stem || 'Giáp');
        break;
      }

      case 'retrieve_knowledge_references': {
        const query = (args.query || '').toLowerCase();
        const articles = CLASSICAL_ARTICLES.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.content.toLowerCase().includes(query) ||
            a.keyConcepts.some((k) => k.toLowerCase().includes(query))
        );
        const terms = LEXICON_TERMS.filter(
          (t) =>
            t.term.toLowerCase().includes(query) ||
            t.definition.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query)
        );

        result = {
          query,
          articles: articles.slice(0, 3),
          terms: terms.slice(0, 5),
        };
        break;
      }

      default:
        throw new Error(`Công cụ chưa được định nghĩa: ${toolName}`);
    }

    const duration = Math.round(performance.now() - startTime);
    const trace: ToolCallTrace = {
      toolName,
      args,
      resultSummary: `Thực thi thành công trong ${duration}ms`,
      executionTimeMs: duration,
      timestamp: new Date().toISOString(),
    };

    return { result, trace };
  }
}
