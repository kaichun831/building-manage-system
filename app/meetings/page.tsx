'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

export default function Meetings() {
  const { authHeaders } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', agenda: '', minutes: '', attendees: [] as string[] });
  const [editing, setEditing] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/meetings').then(r => r.json()).then(setMeetings);
  }, []);

  useEffect(() => {
    if (Object.keys(authHeaders).length === 0) return;
    fetch('/api/members', { headers: authHeaders }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMembers(data);
    });
  }, [authHeaders]);

  const toggleAttendee = (name: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(name) ? list.filter(n => n !== name) : [...list, name]);
  };

  const selectAll = (list: string[], setter: (v: string[]) => void) => {
    setter(list.length === members.length ? [] : members.map(m => m.name));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/meetings', { method: 'POST', headers: authHeaders, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setMeetings([data, ...meetings]);
      setForm({ title: '', date: '', agenda: '', minutes: '', attendees: [] });
      setShowModal(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/meetings/${editing.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: editing.title, agenda: editing.agenda, minutes: editing.minutes, attendees: editing.attendees })
    });
    if (res.ok) {
      setMeetings(meetings.map(m => m.id === editing.id ? { ...m, ...editing } : m));
      setEditing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此會議紀錄？')) return;
    await fetch(`/api/meetings/${id}`, { method: 'DELETE', headers: authHeaders });
    setMeetings(meetings.filter(m => m.id !== id));
  };

  const formatDate = (d: any) =>
    d?.seconds ? new Date(d.seconds * 1000).toLocaleDateString('zh-TW') : d ? new Date(d).toLocaleDateString('zh-TW') : '';

  const AttendeeSelector = ({ list, setter }: { list: string[], setter: (v: string[]) => void }) => (
    <div>
      <label className="text-sm text-gray-600 block mb-1">出席者</label>
      <div className="border rounded p-2 max-h-36 overflow-y-auto space-y-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-600">
          <input type="checkbox" checked={list.length === members.length && members.length > 0}
            onChange={() => selectAll(list, setter)} />
          全選（ALL）
        </label>
        {members.map(m => (
          <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={list.includes(m.name)} onChange={() => toggleAttendee(m.name, list, setter)} />
            {m.name}（{m.unit}）
          </label>
        ))}
      </div>
      {list.length > 0 && <p className="text-xs text-gray-500 mt-1">已選 {list.length} 人：{list.join('、')}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">會議紀錄</h1>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">新增會議</button>
        </div>

        {/* 新增彈窗 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800">新增會議</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-3">
                <input type="text" placeholder="會議標題" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" required />
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" required />
                <textarea placeholder="會議議程" value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })}
                  className="w-full p-2 border rounded h-20 text-gray-800" />
                <textarea placeholder="會議紀錄" value={form.minutes} onChange={e => setForm({ ...form, minutes: e.target.value })}
                  className="w-full p-2 border rounded h-20 text-gray-800" />
                <AttendeeSelector list={form.attendees} setter={v => setForm({ ...form, attendees: v })} />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">建立</button>
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 編輯彈窗 */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800">編輯會議</h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleUpdate} className="p-5 space-y-3">
                <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full p-2 border rounded text-gray-800" />
                <textarea value={editing.agenda} onChange={e => setEditing({ ...editing, agenda: e.target.value })}
                  className="w-full p-2 border rounded h-16 text-gray-800" placeholder="議程" />
                <textarea value={editing.minutes} onChange={e => setEditing({ ...editing, minutes: e.target.value })}
                  className="w-full p-2 border rounded h-16 text-gray-800" placeholder="紀錄" />
                <AttendeeSelector
                  list={Array.isArray(editing.attendees) ? editing.attendees : []}
                  setter={v => setEditing({ ...editing, attendees: v })} />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">儲存</button>
                  <button type="button" onClick={() => setEditing(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 會議列表 */}
        <div className="space-y-4">
          {meetings.map((m: any) => {
            const attendees = Array.isArray(m.attendees) ? m.attendees : [];
            return (
              <div key={m.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                      <h3 className="text-lg font-semibold text-gray-800">{m.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(m.date)}</p>
                      {/* 出席者直接顯示 */}
                      {attendees.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {attendees.map((a: string) => (
                            <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => setEditing({ ...m, attendees: Array.isArray(m.attendees) ? m.attendees : [] })}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">編輯</button>
                      <button onClick={() => handleDelete(m.id)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">刪除</button>
                      <span className="text-gray-400 text-sm cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                        {expanded === m.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {expanded === m.id && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {m.agenda && <div><span className="font-medium text-gray-700 text-sm">議程：</span><p className="text-gray-600 text-sm whitespace-pre-wrap">{m.agenda}</p></div>}
                      {m.minutes && <div><span className="font-medium text-gray-700 text-sm">紀錄：</span><p className="text-gray-600 text-sm whitespace-pre-wrap">{m.minutes}</p></div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {meetings.length === 0 && <p className="text-center text-gray-400 py-8">尚無會議紀錄</p>}
        </div>
      </div>
    </div>
  );
}
