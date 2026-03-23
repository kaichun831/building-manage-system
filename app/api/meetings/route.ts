import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const meetings = await db.meetings.getAll();
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '無效的 token' }, { status: 401 });

  const { title, date, agenda, minutes, attendees } = await req.json();
  const meeting = await db.meetings.push({ title, date: new Date(date), agenda, minutes, attendees });
  return NextResponse.json(meeting);
}
