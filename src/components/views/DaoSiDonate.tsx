export function DaoSiDonate() {
  return (
    <details className="dao-si-donate">
      <summary aria-label="Đạo hữu, tôi tính ra quẻ cho bạn hôm nay nè. Bấm để nghe tiếp.">
        <span className="dao-si-greeting" aria-hidden="true">Đạo hữu, tôi tính ra quẻ cho bạn hôm nay nè!</span>
        <svg viewBox="0 0 180 168" aria-hidden="true" className="dao-si-portrait">
          <circle cx="90" cy="83" r="66" fill="#193141" stroke="#9ab6c3" strokeOpacity=".45" />
          <path d="M23 93h27m-14 5h20m77-47h25m-34 5h25" stroke="#aec5d0" strokeOpacity=".45" strokeLinecap="round" />
          <path d="M37 153c4-31 21-54 53-54s49 23 53 54c-28 12-78 12-106 0Z" fill="#497782" stroke="#192b36" strokeWidth="3" />
          <path d="m65 109 26 26 23-25m-23 25 20 23" fill="none" stroke="#e3c689" strokeWidth="5" strokeLinejoin="round" />
          <g transform="translate(-12 -8) scale(1.13 1.08)">
            <g className="dao-si-head">
              <path d="M55 68c-3-19 11-33 35-33s38 14 35 33l-6 28H61Z" fill="#253240" stroke="#162534" strokeWidth="3" />
              <circle cx="58" cy="83" r="7" fill="#efb28e" stroke="#263644" strokeWidth="2.5" />
              <circle cx="122" cy="83" r="7" fill="#efb28e" stroke="#263644" strokeWidth="2.5" />
              <path d="M61 68q29-19 58 0v16c0 17-11 25-29 25S61 101 61 84Z" fill="#ffd4ad" stroke="#263644" strokeWidth="2.5" />
              <path d="M57 65h66l-9-26-16-9H82l-16 9Z" fill="#223749" stroke="#162534" strokeWidth="3" strokeLinejoin="round" />
              <path d="M53 65h74" stroke="#e3c689" strokeWidth="4" strokeLinecap="round" />
              <circle cx="90" cy="48" r="7" fill="#ead5a4" />
              <path d="M90 41a7 7 0 0 0 0 14 3.5 3.5 0 0 0 0-7 3.5 3.5 0 0 1 0-7Z" fill="#223749" />
              <circle cx="90" cy="44.5" r="1" fill="#223749" /><circle cx="90" cy="51.5" r="1" fill="#ead5a4" />
              <path d="M64 65q4 8 14 7l-2-7m5 0q6 9 14 6l-3-6" fill="#293341" />
              <ellipse cx="77" cy="83" rx="6" ry="7" fill="#fff7eb" />
              <ellipse cx="103" cy="83" rx="6" ry="7" fill="#fff7eb" />
              <g className="dao-si-gaze" fill="#2b2533">
                <circle cx="77" cy="83" r="3.8" /><circle cx="103" cy="83" r="3.8" />
                <circle cx="78" cy="81.5" r="1" fill="#fff" /><circle cx="104" cy="81.5" r="1" fill="#fff" />
              </g>
              <ellipse cx="70" cy="92" rx="4.5" ry="2.4" fill="#e58e83" opacity=".72" />
              <ellipse cx="110" cy="92" rx="4.5" ry="2.4" fill="#e58e83" opacity=".72" />
              <path className="dao-si-smile" d="M85 96q5 5 10 0" fill="none" stroke="#82504f" strokeWidth="2" strokeLinecap="round" />
              <g className="dao-si-mouth">
                <ellipse cx="90" cy="97" rx="5" ry="4" fill="#82504f" />
                <path d="M87 99q3-3 6 0" fill="#efa49b" />
              </g>
            </g>
          </g>
          <g className="dao-si-hand">
            <path d="M127 152c-8-2-16-9-18-17l-1-9c-.4-3 3-5 5-2l4 6-1-18c0-4 5-5 6-1l3 12 2-18c.5-4 6-4 6 0l-1 18 4-7c2-4 6-2 5 2l-3 13c-1 6-2 12-8 17Z" fill="#efc49c" stroke="#263644" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M117 131q7-8 14-3-3 5-8 5l1 7" fill="none" stroke="#9c6755" strokeWidth="2" strokeLinecap="round" />
            <path d="m114 146 19 4-3 9-20-4Z" fill="#e3c689" stroke="#263644" strokeWidth="2" />
          </g>
          <path className="dao-si-spark" d="M148 95v14m-7-7h14m-4-17v6m-3-3h6" stroke="#f4d488" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="dao-si-speech">
        <p>“Bần đạo vừa bấm một quẻ. Nếu Hoài Nguyệt Các hữu ích với bạn, mời bạn ủng hộ một chén trà để cùng giữ đèn thư các nhé!”</p>
        <div className="dao-si-qr">
          <img src="/art/donate-tpbank.png" alt="Quét VietQR để ủng hộ qua TPBank" width="630" height="1280" loading="lazy" />
        </div>
        <small>Quét mã bằng ứng dụng ngân hàng để ủng hộ.</small>
      </div>
    </details>
  );
}
