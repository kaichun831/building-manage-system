'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

export default function Members() {
  const { token, authHeaders, isAdmin, userId } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [chairmen, setChairmen] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ memberId: '', startDate: '', endDate: '' });
  const [editingChairman, setEditingChairman] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    fetch('/api/members', { headers: authHeaders }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMembers(data);
    });
    fetch('/api/chairman').then(r => r.json()).then(data => {
      setChairmen(Array.isArray(data) ? data : data ? [data] : []);
    });
  }, [token]);

  const formatDate = (d: any) => {
    if (!d) return '';
    const date = d?.seconds ? new Date(d.seconds * 1000) : new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('zh-TW');
  };

  const toDateInput = (d: any) => {
    if (!d) return '';
    const date = d?.seconds ? new Date(d.seconds * 1000) : new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const current = chairmen.find(c => {
    const now = Date.now();
    const start = c.startDate?.seconds ? c.startDate.seconds * 1000 : new Date(c.startDate).getTime();
    const end = c.endDate?.seconds ? c.endDate.seconds * 1000 : new Date(c.endDate).getTime();
    return now >= start && now <= end;
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === assignForm.memberId);
    if (!member) return;
    const res = await fetch('/api/chairman', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ name: member.name, startDate: assignForm.startDate, endDate: assignForm.endDate })
    });
    if (res.ok) {
      const data = await res.json();
      setChairmen([...chairmen, data]);
      setAssignForm({ memberId: '', startDate: '', endDate: '' });
      setShowAssign(false);
    }
  };

  const handleUpdateChairman = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/chairman/${editingChairman.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ name: editingChairman.name, startDate: editingChairman.startDate, endDate: editingChairman.endDate })
    });
    if (res.ok) {
      setChairmen(chairmen.map(c => c.id === editingChairman.id ? { ...c, ...editingChairman } : c));
      setEditingChairman(null);
    }
  };

  const handleDeleteChairman = async (id: string) => {
    if (!confirm('確定移除此主委紀錄？')) return;
    await fetch(`/api/chairman/${id}`, { method: 'DELETE', headers: authHeaders });
    setChairmen(chairmen.filter(c => c.id !== id));
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('確定刪除此住戶？此操作無法復原。')) return;
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) setMembers(members.filter(m => m.id !== id));
    else { const err = await res.json(); alert(err.error || '操作失敗'); }
  };

  // 自己置頂
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === userId) return -1;
    if (b.id === userId) return 1;
    return 0;
  });

  const filtered = sortedMembers.filter(m =>
    !search || m.name?.includes(search) || m.unit?.includes(search) || m.email?.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* 主委委任區塊 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">主委管理</h2>
            {isAdmin && (
              <button onClick={() => setShowAssign(!showAssign)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                {showAssign ? '取消' : '委任主委'}
              </button>
            )}
          </div>

          {current && (
            <div className="bg-blue-600 text-white p-5 rounded-lg mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {current.name[0]}
              </div>
              <div>
                <p className="text-sm opacity-80">現任主委</p>
                <p className="text-xl font-bold">{current.name}</p>
                <p className="text-sm opacity-80">任期：{formatDate(current.startDate)} ～ {formatDate(current.endDate)}</p>
              </div>
            </div>
          )}

          {showAssign && isAdmin && (
            <form onSubmit={handleAssign} className="bg-white p-5 rounded-lg shadow mb-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">選擇住戶</label>
                <select value={assignForm.memberId} onChange={e => setAssignForm({ ...assignForm, memberId: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" required>
                  <option value="">-- 請選擇住戶 --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}（{m.unit}）</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">任期開始</label>
                  <input type="date" value={assignForm.startDate} onChange={e => setAssignForm({ ...assignForm, startDate: e.target.value })}
                    className="w-full p-2 border rounded text-gray-800" required />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">任期結束</label>
                  <input type="date" value={assignForm.endDate} onChange={e => setAssignForm({ ...assignForm, endDate: e.target.value })}
                    className="w-full p-2 border rounded text-gray-800" required />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">確認委任</button>
            </form>
          )}

          {chairmen.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-gray-700">姓名</th>
                    <th className="p-3 text-left text-gray-700">任期開始</th>
                    <th className="p-3 text-left text-gray-700">任期結束</th>
                    <th className="p-3 text-left text-gray-700">狀態</th>
                    {isAdmin && <th className="p-3 text-center text-gray-700">操作</th>}
                  </tr>
                </thead>
                <tbody>
                  {chairmen.map((c: any) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      {editingChairman?.id === c.id ? (
                        <td colSpan={isAdmin ? 5 : 4} className="p-3">
                          <form onSubmit={handleUpdateChairman} className="flex gap-2 flex-wrap items-center">
                            <input value={editingChairman.name} onChange={e => setEditingChairman({ ...editingChairman, name: e.target.value })}
                              className="p-1 border rounded text-gray-800 text-sm w-24" />
                            <input type="date" value={editingChairman.startDate} onChange={e => setEditingChairman({ ...editingChairman, startDate: e.target.value })}
                              className="p-1 border rounded text-gray-800 text-sm" />
                            <input type="date" value={editingChairman.endDate} onChange={e => setEditingChairman({ ...editingChairman, endDate: e.target.value })}
                              className="p-1 border rounded text-gray-800 text-sm" />
                            <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-xs">儲存</button>
                            <button type="button" onClick={() => setEditingChairman(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">取消</button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="p-3 font-medium text-gray-800">{c.name}</td>
                          <td className="p-3 text-gray-600">{formatDate(c.startDate)}</td>
                          <td className="p-3 text-gray-600">{formatDate(c.endDate)}</td>
                          <td className="p-3">
                            {current?.id === c.id
                              ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">現任</span>
                              : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">卸任</span>}
                          </td>
                          {isAdmin && (
                            <td className="p-3 text-center">
                              <button onClick={() => setEditingChairman({ ...c, startDate: toDateInput(c.startDate), endDate: toDateInput(c.endDate) })}
                                className="text-yellow-600 hover:underline mr-2 text-xs">編輯</button>
                              <button onClick={() => handleDeleteChairman(c.id)} className="text-red-600 hover:underline text-xs">移除</button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 住戶列表 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">住戶成員</h2>
            <span className="text-sm text-gray-500">共 {members.length} 位住戶</span>
          </div>
          <input type="text" placeholder="搜尋姓名、門牌、信箱..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 text-gray-800 shadow-sm" />
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-gray-700">姓名</th>
                  <th className="p-3 text-left text-gray-700">門牌號碼</th>
                  <th className="p-3 text-left text-gray-700">電子信箱</th>
                  <th className="p-3 text-left text-gray-700">身份</th>
                  <th className="p-3 text-left text-gray-700">加入日期</th>
                  <th className="p-3 text-center text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m: any) => {
                  const isChairman = current?.name === m.name;
                  const isSelf = m.id === userId;
                  return (
                    <tr key={m.id} className={`border-t hover:bg-gray-50 ${isSelf ? 'bg-yellow-50' : isChairman ? 'bg-blue-50' : ''}`}>
                      <td className="p-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {m.name}
                          {isSelf && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">我</span>}
                          {isChairman && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">主委</span>}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{m.unit}</td>
                      <td className="p-3 text-gray-600">{m.email}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${m.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {m.role === 'admin' ? '管理員' : '住戶'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleDateString('zh-TW') : ''}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        {isSelf && (
                          <button onClick={() => router.push('/profile')} className="text-blue-600 hover:underline text-xs">編輯資料</button>
                        )}
                        {isAdmin && !isSelf && (
                          <button onClick={() => handleDeleteMember(m.id)} className="text-red-600 hover:underline text-xs">刪除</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">無符合的住戶</p>}
          </div>
        </section>

      </div>
    </div>
  );
}
