import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyToken } from '@/lib/auth';

async function auth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  await db.chairmen.update(id, data);
  return NextResponse.json({ message: '更新成功' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const { id } = await params;
  await db.chairmen.delete(id);
  return NextResponse.json({ message: '刪除成功' });
}
