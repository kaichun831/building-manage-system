import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const chairmen = await db.chairmen.getAll();
  return NextResponse.json(chairmen);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const { name, startDate, endDate } = await req.json();
  const chairman = await db.chairmen.push({ name, startDate: new Date(startDate), endDate: new Date(endDate) });
  return NextResponse.json(chairman);
}
