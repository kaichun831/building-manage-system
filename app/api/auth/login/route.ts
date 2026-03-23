import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: '請輸入電子信箱和密碼' }, { status: 400 });

    const user = await db.users.find((u: any) => u.email === email);
    if (!user) return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });

    const token = await createToken(user.id, user.role || 'user');
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, unit: user.unit, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登入失敗，請稍後再試' }, { status: 500 });
  }
}
