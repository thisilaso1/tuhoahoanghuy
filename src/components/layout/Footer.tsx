import React from 'react';
import { useApp } from '../../context/AppContext';
import { SealStamp } from '../common/SealStamp';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="mt-20 border-t border-amber-900/20 bg-slate-950 py-12 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <SealStamp text="懷月閣" subtext="欽天" size="md" />
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-200">HOÀI NGUYỆT CÁC</h3>
                <p className="font-cjk text-xs text-amber-500/70">Moonlit Pavilion · Classical Divination 2026</p>
              </div>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-stone-400">
              Công cụ tiện ích phục vụ cộng đồng học thuật huyền học, góp phần gìn giữ và phát triển tinh hoa trí tuệ cổ nhân. Hoài Nguyệt Các khuyến khích bạn đóng góp ý tưởng để chúng tôi tiếp tục hoàn thiện sản phẩm.
            </p>
            <blockquote className="border-l-2 border-amber-600/40 pl-3 text-xs italic text-amber-300/80">
              "Nguyệt hữu âm tình viên khuyết. Nhân sinh tự hữu định số."
            </blockquote>
          </div>

          {/* Core Modules Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Không Gian Học Thuật</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/menh-ban')} className="hover:text-amber-200 transition">
                  12 Cung Mệnh Bàn
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/tu-hoa')} className="hover:text-amber-200 transition">
                  Khâm Thiên Tứ Hóa & Phi Tinh
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/kinh-dich')} className="hover:text-amber-200 transition">
                  Kinh Dịch Lục Hào Bốc Quẻ
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/van-han')} className="hover:text-amber-200 transition">
                  Vận Trình 2026–2027
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/thu-cac')} className="hover:text-amber-200 transition">
                  Thư Các Cổ Điển
                </button>
              </li>
            </ul>
          </div>

          {/* AI & Philosophy Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Triết Lý & Quyền Riêng Tư</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/thien-co')} className="hover:text-amber-200 transition">
                  AI Thiên Cơ Copilot
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/cai-dat')} className="hover:text-amber-200 transition">
                  Cấu Hình API Key & Môn Phái
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/ho-so')} className="hover:text-amber-200 transition">
                  Bảo Mật Dữ Liệu Bản Mệnh
                </button>
              </li>
              <li className="pt-2 text-[11px] text-stone-500">
                Toán thuật tất định vận hành 100% trên thiết bị của bạn.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-900 pt-6 text-[11px] text-stone-500 sm:flex-row">
          <p>© 2026 Hoài Nguyệt Các (懷月閣). Tất cả bản quyền được bảo lưu.</p>
          <p className="mt-2 sm:mt-0">Độc bản học thuật · Không mang tính chất mê tín dị đoan.</p>
        </div>
      </div>
    </footer>
  );
};
