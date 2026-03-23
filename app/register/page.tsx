'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', unit: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || '註冊失敗');
      }
    } catch (err) {
      setError('網路錯誤，請稍後再試');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">註冊</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="姓名"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full p-2 mb-4 border rounded text-gray-800"
          required
          disabled={loading}
        />
        <input
          type="text"
          placeholder="門牌號碼"
          value={form.unit}
          onChange={(e) => setForm({...form, unit: e.target.value})}
          className="w-full p-2 mb-4 border rounded text-gray-800"
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="電子信箱"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          className="w-full p-2 mb-4 border rounded text-gray-800"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="密碼"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          className="w-full p-2 mb-4 border rounded text-gray-800"
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? '註冊中...' : '註冊'}
        </button>
      </form>
    </div>
  );
}
