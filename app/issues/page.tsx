'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const STATUS_MAP: Record<string, string> = { pending: '待處理', 'in-progress': '處理中', resolved: '已解決' };
const STATUS_COLOR: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', 'in-progress': 'bg-blue-100 text-blue-800', resolved: 'bg-green-100 text-green-800' };
const CATEGORIES = ['公共設施', '環境衛生', '安全問題', '噪音問題', '停車問題', '財務相關', '其他'];
const CAT_COLOR: Record<string, string> = {
  '公共設施': 'bg-blue-100 text-blue-700',
  '環境衛生': 'bg-green-100 text-green-700',
  '安全問題': 'bg-red-100 text-red-700',
  '噪音問題': 'bg-orange-100 text-orange-700',
  '停車問題': 'bg-purple-100 text-purple-700',
  '財務相關': 'bg-yellow-100 text-yellow-700',
  '其他': 'bg-gray-100 text-gray-600',
};

export default function Issues() {
  const { authHeaders, isAdmin } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '其他' });
  const [editing, setEditing] = useState<any>(null);
  const [filterCat, setFilterCat] = useState('全部');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/issues').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setIssues(data);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/issues', { method: 'POST', headers: authHeaders, body: JSON.stringify(form) });
    if (res.ok) {
      const newIssue = await res.json();
      setIssues([newIssue, ...issues]);
      setForm({ title: '', description: '', category: '其他' });
      setShowModal(false);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/issues/${editing.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: editing.title, description: editing.description, category: editing.category })
    });
    if (res.ok) {
      setIssues(issues.map(i => i.id === editing.id ? { ...i, ...editing } : i));
      setEditing(null);
    } else {
      const err = await res.json(); alert(err.error || '操作失敗');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/issues/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ status }) });
    if (res.ok) setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
    else { const err = await res.json(); alert(err.error || '操作失敗'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此議題？')) return;
    const res = await fetch(`/api/issues/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) setIssues(issues.filter(i => i.id !== id));
    else { const err = await res.json(); alert(err.error || '操作失敗'); }
  };

  const filtered = filterCat === '全部' ? issues : issues.filter(i => (i.category || '其他') === filterCat);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">議題管理</h1>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ＋ 提出新議題
          </button>
        </div>

        {/* 分類篩選 */}
        <div className="flex gap-2 flex-wrap mb-5">
          {['全部', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition ${filterCat === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 新增彈窗 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800">提出新議題</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">議題分類</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 border rounded text-gray-800">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="議題標題" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" required />
                <textarea placeholder="議題描述" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border rounded h-28 text-gray-800" required />
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? '提交中...' : '提交'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 編輯彈窗 */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800">編輯議題</h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleUpdate} className="p-5 space-y-3">
                <select value={editing.category || '其他'} onChange={e => setEditing({ ...editing, category: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" />
                <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}
                  className="w-full p-2 border rounded h-24 text-gray-800" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">儲存</button>
                  <button type="button" onClick={() => setEditing(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 議題列表 */}
        <div className="space-y-4">
          {filtered.map((issue: any) => (
            <div key={issue.id} className="bg-white p-5 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
                  {issue.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLOR[issue.category] || CAT_COLOR['其他']}`}>
                      {issue.category}
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${STATUS_COLOR[issue.status]}`}>
                  {STATUS_MAP[issue.status]}
                </span>
              </div>
              <p className="text-gray-600 mb-3 text-sm">{issue.description}</p>
              <div className="flex gap-2 flex-wrap">
                {isAdmin && (
                  <select value={issue.status} onChange={e => handleStatusChange(issue.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1 text-gray-700">
                    <option value="pending">待處理</option>
                    <option value="in-progress">處理中</option>
                    <option value="resolved">已解決</option>
                  </select>
                )}
                {isAdmin && (
                  <>
                    <button onClick={() => setEditing(issue)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">編輯</button>
                    <button onClick={() => handleDelete(issue.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">刪除</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8">尚無議題</p>}
        </div>
      </div>
    </div>
  );
}
