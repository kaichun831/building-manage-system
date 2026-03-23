import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const announcements = await db.announcements.getAll();
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '無效的 token' }, { status: 401 });

  const { title, content } = await req.json();
  const announcement = await db.announcements.push({ title, content, createdAt: new Date() });
  return NextResponse.json(announcement);
}
