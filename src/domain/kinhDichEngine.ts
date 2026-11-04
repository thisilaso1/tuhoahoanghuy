import { Hexagram, HexagramLine, Stem } from './types';

// Bát Quái Tiên Thiên / Hậu Thiên
export const TRIGRAMS: Record<string, { symbol: string; binary: string; element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'; nature: string }> = {
  'Càn': { symbol: '☰', binary: '111', element: 'Kim', nature: 'Trời (Thiên), cương kiện' },
  'Đoài': { symbol: '☱', binary: '011', element: 'Kim', nature: 'Đầm (Trạch), vui vẻ, hòa nhã' },
  'Ly': { symbol: '☲', binary: '101', element: 'Hỏa', nature: 'Lửa (Hỏa), sáng suốt, văn minh' },
  'Chấn': { symbol: '☳', binary: '001', element: 'Mộc', nature: 'Sấm (Lôi), chấn động, khởi phát' },
  'Tốn': { symbol: '☴', binary: '110', element: 'Mộc', nature: 'Gió (Phong), thuận nhập, ôn hòa' },
  'Khảm': { symbol: '☵', binary: '010', element: 'Thủy', nature: 'Nước (Thủy), hiểm trở, thâm trầm' },
  'Cấn': { symbol: '☶', binary: '100', element: 'Thổ', nature: 'Núi (Sơn), ngưng nghỉ, tĩnh lặng' },
  'Khôn': { symbol: '☷', binary: '000', element: 'Thổ', nature: 'Đất (Địa), nhu thuận, bao dung' },
};

export interface HexagramData {
  id: number;
  vietnameseName: string;
  chineseName: string;
  pinyin: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  scholarlyAdvice: string;
}

