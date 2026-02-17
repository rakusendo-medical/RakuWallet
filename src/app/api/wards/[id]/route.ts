import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

// 病棟更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: '病棟名は必須です' }, { status: 400 });
    }

    // 重複チェック（自分以外）
    const existing = await prisma.ward.findFirst({
      where: { name, id: { not: params.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'この病棟名は既に登録されています' }, { status: 409 });
    }

    const ward = await prisma.ward.update({
      where: { id: params.id },
      data: { name },
    });

    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'UPDATE',
      entity: 'Ward',
      entityId: params.id,
      summary: `病棟「${ward.name}」を更新`,
      detail: { name },
    });

    return NextResponse.json(ward);
  } catch (e) {
    console.error('[PUT /api/wards/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 病棟削除（論理削除）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const ward = await prisma.ward.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'DELETE',
      entity: 'Ward',
      entityId: params.id,
      summary: `病棟「${ward.name}」を無効化`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/wards/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
