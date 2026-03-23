'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('連結無效，請重新申請密碼重設');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    if (newPassword !== confirm) { setError('兩次密碼不一致'); return; }
    if (newPassword.length < 6) { setError('密碼至少需要 6 個字元'); return; }

    setLoading(true);
    const res = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg(data.message);
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(data.error || '操作失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">重設密碼</h1>

        {msg && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {msg}
            <p className="mt-1 text-green-600">3 秒後自動跳轉至登入頁...</p>
          </div>
        )}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {!done && token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">新密碼</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded text-gray-800" required minLength={6} />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">確認新密碼</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full p-2 border rounded text-gray-800" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? '處理中...' : '確認重設密碼'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/login" className="text-blue-600 hover:underline">返回登入</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
