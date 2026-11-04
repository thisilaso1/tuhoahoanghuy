export interface ScholarlyArticle {
  id: string;
  category: 'tu_vi' | 'tu_hoa' | 'kinh_dich' | 'triet_hoc';
  title: string;
  chineseTitle?: string;
  source: string;
  summary: string;
  content: string;
  keyConcepts: string[];
}

export interface LexiconTerm {
  term: string;
  chinese: string;
  pronunciation: string;
  category: string;
  definition: string;
  scholarlyNote: string;
}

export const CLASSICAL_ARTICLES: ScholarlyArticle[] = [
  {
    id: 'kham-thien-tu-hoa-tam-phap',
    category: 'tu_hoa',
    title: 'Khâm Thiên Tứ Hóa Tâm Pháp: Ly Tâm Dữ Hướng Tâm',
    chineseTitle: '欽天四化心法：離心與向心',
    source: 'Khâm Thiên Môn Bí Điển',
    summary: 'Khảo sát bản chất không-thời gian của Tự Hóa: sự tương tác giữa khí nội tại của cung vị và lực kéo của vũ trụ bên ngoài.',
    content: `Khâm Thiên Tứ Hóa lấy Tứ Hóa (Lộc, Quyền, Khoa, Kỵ) làm linh hồn của toàn bộ mệnh bàn. Trong đó, Tự Hóa là điểm vi diệu nhất phân biệt Bắc Phái với các trường phái khác.

1. Tự Hóa Ly Tâm:
Khi Thiên Can của chính bản cung làm hóa tinh cho sao tọa thủ ngay tại cung đó, gọi là Tự Hóa Ly Tâm. Về mặt triết học, đây là hiện tượng "vật cực tất phản", năng lượng tích tụ đến độ bão hòa rồi phát tán ra bên ngoài. Người có Cung Tài Bạch tự hóa Lộc ly tâm thường kiếm tiền rất nhanh nhưng tiêu xài rộng rãi, duyên tiền bạc đến rồi đi một cách tự nhiên.

2. Tự Hóa Hướng Tâm:
Khi Cung Đối Chiếu (cung xung chiếu cách 6 vị trí) phát sinh Tứ Hóa chiếu thẳng vào bản cung, gọi là Tự Hóa Hướng Tâm. Đây là ngoại lực tác động, quý nhân từ xa đến nâng đỡ, hoặc thời thế dồn dập đưa cơ hội vào tay mà đương số tiếp nhận được.

Học giả Khâm Thiên không nhìn lá số như một định mệnh bất di bất dịch, mà nhìn như một bản đồ dòng chảy năng lượng. Hiểu được hướng tâm và ly tâm là hiểu được khi nào nên hành động (tiến), khi nào nên ẩn nhẫn thu tàng (thoái).`,
    keyConcepts: ['Tự Hóa', 'Ly Tâm', 'Hướng Tâm', 'Phi Tinh', 'Đối Cung'],
  },
  {
    id: 'menh-than-dong-nguyen',
    category: 'tu_vi',
    title: 'Mệnh Thân Đồng Nguyên Dữ Hậu Thiên Tu Dưỡng',
    chineseTitle: '命身同源與後天修養',
    source: 'Tử Vi Đẩu Số Toàn Thư — Trần Đoàn Gia Cát',
    summary: 'Mệnh là bản chất tiên thiên do trời phú, Thân là hành vi hậu thiên do tâm tạo. Mối quan hệ biện chứng giữa định mệnh và sự chuyển hóa nhân cách.',
    content: `Cổ nhân định vị: "Mệnh vi tiên thiên chi bản, Thân vi hậu thiên chi sở". Cung Mệnh chủ về tư chất bẩm sinh, tính cách căn bản, hoàn cảnh xuất thân và phúc trạch tiên tổ. Cung Thân chủ về sự phát triển sau tuổi 30, những quyết định có ý thức, nghiệp lực tự tạo và định hướng nghề nghiệp, hôn nhân.

Người xưa dạy: "Mệnh hảo bất như Thân hảo, Thân hảo bất như Vận hảo". Dù Mệnh có cách cục bình thường, nhưng nếu Thân cư vào cung vị sáng sủa, hội ngộ Khoa Quyền cát tinh, cộng với ý chí tự cường thì hậu vận ắt vững vàng.

Chiêm tinh học Đông Phương không dạy con người cam chịu, mà chỉ ra điểm yếu để khắc chế, điểm mạnh để phát huy, ấy mới chính là tinh thần của người quân tử vấn bốc: "Tri mệnh giả bất oán thiên, tri kỷ giả bất oán nhân".`,
    keyConcepts: ['Tiên Thiên', 'Hậu Thiên', 'Cung Thân', 'Tu Dưỡng', 'Biện Chứng'],
  },
  {
    id: 'chu-dich-bat-quai-nap-giap',
    category: 'kinh_dich',
    title: 'Chu Dịch Biến Dịch Dữ Lục Hào Dự Trắc',
    chineseTitle: '周易變易與六爻預測',
    source: 'Tăng San Bốc Dịch — Dã Hạc Lão Nhân',
    summary: 'Đạo Dịch lấy ba nguyên lý: Bất dịch (nguyên lý vĩnh hằng), Biến dịch (vạn vật luôn đổi dời), và Giản dị (quy luật đơn giản quy nạp trời đất).',
    content: `Trong Kinh Dịch, 64 quẻ không phải là trò đoán mò may rủi, mà là mô hình toán học nhị phân mô phỏng sự tương tác giữa hai thái cực Âm và Dương trong vũ trụ.

Khi người quân tử gieo ba đồng xu cổ, tâm chí phải tĩnh lặng như mặt hồ mùa thu: "Cảm nhi toại thông thiên hạ chi cố". Ba đồng xu gieo xuống sáu lần tương ứng sáu hào từ Đất lên Trời (Địa, Nhân, Thiên). Hào động là điểm then chốt nhất báo hiệu sự chuyển dịch của thời cuộc: "Cực tắc biến, biến tắc thông, thông tắc cửu".

Hiểu được Dụng Thần trong Lục Hào là nắm bắt được trọng tâm của vấn đề cần giải quyết, từ đó đưa ra sách lược xử thế phù hợp với thiên thời, địa lợi và nhân hòa.`,
    keyConcepts: ['Bất Dịch', 'Biến Dịch', 'Dụng Thần', 'Lục Thân', 'Hào Động'],
  },
];

