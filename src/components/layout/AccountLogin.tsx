import { useEffect, useState } from 'react';
import { useApp, type AuthenticatedUserProfile } from '../../context/AppContext';

export function AccountLogin() {
  const { authenticatedUser, setAuthenticatedUser, navigateTo } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/me', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const { user }: { user: AuthenticatedUserProfile } = await response.json();
        if (!controller.signal.aborted) setAuthenticatedUser(user);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [setAuthenticatedUser]);

  async function logout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      setAuthenticatedUser(null);
    } catch {
      setError('Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return authenticatedUser ? (
    <div className="text-xs text-amber-200">
      <button type="button" onClick={logout} disabled={busy}>Đăng xuất</button>
      {error && <p role="alert" className="text-red-300">{error}</p>}
    </div>
  ) : (
    <button type="button" className="rounded-full border border-amber-900/40 px-3 py-1 text-xs text-amber-200"
      onClick={() => navigateTo('/dang-nhap')}>
      Đăng nhập
    </button>
  );
}