// 64 Quẻ Kinh Dịch tiêu biểu & chuẩn mực
export const HEXAGRAMS_CATALOG: HexagramData[] = [
  {
    id: 1,
    vietnameseName: 'Thuần Càn',
    chineseName: '乾為天',
    pinyin: 'Qián',
    upperTrigram: 'Càn',
    lowerTrigram: 'Càn',
    judgment: 'Nguyên hanh lợi trinh. Cương kiện bất tức, đức lớn sáng soi khắp bốn phương.',
    image: 'Thiên hành kiện, quân tử dĩ tự cường bất tức. Trời vận hành mạnh mẽ, người quân tử noi theo mà tự cường không ngừng nghỉ.',
    scholarlyAdvice: 'Thời vận hanh thông rực rỡ, nhưng cần giữ đức trung chính, tránh kiêu căng thái quá mà gặp họa Kháng Long Hữu Hối.',
  },
  {
    id: 2,
    vietnameseName: 'Thuần Khôn',
    chineseName: '坤為地',
    pinyin: 'Kūn',
    upperTrigram: 'Khôn',
    lowerTrigram: 'Khôn',
    judgment: 'Nguyên hanh, lợi tẫn mã chi trinh. Nhu thuận bao la, chở che vạn vật.',
    image: 'Địa thế khôn, quân tử dĩ hậu đức tải vật. Đất rộng chở muôn loài, người quân tử lấy đức dày mà bao bọc thế gian.',
    scholarlyAdvice: 'Lấy nhu thắng cương, đi sau mở lối, kiên nhẫn bồi đắp nội lực thay vì tranh đoạt quyền tiên phong.',
  },
  {
    id: 3,
    vietnameseName: 'Thủy Lôi Truân',
    chineseName: '水雷屯',
    pinyin: 'Zhūn',
    upperTrigram: 'Khảm',
    lowerTrigram: 'Chấn',
    judgment: 'Nguyên hanh lợi trinh, vật dụng hữu du vãng, lợi kiến hầu. Vạn sự khởi đầu nan.',
    image: 'Vân lôi truân, quân tử dĩ kinh luân. Mây sấm tụ họp, người quân tử sắp đặt trật tự, tính kế lâu dài.',
    scholarlyAdvice: 'Giai đoạn manh nha nhiều thử thách, chớ nên manh động, hãy tìm kiếm hiền tài và gây dựng nền tảng vững chắc.',
  },
  {
    id: 4,
    vietnameseName: 'Sơn Thủy Mông',
    chineseName: '山水蒙',
    pinyin: 'Méng',
    upperTrigram: 'Cấn',
    lowerTrigram: 'Khảm',
    judgment: 'Hanh. Phỉ ngã cầu đồng mông, đồng mông cầu ngã. Khai tâm mở trí, cầu học từ sự chân thành.',
    image: 'Sơn hạ xuất tuyền mông, quân tử dĩ quả hành dục đức. Dưới chân núi có dòng suối chảy, quân tử kiên quyết thực hành để nuôi dưỡng đức tính.',
    scholarlyAdvice: 'Cần sự khiêm cung học hỏi, gạt bỏ định kiến chủ quan, chọn bậc thầy đức độ để được chỉ đường dẫn lối.',
  },
  {
    id: 5,
    vietnameseName: 'Thủy Thiên Nhu',
    chineseName: '水天需',
    pinyin: 'Xū',
    upperTrigram: 'Khảm',
    lowerTrigram: 'Càn',
    judgment: 'Hữu phu, quang hanh, trinh cát, lợi thiệp đại xuyên. Kiên nhẫn chờ thời, lòng tin sáng tỏ.',
    image: 'Vân thượng ư thiên nhu, quân tử dĩ ẩm thực yến lạc. Mây bốc lên trời, quân tử vui vẻ ăn uống, an định tâm trí chờ thời cơ chín muồi.',
    scholarlyAdvice: 'Thời cơ chưa tới thì chớ cưỡng cầu. Hãy tích lũy năng lượng, tu dưỡng thân tâm, khi thiên thời hội đủ thì hành động ắt thành.',
  },
  {
    id: 11,
    vietnameseName: 'Địa Thiên Thái',
    chineseName: '地天泰',
    pinyin: 'Tài',
    upperTrigram: 'Khôn',
    lowerTrigram: 'Càn',
    judgment: 'Tiểu vãng đại lai, cát hanh. Âm dương giao hòa, vạn vật thái bình hưng thịnh.',
    image: 'Thiên địa giao thái, hậu dĩ tài thành thiên địa chi đạo. Trời đất giao hòa, bậc minh quân thuận theo đạo tự nhiên mà trị vì.',
    scholarlyAdvice: 'Thời vận hanh thông nhất mực, song phải biết giữ gìn lúc bình yên, chuẩn bị cho lúc bĩ cực, tránh chủ quan khinh suất.',
  },
  {
    id: 12,
    vietnameseName: 'Thiên Địa Bĩ',
    chineseName: '天地否',
    pinyin: 'Pǐ',
    upperTrigram: 'Càn',
    lowerTrigram: 'Khôn',
    judgment: 'Bĩ chi phỉ nhân, bất lợi quân tử trinh, đại vãng tiểu lai. Trời đất bế tắc, âm dương cách trở.',
    image: 'Thiên địa bất giao bĩ, quân tử dĩ kiệm đức tị nạn. Trời đất không giao hòa, quân tử giấu tài tích đức để tránh tai ương.',
    scholarlyAdvice: 'Lúc bế tắc thời thế không thuận, không nên mưu sự lớn ra ngoài, nên quy ẩn, cẩn trọng lời ăn tiếng nói và gìn giữ thanh danh.',
  },
  {
    id: 14,
    vietnameseName: 'Hỏa Thiên Đại Hữu',
    chineseName: '火天大有',
    pinyin: 'Dà Yǒu',
    upperTrigram: 'Ly',
    lowerTrigram: 'Càn',
    judgment: 'Nguyên hanh. Lửa rực sáng trên trời cao, sở hữu to lớn, giàu có về tài đức.',
    image: 'Hỏa tại thiên thượng đại hữu, quân tử dĩ át ác dương thiện, thuận thiên hưu mệnh. Ngăn ngừa điều ác, biểu dương điều thiện.',
    scholarlyAdvice: 'Có tài có của thì càng phải khiêm nhường, đem tài lực phụng sự nhân sinh, tránh khoe khoang mà chuốc lòng đố kỵ.',
  },
  {
    id: 15,
    vietnameseName: 'Địa Sơn Khiêm',
    chineseName: '地山謙',
    pinyin: 'Qiān',
    upperTrigram: 'Khôn',
    lowerTrigram: 'Cấn',
    judgment: 'Hanh, quân tử hữu chung. Núi cao giấu mình dưới lòng đất rộng, khiêm nhường là đức tột cùng.',
    image: 'Địa trung hữu sơn khiêm, quân tử dĩ phẫu đa ích quả, xưng vật bình thi. Cân bằng bớt nơi thừa bù nơi thiếu, hành xử công bằng.',
    scholarlyAdvice: 'Quẻ duy nhất trong 64 quẻ lục hào toàn cát. Giữ tấm lòng khiêm tốn, hạ mình phụng sự thì đi đâu cũng gặp bình an.',
  },
  {
    id: 63,
    vietnameseName: 'Thủy Hỏa Ký Tế',
    chineseName: '水火既濟',
    pinyin: 'Jì Jì',
    upperTrigram: 'Khảm',
    lowerTrigram: 'Ly',
    judgment: 'Hanh tiểu, lợi trinh, sơ cát chung loạn. Việc đã hoàn thành viên mãn, nhưng cần đề phòng biến chuyển suy tàn.',
    image: 'Thủy tại hỏa thượng ký tế, quân tử dĩ tư hoạn nhi dự phòng chi. Nước trên lửa, quân tử lo trước cái họa để phòng ngừa sớm.',
    scholarlyAdvice: 'Khi mọi sự đã đâu vào đấy, cái nguy lại bắt đầu rình rập. Giữ gìn thành quả khó hơn gây dựng, cần kiểm soát chi tiết.',
  },
  {
    id: 64,
    vietnameseName: 'Hỏa Thủy Vị Tế',
    chineseName: '火水未濟',
    pinyin: 'Wèi Jì',
    upperTrigram: 'Ly',
    lowerTrigram: 'Khảm',
    judgment: 'Hanh, tiểu hồ ngật tế, nhu kỳ vĩ, vô sở lợi. Việc chưa xong, hành trình bất tận của sinh mệnh.',
    image: 'Hỏa tại thủy thượng vị tế, quân tử dĩ thận biện vật cư phương. Lửa trên nước, quân tử cẩn trọng phân định từng việc để an cư.',
    scholarlyAdvice: 'Một chu kỳ kết thúc mở ra sự khởi đầu mới. Luôn giữ niềm hy vọng, không ngừng hoàn thiện bản thân để nghênh đón vận hội mới.',
  },
];

