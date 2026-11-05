import React from 'react';
import { useApp, AppRoute } from '../../context/AppContext';
import { AccountLogin } from './AccountLogin';
import { SealStamp } from '../common/SealStamp';
import {
  Compass,
  Sparkles,
  BookOpen,
  User,
  Settings,
  Menu,
  Layers,
  Calendar,
  Grid,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, authenticatedUser } = useApp();

  const navItems: Array<{ route: AppRoute; label: string; icon: React.ReactNode }> = [
    { route: '/', label: 'An Sao Lá Số', icon: <Grid size={15} /> },
    ...(authenticatedUser ? [{ route: '/menh-ban' as AppRoute, label: 'Lá Số Của Bạn', icon: <Grid size={15} /> }] : []),
    { route: '/thien-co', label: 'AI Thiên Cơ', icon: <Sparkles size={15} /> },
    { route: '/tu-hoa', label: 'Tứ Hóa', icon: <Layers size={15} /> },
    { route: '/kinh-dich', label: 'Kinh Dịch', icon: <Compass size={15} /> },
    { route: '/van-han', label: 'Vận Trình', icon: <Calendar size={15} /> },
    { route: '/thu-cac', label: 'Thư Các', icon: <BookOpen size={15} /> },
  ];

  const openFeatureMenu = () => {
    const menu = document.getElementById('tinh-nang');
    if (!menu) return;
    menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    menu.classList.remove('feature-menu-pulse');
    requestAnimationFrame(() => menu.classList.add('feature-menu-pulse'));
    window.setTimeout(() => menu.classList.remove('feature-menu-pulse'), 850);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-amber-900/20 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Group */}
        <div
          onClick={() => navigateTo('/')}
          className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-slate-900 shadow-inner">
            <span className="font-cjk text-lg font-bold text-amber-300">月</span>
            <div className="absolute -inset-1 rounded-full bg-amber-500/10 blur-sm group-hover:bg-amber-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold tracking-wide text-amber-100 sm:text-xl">
                HOÀI NGUYỆT CÁC
              </span>
              <span className="hidden font-cjk text-xs text-amber-500/70 sm:inline">懷月閣</span>
            </div>
            <p className="hidden text-[10px] tracking-wider text-stone-400 md:block">
              Nhất phiến cố nguyệt · Vạn cổ nhân duyên
            </p>
          </div>
        </div>

        {/* Account controls: the user identity only exists for a signed-in session. */}
        <div className="flex items-center gap-2 sm:gap-3">
          {authenticatedUser ? (
            <button
              onClick={() => navigateTo('/menh-ban')}
              className="flex items-center gap-2 rounded-full border border-amber-900/40 bg-slate-900/90 px-3 py-1 text-xs text-amber-200 transition hover:border-amber-500/60"
              title={`Mở lá số tự an theo hồ sơ của ${authenticatedUser.name}`}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="max-w-[150px] truncate font-medium">{authenticatedUser.name}</span>
            </button>
          ) : null}
          <AccountLogin />

          {/* Quick links to Profile & Settings */}
          {authenticatedUser && <button
            onClick={() => navigateTo('/ho-so')}
            className={`rounded-full p-2 text-stone-300 transition hover:bg-slate-800 hover:text-amber-200 ${
              currentRoute === '/ho-so' ? 'bg-amber-500/20 text-amber-200' : ''
            }`}
            aria-label="Hồ sơ & Ghi chép"
            title="Hồ sơ & Ghi chép"
          >
            <User size={16} />
          </button>}

          <button
            onClick={() => navigateTo('/cai-dat')}
            className={`hidden rounded-full p-2 text-stone-300 transition hover:bg-slate-800 hover:text-amber-200 sm:block ${
              currentRoute === '/cai-dat' ? 'bg-amber-500/20 text-amber-200' : ''
            }`}
            title="Cài đặt & Quyền riêng tư"
          >
            <Settings size={16} />
          </button>

          {/* Traditional Seal Stamp */}
          <div className="hidden sm:block">
            <SealStamp text="懷月" subtext="欽天" size="sm" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={openFeatureMenu}
            className="rounded-lg p-2 text-slate-200 transition hover:bg-slate-800"
            aria-label="Đi tới menu tính năng"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

    </header>
    </>
  );
};
