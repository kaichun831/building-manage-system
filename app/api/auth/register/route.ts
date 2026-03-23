import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, unit } = await req.json();
    if (!email || !password || !name || !unit) {
      return NextResponse.json({ error: '所有欄位都是必填的' }, { status: 400 });
    }

    const existingUser = await db.users.find((u: any) => u.email === email);
    if (existingUser) return NextResponse.json({ error: '此信箱已註冊' }, { status: 400 });

    const hashedPassword = await hashPassword(password);
    const user = await db.users.push({ email, password: hashedPassword, name, unit, role: 'resident' as const, createdAt: new Date() });

    const token = await createToken(user.id, 'resident');
    return NextResponse.json({ token, user: { id: user.id, email, name, unit, role: 'resident' } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '註冊失敗，請稍後再試' }, { status: 500 });
  }
}
