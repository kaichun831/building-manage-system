'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Announcements() {
  const [token, setToken] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
  const [form, setForm] = useState({ title: '', content: '' });
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/announcements').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnnouncements(data);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/announcements', { method: 'POST', headers: authHeaders, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements([data, ...announcements]);
      setForm({ title: '', content: '' });
      setShowForm(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/announcements/${editing.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ title: editing.title, content: editing.content }) });
    if (res.ok) {
      setAnnouncements(announcements.map(a => a.id === editing.id ? { ...a, ...editing } : a));
      setEditing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此公告？')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE', headers: authHeaders });
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">公告管理</h1>
          {token && (
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {showForm ? '取消' : '新增公告'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6">
            <input type="text" placeholder="公告標題" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 mb-3 border rounded text-gray-800" required />
            <textarea placeholder="公告內容" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full p-2 mb-3 border rounded h-28 text-gray-800" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">發布公告</button>
          </form>
        )}

        <div className="space-y-4">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="bg-white p-5 rounded-lg shadow">
              {editing?.id === ann.id ? (
                <form onSubmit={handleUpdate}>
                  <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                    className="w-full p-2 mb-2 border rounded text-gray-800" />
                  <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })}
                    className="w-full p-2 mb-2 border rounded h-24 text-gray-800" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm">儲存</button>
                    <button type="button" onClick={() => setEditing(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">取消</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{ann.title}</h3>
                    <span className="text-xs text-gray-400">{ann.createdAt?.seconds ? new Date(ann.createdAt.seconds * 1000).toLocaleDateString('zh-TW') : ''}</span>
                  </div>
                  <p className="text-gray-600 mb-3 whitespace-pre-wrap">{ann.content}</p>
                  {token && (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(ann)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">編輯</button>
                      <button onClick={() => handleDelete(ann.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">刪除</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
