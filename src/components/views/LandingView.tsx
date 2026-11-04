import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown, ArrowRight, BookOpen, Calendar, Compass, Grid2X2, Layers, Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/* ─── Moon-phase calculation ─────────────────────────────────── */
const SYNODIC_MS = 29.530588853 * 86_400_000;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14); // 2000-01-06 18:14 UTC

function getMoonPhase(date: Date): {
  phase: number;        // 0–1 within synodic cycle
  phaseName: string;   // human readable
  isFull: boolean;
  isNew: boolean;
  waxing: boolean;
  illumination: number; // 0–1
} {
  const phase = (((date.getTime() - KNOWN_NEW_MOON_MS) % SYNODIC_MS) + SYNODIC_MS) % SYNODIC_MS / SYNODIC_MS;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase)) / 2 * 100) / 100;
  const isFull = Math.abs(phase - 0.5) < 0.035;
  const isNew  = phase < 0.028 || phase > 0.972;
  const waxing = phase < 0.5;

  let phaseName = '';
  if (isNew)                   phaseName = 'Sóc (Trăng Non)';
  else if (phase < 0.25)       phaseName = 'Trăng Lưỡi Liềm';
  else if (Math.abs(phase - 0.25) < 0.04) phaseName = 'Thượng Huyền';
  else if (phase < 0.5)        phaseName = 'Trăng Lồi Đầu Tháng';
  else if (isFull)             phaseName = 'Vọng (Trăng Tròn — Rằm)';
  else if (phase < 0.75)       phaseName = 'Trăng Lồi Cuối Tháng';
  else if (Math.abs(phase - 0.75) < 0.04) phaseName = 'Hạ Huyền';
  else                         phaseName = 'Trăng Lưỡi Liềm Cuối';

  return { phase, phaseName, isFull, isNew, waxing, illumination };
}

/* ─── Moon disc SVG (accurate crescent mask) ─────────────────── */
const MoonDisc: React.FC<{ phase: number; isFull: boolean; size?: number }> = ({ phase, isFull, size = 120 }) => {
  // For crescent: shadow ellipse moves from fully covering (new) to no cover (full) to opposite side.
  // phase 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
  const lit = (1 - Math.cos(2 * Math.PI * phase)) / 2; // 0=new, 1=full
  // The crescent is controlled by rx of a shadow ellipse overlaid on the right half
  // phase < 0.5 → waxing (lit on right), phase > 0.5 → waning (lit on left)
  const r = size / 2;
  const shadowRx = Math.abs(2 * lit - 1) * r; // 0 at quarter, r at new/full
  const shadowFill = '#0a1420'; // dark background colour of moon shadow

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="moon-svg-disc"
    >
      <defs>
        <radialGradient id="moonGlow" cx="38%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f2f6fb" />
          <stop offset="75%" stopColor="#d9e5ef" />
          <stop offset="100%" stopColor="#adc8da" />
        </radialGradient>
        <clipPath id="moonClip">
          <circle cx={r} cy={r} r={r - 1} />
        </clipPath>
      </defs>
      {/* Full moon base */}
      <circle cx={r} cy={r} r={r - 1} fill="url(#moonGlow)" />
      {/* Crescent shadow overlay — omit when full */}
      {!isFull && (
        <g clipPath="url(#moonClip)">
          {/* Dark semicircle covers opposite side of lit */}
          {phase < 0.5 ? (
            /* Waxing: shadow on left */
            <>
              <rect x={0} y={0} width={r} height={size} fill={shadowFill} />
              <ellipse cx={r} cy={r} rx={shadowRx} ry={r - 1} fill={shadowFill} />
            </>
          ) : (
            /* Waning: shadow on right */
            <>
              <rect x={r} y={0} width={r} height={size} fill={shadowFill} />
              <ellipse cx={r} cy={r} rx={shadowRx} ry={r - 1} fill={shadowFill} />
            </>
          )}
          {/* Subtle craters */}
          <ellipse cx={r * 0.52} cy={r * 0.46} rx={r * 0.14} ry={r * 0.1} fill="rgba(166,177,180,.18)" />
          <ellipse cx={r * 0.74} cy={r * 0.72} rx={r * 0.1} ry={r * 0.1} fill="rgba(166,177,180,.14)" />
          <ellipse cx={r * 0.6} cy={r * 0.78} rx={r * 0.07} ry={r * 0.07} fill="rgba(166,177,180,.12)" />
        </g>
      )}
      {isFull && (
        <g clipPath="url(#moonClip)">
          <ellipse cx={r * 0.52} cy={r * 0.46} rx={r * 0.14} ry={r * 0.1} fill="rgba(166,177,180,.14)" />
          <ellipse cx={r * 0.74} cy={r * 0.72} rx={r * 0.1} ry={r * 0.1} fill="rgba(166,177,180,.1)" />
          <ellipse cx={r * 0.6} cy={r * 0.78} rx={r * 0.07} ry={r * 0.07} fill="rgba(166,177,180,.09)" />
        </g>
      )}
    </svg>
  );
};

