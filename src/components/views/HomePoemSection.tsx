import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

const couplets = [
  ['月滿中天雨未停', 'Nguyệt mãn trung thiên vũ vị đình'],
  ['圓輪待分夢難成', 'Viên luân đãi phận mộng nan thành'],
  ['他朝若得佳人許', 'Tha triêu nhược đắc giai nhân hứa'],
  ['朗日高懸換閣名', 'Lãng nhật cao huyền hoán các danh'],
];

export const HomePoemSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`home-poem-section ${isVisible ? 'is-visible' : ''}`} aria-labelledby="home-poem-title">
      <div className="home-poem-sky" aria-hidden="true"><span className="home-poem-moon" /><span className="home-poem-water" /><span className="home-poem-rain home-poem-rain-one" /><span className="home-poem-rain home-poem-rain-two" /></div>
      <div className="home-poem-card" key={replay}>
        <div className="home-poem-content">
          <p className="home-poem-brand poem-reveal" style={{ '--poem-delay': '0ms' } as React.CSSProperties}>懷 月 閣 <i>·</i> HOÀI NGUYỆT CÁC</p>
          <header className="home-poem-heading poem-reveal" style={{ '--poem-delay': '160ms' } as React.CSSProperties}>
            <h2 id="home-poem-title">Nguyệt Mãn Vị Thành Danh</h2>
            <p lang="zh-Hant">月滿未成名</p>
          </header>
          <div className="home-poem-verses" lang="zh-Hant" aria-label="Bài thơ chữ Hán">
            {couplets.map(([han, viet], index) => <p className="home-poem-han poem-reveal" style={{ '--poem-delay': `${300 + index * 180}ms` } as React.CSSProperties} key={han}>{han}</p>)}
          </div>
          <div className="home-poem-hanviet" aria-label="Phiên âm Hán Việt">
            {couplets.map(([, viet], index) => <p className="poem-reveal" style={{ '--poem-delay': `${1050 + index * 120}ms` } as React.CSSProperties} key={viet}>{viet}</p>)}
          </div>
          <div className="home-poem-translation poem-reveal" style={{ '--poem-delay': '1650ms' } as React.CSSProperties}>
            <h3>DỊCH NGHĨA PHÓNG TÁC</h3>
            <p>Trăng thì tròn, “lốp” cũng tròn, mà danh phận vẫn chưa đâu vào đâu.</p>
            <p>Lòng còn ôm trăng nên nước còn phản chiếu nỗi nhớ.</p>
            <p>Ngày nào chuyện này được chốt cho đàng hoàng,</p>
            <p>thì đổi tên luôn sang Lãng Nhật Các — từ yêu thầm sang công khai sáng sủa.</p>
          </div>
          <p className="home-poem-punchline poem-reveal" style={{ '--poem-delay': '2050ms' } as React.CSSProperties}>“Thiên thời đã đủ, địa lợi đã xong, chỉ còn nhân hòa chưa duyệt hồ sơ.” :V</p>
          <button type="button" className="home-poem-replay" onClick={() => setReplay((value) => value + 1)}><RotateCcw size={13} /> Đọc lại thi khúc</button>
        </div>
      </div>
    </section>
  );
};
