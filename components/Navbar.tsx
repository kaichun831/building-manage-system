'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-bold text-lg">大廈管理系統</Link>
      <div className="flex gap-4 text-sm">
        <Link href="/announcements" className="hover:underline">公告</Link>
        <Link href="/issues" className="hover:underline">議題</Link>
        <Link href="/meetings" className="hover:underline">會議</Link>
        <Link href="/finance" className="hover:underline">財務</Link>
        <Link href="/members" className="hover:underline">住戶成員</Link>
        <Link href="/profile" className="hover:underline">帳號</Link>
        <button onClick={logout} className="hover:underline">登出</button>
      </div>
    </nav>
  );
}