/* ─── Celestial orb wrapper ─────────────────────────────────── */
interface CelestialProps {
  isDaytime: boolean;
  moonPhase: { phase: number; phaseName: string; isFull: boolean; isNew: boolean };
}
const CelestialOrb: React.FC<CelestialProps> = ({ isDaytime, moonPhase }) => {
  if (isDaytime) {
    return (
      <div className="landing-celestial landing-sun-orb" aria-label="Mặt trời ban ngày">
        <div className="landing-sun-core" />
        <div className="landing-sun-rays" />
      </div>
    );
  }
  return (
    <div
      className={`landing-celestial landing-moon-orb ${moonPhase.isFull ? 'is-full-moon' : ''}`}
      aria-label={moonPhase.phaseName}
    >
      <div className={`landing-moon-glow ${moonPhase.isFull ? 'full-glow' : ''}`} />
      <MoonDisc phase={moonPhase.phase} isFull={moonPhase.isFull} size={110} />
      {moonPhase.isFull && (
        <span className="landing-full-moon-label">TRĂNG TRÒN · NGÀY RẰM</span>
      )}
    </div>
  );
};

/* ─── Feature cards ─────────────────────────────────────────── */
const FEATURES = [
  {
    route: '/la-so' as const,
    label: 'An Sao Lá Số',
    desc: 'Nhập ngày giờ sinh · Tử Vi Đẩu Số 14 chính tinh · Đại tiểu hạn',
    icon: Grid2X2,
    primary: true,
  },
  {
    route: '/tu-hoa' as const,
    label: 'Tứ Hóa Khâm Thiên',
    desc: 'Phi tinh · Tự hóa Ly tâm & Hướng tâm · Đa phái',
    icon: Layers,
    primary: false,
    status: '',
  },
  {
    route: '/thien-co' as const,
    label: 'AI Thiên Cơ',
    desc: 'Luận giải bằng ngôn ngữ tự nhiên · Phi Hóa tương tác',
    icon: Sparkles,
    primary: false,
    status: 'Đang phát triển',
  },
  {
    route: '/kinh-dich' as const,
    label: 'Kinh Dịch & Lục Hào',
    desc: '64 quẻ · Thế Ứng · Lục Thần · Dụng thần',
    icon: Compass,
    primary: false,
    status: 'Đang phát triển',
  },
  {
    route: '/van-han' as const,
    label: 'Vận Trình',
    desc: 'Đại hạn 10 năm · Tiểu hạn · Lưu niên Tứ Hóa',
    icon: Calendar,
    primary: false,
    status: 'Đang phát triển',
  },
  {
    route: '/thu-cac' as const,
    label: 'Thư Các',
    desc: 'Kho kiến thức · Thuật ngữ · Điển cố cổ văn',
    icon: BookOpen,
    primary: false,
    status: 'Đang phát triển',
  },
];

