import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  const users = await db.users.getAll();
  return NextResponse.json(users.map((u: any) => ({
    id: u.id, name: u.name, unit: u.unit, email: u.email, role: u.role, createdAt: u.createdAt
  })));
}
