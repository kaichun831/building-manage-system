'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setRole(payload.role || 'user');
      setUserId(payload.userId || '');
    } catch { setRole('user'); }
  }, [router]);

  const authHeaders = useMemo(
    () => token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {} as Record<string, string>,
    [token]
  );

  const isAdmin = role === 'admin';
  return { token, authHeaders, role, isAdmin, userId };
}
