import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

// ユーザー一覧取得（管理者のみ）
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      loginId: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(users);
}

// ユーザー新規登録（管理者のみ）
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const body = await request.json();
  const { loginId, email, password, name, role } = body;

  if (!loginId || !email || !password || !name) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }

  if (role && !['admin', 'office'].includes(role)) {
    return NextResponse.json({ error: '無効な権限です' }, { status: 400 });
  }

  // 重複チェック
  const existing = await prisma.user.findFirst({
    where: { OR: [{ loginId }, { email }] },
  });
  if (existing) {
    const field = existing.loginId === loginId ? 'ログインID' : 'メールアドレス';
    return NextResponse.json({ error: `この${field}は既に使用されています` }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      loginId,
      email,
      password: hashedPassword,
      name,
      role: role || 'office',
    },
    select: {
      id: true,
      loginId: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    userId: (session.user as any).id,
    userName: session.user.name || '',
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    summary: `ユーザー「${name}」(${loginId}) を登録`,
    detail: { loginId, email, name, role: role || 'office' },
  });

  return NextResponse.json(user, { status: 201 });
}
