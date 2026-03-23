import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const issues = await db.issues.getAll();
  return NextResponse.json(issues);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '無效的 token' }, { status: 401 });

  const { title, description, category } = await req.json();
  const issue = await db.issues.push({
    userId: payload.userId as string,
    title,
    description,
    category: category || '其他',
    status: 'pending' as const,
    createdAt: new Date()
  });

  return NextResponse.json(issue);
}
