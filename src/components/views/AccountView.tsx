import { useState, type FormEvent } from 'react';
import { ArrowRight, Moon } from 'lucide-react';
import { useApp, type AuthenticatedUserProfile } from '../../context/AppContext';

const GOOGLE_ERRORS: Record<string, string> = {
  unconfigured: 'Đăng nhập Google chưa được cấu hình.',
  cancelled: 'Bạn đã hủy đăng nhập Google.',
  failed: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
};

export function AccountView({ mode }: { mode: 'login' | 'register' }) {
  const { currentRoute, navigateTo, setAuthenticatedUser, authenticatedUser } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => {
    const status = new URLSearchParams(window.location.search).get('google');
    return status && Object.hasOwn(GOOGLE_ERRORS, status) ? GOOGLE_ERRORS[status] : '';
  });
  const registering = mode === 'register';
  const title = registering ? 'Đăng ký' : 'Đăng nhập';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      if (response.status === 401) {
        setError('Email hoặc mật khẩu không đúng.');
        return;
      }
      if (response.status === 409) {
        setError('Email này đã có tài khoản. Bạn có thể chuyển sang trang đăng nhập.');
        return;
      }
      if (response.status === 400) {
        setError('Vui lòng kiểm tra lại thông tin tài khoản.');
        return;
      }
      if (!response.ok) throw new Error();
      const { user }: { user: AuthenticatedUserProfile } = await response.json();
      setAuthenticatedUser(user);
      if (currentRoute !== '/ho-so') navigateTo('/');
    } catch {
      setError(registering ? 'Không thể đăng ký. Vui lòng thử lại.' : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="landing-page is-night">
    <section className="landing-hero" aria-labelledby="account-title">
      <div className="landing-sky" aria-hidden="true">
        <div className="landing-sky-gradient" />
        <div className="landing-stars-field" />
        <div className="landing-pavilion" />
        <div className="landing-mist-layer" />
      </div>
      <div className="landing-hero-content">
        <p className="landing-eyebrow">HOÀI NGUYỆT CÁC</p>
        <div className="mx-auto mt-5 w-full max-w-md text-left">
          <form onSubmit={submit} className="chart-create-form">
            <div>
              <Moon aria-hidden="true" size={20} className="mb-2 text-sky-200" />
              <h2 id="account-title" className="font-serif text-3xl text-slate-100">{title}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {authenticatedUser ? `Bạn đang đăng nhập với tên ${authenticatedUser.name}.` : registering
                  ? 'Tạo tài khoản Hoài Nguyệt Các để mở các tính năng dành cho thành viên.'
                  : 'Mở lại các tính năng dành cho thành viên Hoài Nguyệt Các.'}
              </p>
            </div>
            {authenticatedUser ? <button type="button" className="chart-create-submit" onClick={() => navigateTo('/')}>Về trang chủ</button> : <>
              {registering && <div>
                <label htmlFor="account-name">Họ và tên</label>
                <input id="account-name" name="name" autoComplete="name" required maxLength={120} className="w-full px-3" />
              </div>}
              <div>
                <label htmlFor="account-email">Email</label>
                <input id="account-email" name="email" type="email" autoComplete="username" required maxLength={254} className="w-full px-3" />
              </div>
              <div>
                <label htmlFor="account-password">Mật khẩu</label>
                <input id="account-password" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'}
                  required minLength={registering ? 12 : undefined} maxLength={256}
                  placeholder={registering ? 'Tối thiểu 12 ký tự' : undefined} className="w-full px-3" />
              </div>
              {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
              <button type="submit" disabled={busy} className="chart-create-submit disabled:opacity-60">
                {busy ? 'Đang xử lý…' : title}<ArrowRight size={16} />
              </button>
              <a href="/api/auth/google"
                className="flex min-h-11 items-center justify-center rounded-xl border border-slate-500 bg-slate-950/60 px-4 text-sm font-semibold text-slate-100 hover:border-sky-200 focus-visible:outline focus-visible:outline-sky-200">
                Tiếp tục với Google
              </a>
              <p className="text-center text-sm text-slate-300">
                {registering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
                <button type="button" className="font-semibold text-sky-200 underline underline-offset-4"
                  onClick={() => navigateTo(registering ? '/dang-nhap' : '/dang-ky')}>
                  {registering ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              </p>
            </>}
          </form>
        </div>
      </div>
    </section>
  </div>;
}