// Tìm quẻ theo 6 vạch (từ dưới lên: line 1 -> line 6)
// '1' = Dương, '0' = Âm
export function findHexagramByBinary(binary6: string): HexagramData {
  // Lower trigram: lines 1, 2, 3 (binary6[0..2])
  // Upper trigram: lines 4, 5, 6 (binary6[3..5])
  const lowerBin = binary6.slice(0, 3);
  const upperBin = binary6.slice(3, 6);

  let lowerTrigram = 'Càn';
  let upperTrigram = 'Càn';

  for (const [name, trigram] of Object.entries(TRIGRAMS)) {
    if (trigram.binary === lowerBin) lowerTrigram = name;
    if (trigram.binary === upperBin) upperTrigram = name;
  }

  const match = HEXAGRAMS_CATALOG.find(
    (h) => h.lowerTrigram === lowerTrigram && h.upperTrigram === upperTrigram
  );

  if (match) return match;

  // Dự phòng tổng quát nếu quẻ ngoài bảng mẫu catalog
  return {
    id: 99,
    vietnameseName: `${upperTrigram} ${lowerTrigram}`,
    chineseName: `${upperTrigram}卦`,
    pinyin: 'Guà',
    upperTrigram,
    lowerTrigram,
    judgment: `Quẻ kết hợp giữa thượng quái ${upperTrigram} và hạ quái ${lowerTrigram}. Vạn vật tuần hoàn theo đạo âm dương biến dịch.`,
    image: `${upperTrigram} ở trên, ${lowerTrigram} ở dưới. Người quân tử tùy thời ứng biến, lấy đức sáng soi đường.`,
    scholarlyAdvice: 'Nhìn sâu vào bản chất sự việc, không nóng vội quyết định khi lòng còn nghi ngại, thuận theo quy luật tự nhiên.',
  };
}

// Gieo 3 đồng xu cổ
// Âm = 2, Dương = 3
// 3 Âm = 6 (Lão Âm - Động)
// 1 Âm + 2 Dương = 8 (Thiếu Âm - Tĩnh)
// 2 Âm + 1 Dương = 7 (Thiếu Dương - Tĩnh)
// 3 Dương = 9 (Lão Dương - Động)
export function tossCoins(): {
  coins: [number, number, number];
  sum: number;
  yinYang: 'yin' | 'yang';
  isMoving: boolean;
} {
  // 0: Âm (2), 1: Dương (3)
  const c1 = Math.random() > 0.5 ? 3 : 2;
  const c2 = Math.random() > 0.5 ? 3 : 2;
  const c3 = Math.random() > 0.5 ? 3 : 2;
  const sum = c1 + c2 + c3;

  return {
    coins: [c1, c2, c3],
    sum,
    yinYang: sum % 2 === 1 ? 'yang' : 'yin', // 7 & 9 là Dương, 6 & 8 là Âm
    isMoving: sum === 6 || sum === 9,
  };
}

