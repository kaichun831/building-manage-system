'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) { setEmail(saved); setRemember(true); }
    fetch('/api/announcements').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnnouncements(data.slice(0, 10));
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg(''); setResetError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail })
    });
    const data = await res.json();
    if (res.ok) setResetMsg(data.message);
    else setResetError(data.error || '操作失敗');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (remember) localStorage.setItem('rememberedEmail', email);
        else localStorage.removeItem('rememberedEmail');
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch { setError('網路錯誤，請稍後再試'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-lg">大廈管理系統</span>
        <Link href="/register" className="text-sm bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50">住戶註冊</Link>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full p-6 gap-8 items-center">
        {/* 登入表單 */}
        <div className="w-full md:w-96 flex-shrink-0">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">住戶登入</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <input type="text" placeholder="電子信箱" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-gray-800" required disabled={loading} />
            <input type="password" placeholder="密碼" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-gray-800" required disabled={loading} />
            <label className="flex items-center gap-2 mb-4 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4" />
              記住帳號
            </label>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? '登入中...' : '登入'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              尚未註冊？<Link href="/register" className="text-blue-600 hover:underline">立即註冊</Link>
            </p>
            <p className="text-center text-sm mt-2">
              <button type="button" onClick={() => { setShowReset(true); setResetMsg(''); setResetError(''); }}
                className="text-gray-400 hover:text-blue-600 hover:underline">忘記密碼？</button>
            </p>
          </form>
        </div>

        {/* 公告區 */}
        <div className="flex-1 hidden md:flex flex-col self-stretch justify-center">
          <div className="bg-white rounded-lg shadow p-5 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-700 mb-3">最新公告</h2>
            {announcements.length === 0
              ? <p className="text-gray-400 text-sm">目前無公告</p>
              : <ul className="flex-1 divide-y divide-gray-100 overflow-auto">
                  {announcements.map((a: any) => (
                    <li key={a.id} className="py-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-gray-800 text-sm">{a.title}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                          {a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('zh-TW') : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.content}</p>
                    </li>
                  ))}
                </ul>
            }
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link href="/announcements" className="text-sm text-blue-600 hover:underline">更多公告 →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 忘記密碼彈窗 */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">忘記密碼</h2>
              <button onClick={() => setShowReset(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {resetMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{resetMsg}</div>}
            {resetError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{resetError}</div>}
            <form onSubmit={handleReset} className="space-y-3">
              <input type="text" placeholder="註冊的電子信箱" value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full p-2 border rounded text-gray-800" required />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">發送重設信件</button>
                <button type="button" onClick={() => setShowReset(false)}
                  className="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
