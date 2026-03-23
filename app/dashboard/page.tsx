'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const CARDS = [
  { href: '/issues', title: '議題管理', desc: '提出問題或建議', icon: '📋' },
  { href: '/meetings', title: '會議紀錄', desc: '查看線上會議紀錄', icon: '📅' },
  { href: '/finance', title: '財務報表', desc: '查看財務支出紀錄', icon: '💰' },
  { href: '/members', title: '住戶成員', desc: '查看所有住戶資訊', icon: '🏠' },
];

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) { window.location.href = '/login'; return; }
    fetch('/api/announcements').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnnouncements(data.slice(0, 5));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">

        {/* 公告區塊 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-700">📢 最新公告</h2>
            <Link href="/announcements" className="text-sm text-blue-600 hover:underline">更多公告 →</Link>
          </div>
          {announcements.length === 0
            ? <p className="text-gray-400 text-sm bg-white p-4 rounded-lg shadow">目前無公告</p>
            : (
              <div className="space-y-2">
                {announcements.map((a: any) => (
                  <div key={a.id} className="bg-white px-5 py-3 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{a.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{a.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-4 shrink-0">
                      {a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('zh-TW') : ''}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* 功能卡片 */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">功能選單</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CARDS.map(c => (
            <Link key={c.href} href={c.href} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center gap-2">
              <span className="text-3xl">{c.icon}</span>
              <h2 className="text-base font-semibold text-gray-800">{c.title}</h2>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
