import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-provider';
import { verifyToken } from '@/lib/auth';

async function adminAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const { id } = await params;
  if (payload.userId !== id && payload.role !== 'admin') {
    return NextResponse.json({ error: '無權限' }, { status: 403 });
  }

  const { name, unit } = await req.json();
  await db.users.update(id, { name, unit });
  return NextResponse.json({ message: '更新成功' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await adminAuth(req);
  if (!payload) return NextResponse.json({ error: '無權限，僅管理員可操作' }, { status: 403 });

  const { id } = await params;
  await db.users.delete(id);
  await db.logs.push({ action: 'DELETE', targetType: 'member', targetId: id, operatorId: payload.userId as string });
  return NextResponse.json({ message: '刪除成功' });
}