/* ─── Main component ─────────────────────────────────────────── */
export const LandingView: React.FC = () => {
  const { navigateTo } = useApp();
  const [now, setNow] = useState(() => new Date());
  const revealRefs = useRef<Array<HTMLElement | null>>([]);

  // Update clock every minute
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Scroll-reveal intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const moonPhase = getMoonPhase(now);

  const scrollToFeatures = () =>
    document.getElementById('tinh-nang')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const setRef = (index: number) => (el: HTMLElement | null) => {
    revealRefs.current[index] = el;
  };

  return (
    <div className={`landing-page ${isDaytime ? 'is-day' : 'is-night'}`}>

      {/* ══════════════ HERO ══════════════ */}
      <section className="landing-hero">
        {/* Sky backdrop */}
        <div className="landing-sky" aria-hidden="true">
          <div className="landing-sky-gradient" />
          {!isDaytime && <div className="landing-stars-field" />}
          <CelestialOrb isDaytime={isDaytime} moonPhase={moonPhase} />
          {!isDaytime && <div className="landing-pavilion" />}
          <div className="landing-mist-layer" />
        </div>

        {/* Hero content */}
        <div className="landing-hero-content scroll-reveal is-visible">
          <p className="landing-eyebrow">TỬ VI ĐẨU SỐ · KHÂM THIÊN TỨ HÓA · KINH DỊCH</p>
          <h1>
            Hoài Nguyệt <em>Các</em>
          </h1>
          <p className="landing-intro">
            Nhập ngày giờ sinh, chọn trường phái và năm cần xem để khởi tạo mệnh bàn.
            <br />
            Luận giải bằng ngôn ngữ tự nhiên cùng AI Thiên Cơ.
          </p>
          <div className="landing-actions">
            <button className="landing-primary" onClick={() => navigateTo('/la-so')}>
              <Grid2X2 size={18} /> An Sao Lá Số <ArrowRight size={17} />
            </button>
            <button className="landing-secondary" onClick={scrollToFeatures}>
              Khám phá tính năng <ArrowDown size={16} />
            </button>
          </div>
          <span className="landing-sky-note">
            {isDaytime
              ? 'ÁNH DƯƠNG · BAN NGÀY'
              : moonPhase.isFull
              ? 'TRĂNG TRÒN · NGÀY RẰM'
              : moonPhase.isNew
              ? 'SÓC NGÀY · TRĂNG NON'
              : `${moonPhase.phaseName.toUpperCase()} · ${Math.round(moonPhase.illumination * 100)}% CHIẾU SÁNG`}
          </span>
        </div>

        <span className="landing-scroll-hint" onClick={scrollToFeatures} role="button" tabIndex={0}>
          CUỘN ĐỂ KHÁM PHÁ <ArrowDown size={14} />
        </span>
      </section>

      {/* ══════════════ FEATURE SECTION ══════════════ */}
      <section id="tinh-nang" className="landing-features">
        {/* Moon / Sun watermark behind feature cards */}
        <div className="landing-features-bg-orb" aria-hidden="true">
          {isDaytime ? (
            <div className="landing-features-sun-bg" />
          ) : (
            <MoonDisc phase={moonPhase.phase} isFull={moonPhase.isFull} size={320} />
          )}
        </div>

        <header
          className="landing-section-heading scroll-reveal"
          ref={setRef(0)}
        >
          <span>HOÀI NGUYỆT CÁC · 懷月閣</span>
          <h2>Khám phá tính năng</h2>
          <p>Chọn một không gian để bắt đầu hành trình chiêm nghiệm.</p>
        </header>

        {/* Feature cards — rơi xuống từng cái khi scroll */}
        <div className="landing-feature-list">
          {FEATURES.map(({ route, label, desc, icon: Icon, primary, status }, index) => {
            const developing = Boolean(status);
            return (
            <button
              key={route}
              className={`landing-feature scroll-reveal ${primary ? 'feature-primary' : ''} ${developing ? 'feature-developing' : ''}`}
              ref={setRef(index + 1)}
              style={{ transitionDelay: `${index * 70}ms` }}
              onClick={() => { if (!developing) navigateTo(route); }}
              disabled={developing}
              aria-disabled={developing}
            >
              <span className="feature-number">0{index + 1}</span>
              <span className="feature-icon">
                <Icon size={primary ? 26 : 22} />
              </span>
              <div className="feature-copy">
                <h3>{label}{status && <span className="feature-status">{status}</span>}</h3>
                <p>{desc}</p>
              </div>
              <span className="feature-action">
                {status || 'Mở'} {!status && <ArrowRight size={15} />}
              </span>
            </button>
          );})}
        </div>

        <p className="landing-footnote">
          懷月閣 · Nhất phiến cố nguyệt, vạn cổ nhân duyên.
          <br />
          Mọi luận giải mang tính tham khảo, không thay thế quyết định cá nhân.
        </p>
      </section>
    </div>
  );
};
