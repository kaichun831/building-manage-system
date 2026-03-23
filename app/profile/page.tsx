'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

export default function Profile() {
  const { token, authHeaders, userId } = useAuth();
  const [info, setInfo] = useState({ name: '', unit: '', email: '' });
  const [infoMsg, setInfoMsg] = useState('');
  const [infoError, setInfoError] = useState('');
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (!token || !userId) return;
    fetch('/api/members', { headers: authHeaders }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const me = data.find((u: any) => u.id === userId);
        if (me) setInfo({ name: me.name || '', unit: me.unit || '', email: me.email || '' });
      }
    });
  }, [token, userId]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(''); setInfoError('');
    const res = await fetch(`/api/members/${userId}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ name: info.name, unit: info.unit })
    });
    if (res.ok) setInfoMsg('個人資料已更新');
    else { const d = await res.json(); setInfoError(d.error || '更新失敗'); }
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(''); setPwdError('');
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdError('兩次密碼不一致'); return; }
    if (pwdForm.newPassword.length < 6) { setPwdError('密碼至少需要 6 個字元'); return; }
    const res = await fetch('/api/auth/password', {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ newPassword: pwdForm.newPassword })
    });
    if (res.ok) { setPwdMsg('密碼已成功更新'); setPwdForm({ newPassword: '', confirm: '' }); }
    else { const d = await res.json(); setPwdError(d.error || '更新失敗'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">個人設定</h1>

        {/* 個人資訊 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">個人資料</h2>
          {infoMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{infoMsg}</div>}
          {infoError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{infoError}</div>}
          <form onSubmit={handleInfoSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">電子信箱</label>
              <input value={info.email} disabled
                className="w-full p-2 border rounded text-gray-400 bg-gray-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">姓名</label>
              <input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })}
                className="w-full p-2 border rounded text-gray-800" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">門牌號碼</label>
              <input value={info.unit} onChange={e => setInfo({ ...info, unit: e.target.value })}
                className="w-full p-2 border rounded text-gray-800" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">儲存資料</button>
          </form>
        </div>

        {/* 修改密碼 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">修改密碼</h2>
          {pwdMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{pwdMsg}</div>}
          {pwdError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{pwdError}</div>}
          <form onSubmit={handlePwdSubmit} className="space-y-3">
            <input type="password" placeholder="新密碼" value={pwdForm.newPassword}
              onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              className="w-full p-2 border rounded text-gray-800" required />
            <input type="password" placeholder="確認新密碼" value={pwdForm.confirm}
              onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              className="w-full p-2 border rounded text-gray-800" required />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">更新密碼</button>
          </form>
        </div>
      </div>
    </div>
  );
}