// Tạo lập quẻ hoàn chỉnh từ 6 lần gieo
export function generateHexagramFromTosses(
  lineValues: number[], // 6 giá trị [vạch 1, vạch 2, ..., vạch 6]
  dayStem: Stem = 'Giáp',
): Hexagram {
  // Xác định nhị phân cho Quẻ Chủ
  const primaryBinaryArr = lineValues.map((v) => (v % 2 === 1 ? '1' : '0'));
  const primaryBinary = primaryBinaryArr.join('');
  const primaryData = findHexagramByBinary(primaryBinary);

  // Xác định nhị phân cho Quẻ Biến (đảo hào động)
  const hasMovingLines = lineValues.some((v) => v === 6 || v === 9);
  const transformedBinaryArr = lineValues.map((v) => {
    if (v === 6) return '1'; // Âm động biến Dương
    if (v === 9) return '0'; // Dương động biến Âm
    return v % 2 === 1 ? '1' : '0';
  });
  const transformedBinary = transformedBinaryArr.join('');
  const transformedData = hasMovingLines ? findHexagramByBinary(transformedBinary) : undefined;

  // Lục Thú dựa vào Can ngày gieo quẻ
  const beastStarters: Record<Stem, number> = {
    Giáp: 0, Ất: 0,   // Thanh Long khởi hào 1
    Bính: 1, Đinh: 1, // Chu Tước
    Mậu: 2,           // Câu Trần
    Kỷ: 3,            // Đằng Xà
    Canh: 4, Tân: 4,  // Bạch Hổ
    Nhâm: 5, Quý: 5,  // Huyền Vũ
  };
  const BEASTS: HexagramLine['beast'][] = ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'];
  const startBeastIdx = beastStarters[dayStem] ?? 0;

  const KINSHIPS: HexagramLine['kinship'][] = ['Phụ Mẫu', 'Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Quan Quỷ'];
  const ELEMENTS: HexagramLine['element'][] = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];

  // Dựng 6 hào
  const lines: HexagramLine[] = lineValues.map((val, idx) => {
    const lineIndex = idx + 1;
    const yinYang: 'yin' | 'yang' = val % 2 === 1 ? 'yang' : 'yin';
    const isMoving = val === 6 || val === 9;
    const beast = BEASTS[(startBeastIdx + idx) % 6];
    const kinship = KINSHIPS[idx % 5];
    const element = ELEMENTS[idx % 5];

    // Hào Thế & Ứng mẫu chuẩn (Thế hào 3, Ứng hào 6 đối ứng cách 3 hào)
    const isThe = lineIndex === 3;
    const isUng = lineIndex === 6;

    return {
      lineIndex,
      yinYang,
      isMoving,
      value: val,
      element,
      kinship,
      beast,
      stemBranch: `${dayStem} ${lineIndex}`,
      isThe,
      isUng,
    };
  });

  return {
    id: primaryData.id,
    name: primaryData.vietnameseName,
    vietnameseName: primaryData.vietnameseName,
    chineseName: primaryData.chineseName,
    pinyin: primaryData.pinyin,
    upperTrigram: primaryData.upperTrigram,
    lowerTrigram: primaryData.lowerTrigram,
    lines,
    palaceGroup: `Cung ${primaryData.upperTrigram}`,
    judgment: primaryData.judgment,
    image: primaryData.image,
    scholarlyAdvice: primaryData.scholarlyAdvice,
    transformedHexagram: transformedData
      ? {
          id: transformedData.id,
          name: transformedData.vietnameseName,
          vietnameseName: transformedData.vietnameseName,
          chineseName: transformedData.chineseName,
          lines: lines.map((l, idx) => ({
            ...l,
            yinYang: transformedBinaryArr[idx] === '1' ? 'yang' : 'yin',
            isMoving: false,
          })),
          judgment: transformedData.judgment,
        }
      : undefined,
  };
}
