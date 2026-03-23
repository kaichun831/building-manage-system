import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendResetEmail } from '@/lib/mailer';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: '請輸入電子信箱' }, { status: 400 });

    const user = await db.users.find((u: any) => u.email === email);
    // 無論帳號是否存在都回傳相同訊息，避免帳號枚舉
    if (!user) return NextResponse.json({ message: '若此信箱已註冊，重設連結將發送至您的信箱' });

    const token = randomBytes(32).toString('hex');
    await db.resetTokens.create(user.id, token);
    await sendResetEmail(email, token);

    return NextResponse.json({ message: '若此信箱已註冊，重設連結將發送至您的信箱' });
  } catch (err) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
