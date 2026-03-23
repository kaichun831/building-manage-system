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
  const payload = await adminAuth(req);
  if (!payload) return NextResponse.json({ error: '無權限，僅管理員可操作' }, { status: 403 });

  const { id } = await params;
  const data = await req.json();
  await db.finance.update(id, data);
  await db.logs.push({ action: 'UPDATE', targetType: 'finance', targetId: id, operatorId: payload.userId as string, detail: JSON.stringify(data) });
  return NextResponse.json({ message: '更新成功' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await adminAuth(req);
  if (!payload) return NextResponse.json({ error: '無權限，僅管理員可操作' }, { status: 403 });

  const { id } = await params;
  await db.finance.delete(id);
  await db.logs.push({ action: 'DELETE', targetType: 'finance', targetId: id, operatorId: payload.userId as string });
  return NextResponse.json({ message: '刪除成功' });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await adminAuth(req);
  if (!payload) return NextResponse.json({ error: '無權限，僅管理員可操作' }, { status: 403 });

  const { id } = await params;
  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ error: '請填寫作廢原因' }, { status: 400 });

  await db.finance.update(id, { voided: true, voidReason: reason, voidedAt: new Date() });
  await db.logs.push({ action: 'VOID', targetType: 'finance', targetId: id, operatorId: payload.userId as string, reason });
  return NextResponse.json({ message: '作廢成功' });
}
