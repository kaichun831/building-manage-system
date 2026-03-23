'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const CATEGORIES = ['管理費', '修繕費', '清潔費', '保全費', '水電費', '其他'];

async function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.src = url;
  });
}

const formatDate = (d: any) => {
  if (!d) return '';
  // Firestore Timestamp
  if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString('zh-TW');
  // YYYY-MM-DD string (date input value)
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('zh-TW');
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('zh-TW');
};

export default function Finance() {
  const { authHeaders, token, isAdmin } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState({ date: '', category: '管理費', amount: '', description: '' });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewImg, setViewImg] = useState('');
  const [voidTarget, setVoidTarget] = useState<any>(null);
  const [voidReason, setVoidReason] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/finance').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setRecords(data);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setReceiptFile(compressed);
    setReceiptPreview(URL.createObjectURL(compressed));
  };

  const uploadReceipt = async (): Promise<string> => {
    if (!receiptFile) return '';
    const fd = new FormData();
    fd.append('file', receiptFile);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    if (!res.ok) throw new Error('上傳失敗');
    const { url } = await res.json();
    return url;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const receipt = await uploadReceipt();
      const res = await fetch('/api/finance', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ ...form, amount: Number(form.amount), receipt })
      });
      if (res.ok) {
        const data = await res.json();
        setRecords([data, ...records]);
        setForm({ date: '', category: '管理費', amount: '', description: '' });
        setReceiptFile(null); setReceiptPreview(''); setShowForm(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch { alert('新增失敗，請稍後再試'); }
    setUploading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/finance/${editing.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ category: editing.category, amount: Number(editing.amount), description: editing.description })
    });
    if (res.ok) {
      setRecords(records.map(r => r.id === editing.id ? { ...r, ...editing } : r));
      setEditing(null);
    } else {
      const err = await res.json();
      alert(err.error || '操作失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此紀錄？')) return;
    const res = await fetch(`/api/finance/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) setRecords(records.filter(r => r.id !== id));
    else { const err = await res.json(); alert(err.error || '操作失敗'); }
  };

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidReason.trim()) return;
    const res = await fetch(`/api/finance/${voidTarget.id}`, {
      method: 'PATCH', headers: authHeaders,
      body: JSON.stringify({ reason: voidReason })
    });
    if (res.ok) {
      setRecords(records.map(r => r.id === voidTarget.id ? { ...r, voided: true, voidReason } : r));
      setVoidTarget(null); setVoidReason('');
    } else {
      const err = await res.json(); alert(err.error || '操作失敗');
    }
  };

  const active = records.filter(r => !r.voided);
  const total = active.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const byCategory = CATEGORIES.map(cat => ({
    cat, total: active.filter(r => r.category === cat).reduce((s, r) => s + (Number(r.amount) || 0), 0)
  })).filter(c => c.total > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">財務管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {showForm ? '取消' : '新增紀錄'}
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow col-span-2 md:col-span-1">
            <p className="text-sm text-gray-500">總支出（有效）</p>
            <p className="text-2xl font-bold text-red-600">NT$ {total.toLocaleString()}</p>
          </div>
          {byCategory.map(c => (
            <div key={c.cat} className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">{c.cat}</p>
              <p className="text-lg font-semibold text-gray-800">NT$ {c.total.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* 新增表單 */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="p-2 border rounded text-gray-800" required />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="p-2 border rounded text-gray-800">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <input type="number" placeholder="金額" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full p-2 border rounded text-gray-800" required />
            <input type="text" placeholder="說明" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded text-gray-800" />
            <div>
              <label className="text-sm text-gray-600 block mb-1">收據圖片（選填，自動壓縮）</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {receiptPreview && (
                <div className="mt-2 relative inline-block">
                  <img src={receiptPreview} alt="預覽" className="h-28 rounded border object-cover" />
                  <button type="button" onClick={() => { setReceiptFile(null); setReceiptPreview(''); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              )}
            </div>
            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
              {uploading ? '上傳中...' : '新增'}
            </button>
          </form>
        )}

        {/* 作廢彈窗 */}
        {voidTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">作廢紀錄</h2>
              <p className="text-sm text-gray-500 mb-4">{voidTarget.description}（NT$ {Number(voidTarget.amount).toLocaleString()}）</p>
              <form onSubmit={handleVoid} className="space-y-3">
                <textarea placeholder="請填寫作廢原因（必填）" value={voidReason} onChange={e => setVoidReason(e.target.value)}
                  className="w-full p-2 border rounded text-gray-800 h-24" required />
                <div className="flex gap-2">
                  <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">確認作廢</button>
                  <button type="button" onClick={() => { setVoidTarget(null); setVoidReason(''); }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 紀錄列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-gray-700">日期</th>
                <th className="p-3 text-left text-gray-700">類別</th>
                <th className="p-3 text-left text-gray-700">說明</th>
                <th className="p-3 text-right text-gray-700">金額</th>
                <th className="p-3 text-center text-gray-700">收據</th>
                {isAdmin && <th className="p-3 text-center text-gray-700">操作</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} className={`border-t hover:bg-gray-50 ${r.voided ? 'opacity-50' : ''}`}>
                  {editing?.id === r.id ? (
                    <td colSpan={isAdmin ? 6 : 5} className="p-3">
                      <form onSubmit={handleUpdate} className="flex gap-2 flex-wrap">
                        <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                          className="p-1 border rounded text-gray-800 text-sm">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <input value={editing.amount} onChange={e => setEditing({ ...editing, amount: e.target.value })}
                          className="p-1 border rounded w-24 text-gray-800 text-sm" type="number" />
                        <input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}
                          className="p-1 border rounded flex-1 text-gray-800 text-sm" />
                        <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-sm">儲存</button>
                        <button type="button" onClick={() => setEditing(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-sm">取消</button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="p-3 text-gray-600">{formatDate(r.date)}</td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.category}</span>
                        {r.voided && <span className="ml-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">作廢</span>}
                      </td>
                      <td className="p-3 text-gray-600">
                        {r.description}
                        {r.voided && r.voidReason && <span className="block text-xs text-red-500">原因：{r.voidReason}</span>}
                      </td>
                      <td className="p-3 text-right font-medium text-red-600">NT$ {Number(r.amount).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {r.receipt
                          ? <button onClick={() => setViewImg(r.receipt)} className="text-blue-600 hover:underline text-xs">查看</button>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-center space-x-1">
                          {!r.voided && (
                            <>
                              <button onClick={() => setEditing(r)} className="text-yellow-600 hover:underline text-xs">編輯</button>
                              <button onClick={() => setVoidTarget(r)} className="text-orange-500 hover:underline text-xs">作廢</button>
                              <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline text-xs">刪除</button>
                            </>
                          )}
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="text-center text-gray-400 py-8">尚無財務紀錄</p>}
        </div>
      </div>

      {viewImg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setViewImg('')}>
          <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={viewImg} alt="收據" className="w-full rounded-lg shadow-xl" />
            <button onClick={() => setViewImg('')} className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow text-lg">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
