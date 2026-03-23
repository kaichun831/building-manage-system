import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 });

    const record = await db.resetTokens.get(token);
    if (!record) return NextResponse.json({ error: '連結無效或已過期' }, { status: 400 });
    if (record.used) return NextResponse.json({ error: '此連結已使用過' }, { status: 400 });

    const expiresAt = record.expiresAt?.seconds
      ? record.expiresAt.seconds * 1000
      : new Date(record.expiresAt).getTime();
    if (Date.now() > expiresAt) return NextResponse.json({ error: '連結已過期，請重新申請' }, { status: 400 });

    await db.users.update(record.userId, { password: await hashPassword(newPassword) });
    await db.resetTokens.markUsed(token);

    return NextResponse.json({ message: '密碼已重設成功，請重新登入' });
  } catch (err) {
    console.error('confirm reset error:', err);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
