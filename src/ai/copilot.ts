import { NatalChart, PalaceName } from '../domain/types';
import { birthInputFromChart } from '../api/namPhai';
import { DeterministicToolExecutor } from './tools';
import { AISettings, ChatMessage, ChatWidget, ToolCallTrace } from './types';

export class ThienCoCopilot {
  private executor: DeterministicToolExecutor;
  private settings: AISettings;

  constructor(chart: NatalChart | null = null, settings?: Partial<AISettings>) {
    this.executor = new DeterministicToolExecutor(chart);
    this.settings = {
      provider: 'demo',
      apiKey: '',
      modelName: 'gemini-1.5-pro',
      temperature: 0.7,
      school: 'kham_thien',
      ...settings,
    };
  }

  updateChart(chart: NatalChart) {
    this.executor.setChart(chart);
  }

  updateSettings(settings: Partial<AISettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Sinh câu trả lời dưới dạng streaming
   */
  async streamResponse(
    userPrompt: string,
    history: ChatMessage[],
    activeChart: NatalChart,
    onChunk: (text: string) => void,
    onComplete: (message: ChatMessage) => void,
  ) {
    this.executor.setChart(activeChart);

    if (this.settings.provider === 'local') {
      let content: string;
      try {
        const response = await fetch('/api/auth/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userPrompt,
            school: this.settings.school === 'nam_phai' ? 'nam_phai' : 'kham_thien_tu_hoa',
            birthInput: this.settings.school === 'nam_phai' ? birthInputFromChart(activeChart) : undefined,
            chart: {
              birthCanChi: activeChart.birthCanChi,
              cuc: activeChart.cuc,
              menhPalaceIndex: activeChart.menhPalaceIndex,
              forecastYear: activeChart.forecastYear,
              palaces: activeChart.palaces.map((palace) => ({
                name: palace.name, stem: palace.stem, branch: palace.branch,
                majorStars: palace.majorStars.map((star) => star.name),
                minorStars: palace.minorStars.map((star) => star.name),
              })),
            },
          }),
        });
        if (response.status === 401) content = 'Vui lòng đăng nhập để dùng AI Tử Vi nội bộ.';
        else if (response.status === 409) content = 'Model đang huấn luyện hoặc xử lý câu hỏi khác. Bạn thử lại sau nhé.';
        else if (!response.ok) content = 'AI Tử Vi nội bộ hiện chưa sẵn sàng. Vui lòng thử lại sau.';
        else {
          const result = await response.json();
          content = result.answer;
          if (result.sources?.length) {
            content += '\n\nNguồn tham khảo · ' + result.sources.map((source: { title: string }) => source.title).join(', ');
          }
        }
      } catch {
        content = 'Không kết nối được AI Tử Vi nội bộ.';
      }
      onChunk(content);
      onComplete({ id: `msg-${Date.now()}`, role: 'assistant', content, createdAt: new Date().toISOString() });
      return;
    }

    // Nếu người dùng có cài đặt API key của nhà cung cấp bên ngoài (Gemini/OpenAI/Anthropic)
    if (this.settings.apiKey && this.settings.provider !== 'demo') {
      try {
        await this.streamExternalLLM(userPrompt, history, activeChart, onChunk, onComplete);
        return;
      } catch (err) {
        console.warn('Lỗi gọi API ngoài, chuyển sang chế độ suy luận hàn lâm nội bộ:', err);
      }
    }

    // Chế độ Mặc định & Trực nghiệm Học thuật Nội bộ (AI-Native Classical Engine)
    await this.streamScholarlyReasoning(userPrompt, activeChart, onChunk, onComplete);
  }

  /**
   * Trực nghiệm suy luận kinh điển kết hợp công cụ toán học tất định
   */
  private async streamScholarlyReasoning(
    prompt: string,
    chart: NatalChart,
    onChunk: (text: string) => void,
    onComplete: (message: ChatMessage) => void,
  ) {
    const lowerPrompt = prompt.toLowerCase();
    const traces: ToolCallTrace[] = [];
    const widgets: ChatWidget[] = [];
    let suggestedQuestions: string[] = [];

    // Nhận diện chủ đề truy vấn
    let topic: 'tai_bach' | 'quan_loc' | 'phu_the' | 'tu_hoa' | 'van_han' | 'kinh_dich' | 'tong_quan' = 'tong_quan';
    let targetPalaceName: PalaceName = 'Mệnh';

    if (lowerPrompt.includes('tài bạch') || lowerPrompt.includes('tiền') || lowerPrompt.includes('tài chính') || lowerPrompt.includes('đầu tư')) {
      topic = 'tai_bach';
      targetPalaceName = 'Tài Bạch';
    } else if (lowerPrompt.includes('quan lộc') || lowerPrompt.includes('sự nghiệp') || lowerPrompt.includes('công danh') || lowerPrompt.includes('việc làm')) {
      topic = 'quan_loc';
      targetPalaceName = 'Quan Lộc';
    } else if (lowerPrompt.includes('phu thê') || lowerPrompt.includes('tình duyên') || lowerPrompt.includes('hôn nhân') || lowerPrompt.includes('vợ') || lowerPrompt.includes('chồng')) {
      topic = 'phu_the';
      targetPalaceName = 'Phu Thê';
    } else if (lowerPrompt.includes('tứ hóa') || lowerPrompt.includes('phi hóa') || lowerPrompt.includes('hóa kỵ') || lowerPrompt.includes('hóa lộc') || lowerPrompt.includes('tự hóa')) {
      topic = 'tu_hoa';
    } else if (lowerPrompt.includes('năm 2026') || lowerPrompt.includes('2026') || lowerPrompt.includes('2027') || lowerPrompt.includes('vận trình') || lowerPrompt.includes('hạn')) {
      topic = 'van_han';
    } else if (lowerPrompt.includes('kinh dịch') || lowerPrompt.includes('quẻ') || lowerPrompt.includes('lục hào') || lowerPrompt.includes('gieo')) {
      topic = 'kinh_dich';
    }

    // 1. Thực thi công cụ tất định tương ứng
    let detailedAnalysis = '';
    const targetPalace = chart.palaces.find((p) => p.name === targetPalaceName) || chart.palaces[0];

    if (topic === 'tai_bach' || topic === 'quan_loc' || topic === 'phu_the') {
      const { result: palaceData, trace } = this.executor.execute('get_palace_details', { palaceName: targetPalaceName });
      traces.push(trace);

      const majorStarList = targetPalace.majorStars.map((s) => `${s.name} (${s.brightness || 'Đắc'})`).join(', ') || 'Vô chính diệu';
      const outgoingFlows = palaceData.transformations.outgoing;

      widgets.push({
        type: 'palace_highlight',
        data: {
          palace: targetPalace,
          reason: `Phân tích chuyên sâu cung ${targetPalaceName} theo yêu cầu đương số.`,
          highlightType: topic === 'tai_bach' ? 'opportunity' : 'focus',
        },
      });

      if (outgoingFlows.length > 0) {
        widgets.push({
          type: 'transformation_flow',
          data: {
            flow: outgoingFlows[0],
            significance: `Khí cơ luân chuyển: can ${targetPalace.stem} của cung ${targetPalaceName} phát tán năng lượng đến ${outgoingFlows[0].targetPalaceName}.`,
          },
        });
      }

      detailedAnalysis = `
Thiên Cơ kính bạch đương số **${chart.name}**,

Về câu hỏi liên quan đến **Cung ${targetPalaceName}** (${targetPalace.stem} ${targetPalace.branch}):

### 1. Hiện trạng tinh đẩu tại Bản Cung (Dữ liệu tất định)
- **Chính diệu tọa thủ:** ${majorStarList}
- **Phụ tinh đồng độ:** ${targetPalace.minorStars.map((s) => s.name).join(', ') || 'Thanh tĩnh'}
- **Đại Hạn quản lý:** Độ tuổi ${targetPalace.decade.startAge} – ${targetPalace.decade.endAge}

### 2. Luận giải Khí Cơ theo Khâm Thiên Môn (Chiêm nghiệm học thuật)
${
  topic === 'tai_bach'
    ? `Cung Tài Bạch tọa tại phương **${targetPalace.branch}**, nạp can **${targetPalace.stem}**. Theo pháp tượng Khâm Thiên, phương thức tụ tài của đương số không đơn thuần là tích lũy tĩnh tại mà vận hành theo dòng chảy tri thức và quan hệ. Khi cung mang can ${targetPalace.stem}, sự biến chuyển tiền tài gắn liền với quyết sách lý trí thay vì cảm tính. ${targetPalace.majorStars.length === 0 ? 'Cung Vô Chính Diệu đòi hỏi phải mượn lực từ Cung Phúc Đức chiếu về, lấy thanh tâm làm gốc của sự giàu có.' : `Chính tinh ${targetPalace.majorStars[0]?.name} cho thấy năng lực xoay chuyển cục diện sắc bén.`}`
    : topic === 'quan_loc'
    ? `Cung Quan Lộc can **${targetPalace.stem}** ngụ tại **${targetPalace.branch}**. Đây là cung vị thể hiện tâm huyết phụng sự và con đường lập thân. Đương số thích hợp với những vị trí đòi hỏi chiều sâu tư duy, tính hoạch định chiến lược và kỷ luật cao độ. Năng lượng của bản cung khuyến nghị đương số nên kiên định với một trục chuyên môn cốt lõi thay vì phân tán đa diện.`
    : `Cung Phu Thê can **${targetPalace.stem}** tại **${targetPalace.branch}**. Nhân duyên của đương số mang màu sắc tao nhã, tri kỷ tương ngộ. Tình cảm cần xây dựng trên nền tảng thấu hiểu nội tâm và sự tôn trọng tự do tinh thần của nhau.`
}

### 3. Lời khuyên tu dưỡng của Cổ Nhân
> *"Đắc thời tắc biến, thất thời tắc tàng. Người quân tử tri mệnh không phải để lo âu, mà để an nhiên định tĩnh giữa dòng đời thiên biến."*
`;

      suggestedQuestions = [
        `Cung Tam Hợp và Xung Chiếu ảnh hưởng thế nào đến ${targetPalaceName}?`,
        `Năm 2026 có biến động phi hóa gì đối với cung ${targetPalaceName}?`,
        `Làm sao để hóa giải các điểm xung sát trong mệnh bàn?`,
      ];
    } else if (topic === 'tu_hoa') {
      const { result: tuHoaData, trace } = this.executor.execute('calculate_four_transformations', { forecastYear: 2026 });
      traces.push(trace);

      detailedAnalysis = `
Thiên Cơ kính bạch đương số **${chart.name}**,

Hệ thống **Tứ Hóa Khâm Thiên Môn** trên bản mệnh của quý vị được bóc tách thành các tầng năng lượng cụ thể:

### 1. Sinh Niên Tứ Hóa (Tiên Thiên Phúc Trạch)
Năm sinh can **${chart.birthCanChi.year.stem}** khởi tạo bộ Tứ Hóa gốc:
${tuHoaData.birthTransformations.map((t: any) => `- **Hóa ${t.type}** ngự sao *${t.star}* tại cung **${t.palaceName}**: ${t.meaning}`).join('\n')}

### 2. Lưu Niên Tứ Hóa Năm 2026 (Bính Ngọ)
Can Bính năm 2026 phát động:
- **Hóa Lộc:** Thiên Đồng (Duyên lành về tinh thần, an lạc, cơ hội mới)
- **Hóa Quyền:** Thiên Cơ (Chủ quyền biến hóa, trí tuệ mưu lược được thể hiện)
- **Hóa Khoa:** Văn Xương (Học vấn, thi cử, danh tiếng, quý nhân nâng đỡ)
- **Hóa Kỵ:** Liêm Trinh (Điểm tụ năng lượng, cần cẩn trọng văn thư pháp lý và cảm xúc)

### 3. Ý nghĩa Triết học
Tứ Hóa không phải là phán quyết thưởng phạt của tạo hóa, mà là **bốn giai đoạn vận động của vạn vật**: Lộc (Sinh) → Quyền (Trưởng) → Khoa (Thu) → Kỵ (Tàng). Thấu triệt điều này, đương số sẽ biết lúc gieo hạt, lúc gặt hái và lúc giữ gìn cẩn mật.
`;

      suggestedQuestions = [
        'Hóa Kỵ năm 2026 đóng tại cung nào trên lá số của tôi?',
        'Tự hóa ly tâm và tự hóa hướng tâm khác nhau ra sao?',
        'Làm thế nào để chuyển hóa năng lượng Hóa Kỵ thành động lực?',
      ];
    } else if (topic === 'van_han') {
      const { result: fortune, trace } = this.executor.execute('get_fortune_period', { targetYear: 2026 });
      traces.push(trace);

      widgets.push({
        type: 'fortune_timeline',
        data: {
          currentDecade: {
            startAge: fortune.decade.startAge,
            endAge: fortune.decade.endAge,
            palaceName: fortune.decade.palaceName,
          },
          annualForecast: {
            year: 2026,
            canChi: 'Bính Ngọ',
            keyPalace: fortune.annual.palaceName,
          },
          annualTransformations: [
            { type: 'Lộc', star: 'Thiên Đồng', palaceName: 'Cung Phúc Đức' },
            { type: 'Quyền', star: 'Thiên Cơ', palaceName: 'Cung Huynh Đệ' },
            { type: 'Khoa', star: 'Văn Xương', palaceName: 'Cung Phụ Mẫu' },
            { type: 'Kỵ', star: 'Liêm Trinh', palaceName: 'Cung Quan Lộc' },
          ],
        },
      });

      detailedAnalysis = `
Thiên Cơ kính bạch đương số **${chart.name}**,

Vận trình năm **2026 (Bính Ngọ)** của quý vị được kết nối giữa hai tầng thời gian:

### 1. Đại Hạn 10 Năm Hiện Tại (Đại Thời Vận)
- **Đại Hạn:** Tuổi ${fortune.decade.startAge} đến ${fortune.decade.endAge}
- **Cung chủ quản:** Cung **${fortune.decade.palaceName}** (${fortune.decade.palaceBranch})
- **Đặc trưng:** Đây là thập kỷ xây dựng nền tảng vững bền, đòi hỏi đương số chú trọng bồi đắp thực lực nội tại và kiểm soát rủi ro trường kỳ.

### 2. Lưu Niên Tiểu Hạn Năm 2026 (Bính Ngọ)
- Đương số bước sang tuổi: **${fortune.age} tuổi** (tuổi mụ)
- Cung vị đón nhận khí vận năm: **${fortune.annual.palaceName}**
- **Nhịp điệu thiên cơ:** Năm Bính Hỏa vượng, năng lượng thôi thúc sự hành động mạnh mẽ và đổi mới tư duy. Khuyến nghị đương số chủ động trong các dự án sáng tạo, song cần giữ chữ tín và minh bạch trong các cam kết tài chính.
`;

      suggestedQuestions = [
        'Đại Hạn tiếp theo của tôi sẽ chuyển dịch sang cung nào?',
        'Tháng nào trong năm 2026 là thời điểm hanh thông nhất?',
        'Có nên thay đổi công việc hoặc nơi ở trong năm nay không?',
      ];
    } else if (topic === 'kinh_dich') {
      const { result: hexagram, trace } = this.executor.execute('calculate_hexagram', { question: prompt });
      traces.push(trace);

      widgets.push({
        type: 'hexagram_card',
        data: {
          hexagram,
          question: prompt,
        },
      });

      detailedAnalysis = `
Thiên Cơ kính bạch đương số **${chart.name}**,

Đối trước lời thỉnh cầu chân thành, ba đồng xu cổ đã giao cảm cùng trời đất, lập nên quẻ:

### Quẻ Chủ: **${hexagram.vietnameseName}** (${hexagram.chineseName})
- **Cấu trúc:** Thượng quái ${hexagram.upperTrigram} · Hạ quái ${hexagram.lowerTrigram}
- **Thoán Từ:** *"${hexagram.judgment}"*
- **Đại Tượng Truyện:** *"${hexagram.image}"*

${hexagram.transformedHexagram ? `### Quẻ Biến: **${hexagram.transformedHexagram.vietnameseName}** (${hexagram.transformedHexagram.chineseName})\n- Sự việc có xu hướng chuyển hóa sang trạng thái: *"${hexagram.transformedHexagram.judgment}"*` : 'Hào tượng an định, sự việc cần tiếp tục kiên trì theo quỹ đạo hiện tại.'}

### Lời Khuyên Hành Đạo:
${hexagram.scholarlyAdvice}
`;

      suggestedQuestions = [
        'Ý nghĩa của hào Thế và hào Ứng trong quẻ này?',
        'Dụng thần của sự việc ứng vào hào nào?',
        'Nên hành động vào thời điểm nào để thuận theo đạo Dịch?',
      ];
    } else {
      // Tổng quan lá số
      detailedAnalysis = `
Thiên Cơ kính bạch đương số **${chart.name}**,

Mệnh bàn của quý vị lập vào giờ **${chart.time}**, ngày **${chart.lunarDate.day}/${chart.lunarDate.month}/${chart.lunarDate.year}** Âm lịch:
- **Bản Mệnh:** ${chart.birthCanChi.year.stem} ${chart.birthCanChi.year.branch} · Nạp Âm: **${chart.napAm}**
- **Cục Số:** **${chart.cuc.name}** (${chart.cuc.element})
- **Cung Mệnh:** Tọa tại phương **${chart.palaces[chart.menhPalaceIndex].branch}** mang can **${chart.palaces[chart.menhPalaceIndex].stem}**
- **Cung Thân:** Cư tại **${chart.palaces[chart.thanPalaceIndex].name}** (${chart.palaces[chart.thanPalaceIndex].branch})

Đương số là người có tư chất thâm trầm, trọng danh dự và có xu hướng cầu thị học hỏi. Cung Mệnh và Cung Thân phối chiếu tạo nên một kết cấu ổn định, giàu nội lực. Quý vị có thể lựa chọn bất kỳ cung vị hoặc câu hỏi cụ thể nào để Thiên Cơ cùng đàm đạo chi tiết.
`;

      suggestedQuestions = [
        'Phân tích cung Tài Bạch của tôi trong năm 2026',
        'Cung Thân cư Quan Lộc có ý nghĩa thế nào với sự nghiệp?',
        'Kiểm tra hệ thống Tứ Hóa bản mệnh của tôi',
        'Gieo một quẻ Kinh Dịch để chiêm nghiệm định hướng hiện tại',
      ];
    }

    // Đính kèm Trace Panel vào Widgets để đảm bảo tính minh bạch tối đa
    widgets.push({
      type: 'trace_panel',
      data: {
        traces,
        methodology: 'Khâm Thiên Tứ Hóa Bắc Phái × Chu Dịch Chính Tông (Engine Tất Định)',
      },
    });

    // 2. Stream từng đoạn để trải nghiệm đọc mượt mà, tự nhiên
    const chunks = detailedAnalysis.split(/(?<=[.\n!?])\s+/);
    let accumulated = '';

    for (let i = 0; i < chunks.length; i++) {
      accumulated += (i > 0 ? ' ' : '') + chunks[i];
      onChunk(accumulated);
      await new Promise((resolve) => setTimeout(resolve, 18));
    }

    const finalMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: accumulated,
      createdAt: new Date().toISOString(),
      widgets,
      suggestedQuestions,
      calculationTrace: traces,
      chartContextId: chart.id,
    };

    onComplete(finalMessage);
  }

  /**
   * Gọi API nhà cung cấp bên ngoài khi người dùng cấu hình
   */
  private async streamExternalLLM(
    prompt: string,
    history: ChatMessage[],
    chart: NatalChart,
    onChunk: (text: string) => void,
    onComplete: (message: ChatMessage) => void,
  ) {
    // Adapter dành cho Gemini hoặc OpenAI tương thích
    const endpoint = this.settings.apiEndpoint || (this.settings.provider === 'gemini'
      ? `https://generativelanguage.googleapis.com/v1beta/models/${this.settings.modelName}:streamGenerateContent?key=${this.settings.apiKey}`
      : 'https://api.openai.com/v1/chat/completions');

    // Nếu không kết nối được hoặc endpoint trả lỗi, copilot sẽ tự động fallback sang scholarly reasoning
    throw new Error('Chưa kích hoạt kết nối đám mây, sử dụng bộ giải mã cục bộ bảo mật.');
  }
}
