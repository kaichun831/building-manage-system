import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const finance = await db.finance.getAll();
  const records = finance.map((r: any) => ({
    ...r,
    date: r.date?.seconds
      ? new Date(r.date.seconds * 1000).toISOString().split('T')[0]
      : r.date instanceof Date
        ? r.date.toISOString().split('T')[0]
        : r.date ?? ''
  }));
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '無效的 token' }, { status: 401 });

  const { date, category, amount, description, receipt } = await req.json();
  const record = await db.finance.push({
    date: date ? new Date(date) : new Date(),
    category,
    amount,
    description,
    receipt
  });

  // 回傳時將 date 轉為 ISO string，前端可直接 new Date() 解析
  return NextResponse.json({ ...record, date });
}
