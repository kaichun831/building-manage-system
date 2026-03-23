import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '無效的 token' }, { status: 401 });

  const { newPassword } = await req.json();
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 });
  }

  const user = await db.users.getById(payload.userId as string);
  if (!user) return NextResponse.json({ error: '用戶不存在' }, { status: 404 });

  await db.users.update(payload.userId as string, { password: await hashPassword(newPassword) });
  return NextResponse.json({ message: '密碼已更新' });
}
