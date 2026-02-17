import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

// ユーザー更新（管理者のみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const body = await request.json();
  const { loginId, email, name, role, password, isActive } = body;

  if (role && !['admin', 'office'].includes(role)) {
    return NextResponse.json({ error: '無効な権限です' }, { status: 400 });
  }

  // 重複チェック（自分以外）
  if (loginId || email) {
    const conditions = [];
    if (loginId) conditions.push({ loginId });
    if (email) conditions.push({ email });
    const existing = await prisma.user.findFirst({
      where: {
        OR: conditions,
        NOT: { id: params.id },
      },
    });
    if (existing) {
      const field = existing.loginId === loginId ? 'ログインID' : 'メールアドレス';
      return NextResponse.json({ error: `この${field}は既に使用されています` }, { status: 409 });
    }
  }

  const updateData: any = {};
  if (loginId !== undefined) updateData.loginId = loginId;
  if (email !== undefined) updateData.email = email;
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
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
  });

  await writeAuditLog({
    userId: (session.user as any).id,
    userName: session.user.name || '',
    action: 'UPDATE',
    entity: 'User',
    entityId: params.id,
    summary: `ユーザー「${user.name}」(${user.loginId}) を更新`,
    detail: { loginId, email, name, role, isActive },
  });

  return NextResponse.json(user);
}

// ユーザー削除（管理者のみ・無効化）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  // 自分自身は削除不可
  if (params.id === session.user.id) {
    return NextResponse.json({ error: '自分自身は無効化できません' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
    select: { name: true, loginId: true },
  });

  await writeAuditLog({
    userId: (session.user as any).id,
    userName: session.user.name || '',
    action: 'DELETE',
    entity: 'User',
    entityId: params.id,
    summary: `ユーザー「${user.name}」(${user.loginId}) を無効化`,
  });

  return NextResponse.json({ success: true });
}