export const LEXICON_TERMS: LexiconTerm[] = [
  {
    term: 'Tam Phương Tứ Chính',
    chinese: '三方四正',
    pronunciation: 'Sān fāng sì zhèng',
    category: 'Tử Vi Cốt Lõi',
    definition: 'Gồm bản cung, 2 cung Tam Hợp (cách nhau 4 cung) và 1 cung Xung Chiếu (đối diện cách 6 cung).',
    scholarlyNote: 'Một cung không thể luận đoán đơn độc mà phải xem xét toàn bộ mạng lưới giao thoa năng lượng của Tam Phương Tứ Chính.',
  },
  {
    term: 'Phi Hóa',
    chinese: '飛化',
    pronunciation: 'Fēi huà',
    category: 'Khâm Thiên',
    definition: 'Khái niệm can của một cung phát tán Lộc, Quyền, Khoa, Kỵ đến các cung vị khác nơi có sao tương ứng.',
    scholarlyNote: 'Biểu thị đường đi của nhân duyên: ta quan tâm điều gì, năng lượng tâm trí ta đổ dồn về đâu trong cuộc đời.',
  },
  {
    term: 'Hào Thế & Hào Ứng',
    chinese: '世爻與應爻',
    pronunciation: 'Shì yáo yǔ yìng yáo',
    category: 'Kinh Dịch',
    definition: 'Trong quẻ Kinh Dịch, hào Thế đại diện cho đương số (bản thân), hào Ứng đại diện cho đối phương hoặc sự việc cần bốc.',
    scholarlyNote: 'Tương quan ngũ hành sinh khắc giữa Thế và Ứng quyết định sự hòa hợp hay trắc trở của quan hệ.',
  },
  {
    term: 'Dụng Thần',
    chinese: '用神',
    pronunciation: 'Yòng shén',
    category: 'Kinh Dịch / Bốc Dịch',
    definition: 'Hào đại diện cho chủ đề người bốc muốn hỏi (Hỏi tiền lấy Thê Tài, hỏi quan lộc sự nghiệp lấy Quan Quỷ, hỏi thi cử học vấn lấy Phụ Mẫu).',
    scholarlyNote: 'Xác định sai Dụng Thần thì toàn bộ kết quả phân tích quẻ đều vô nghĩa.',
  },
  {
    term: 'Lộc Kỵ Đối Xung',
    chinese: '祿忌對衝',
    pronunciation: 'Lù jì duì chōng',
    category: 'Khâm Thiên',
    definition: 'Hiện tượng cung có Hóa Lộc đối diện với cung có Hóa Kỵ, tạo nên trường năng lượng xung đột mạnh mẽ.',
    scholarlyNote: 'Cổ nhân ví như hoa nở gặp sương giá, khởi đầu rực rỡ nhưng kết cục dễ hao tổn nếu không biết dừng đúng lúc.',
  },
];
