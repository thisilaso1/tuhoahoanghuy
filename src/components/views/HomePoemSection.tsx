import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

const verses = [
  'Nguyệt mãn trung thiên vũ vị đình',
  'Viên luân đãi phận mộng nan thành',
  'Tha triêu nhược đắc giai nhân hứa',
  'Lãng nhật cao huyền hoán các danh',
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
          <p className="home-poem-brand poem-reveal" style={{ '--poem-delay': '0ms' } as React.CSSProperties}>HOÀI NGUYỆT CÁC <i>·</i> KHÂM THIÊN TỨ HÓA</p>
          <header className="home-poem-heading poem-reveal" style={{ '--poem-delay': '160ms' } as React.CSSProperties}>
            <h2 id="home-poem-title">Nguyệt Mãn Vị Thành Danh</h2>
          </header>
          <div className="home-poem-hanviet" aria-label="Bài thơ">
            {verses.map((verse, index) => <p className="poem-reveal" style={{ '--poem-delay': `${300 + index * 180}ms` } as React.CSSProperties} key={verse}>{verse}</p>)}
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
