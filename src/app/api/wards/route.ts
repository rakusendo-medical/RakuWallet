import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

// 病棟一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false';

    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const wards = await prisma.ward.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(wards);
  } catch (e) {
    console.error('[GET /api/wards]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 病棟新規登録
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: '病棟名は必須です' }, { status: 400 });
    }

    const existing = await prisma.ward.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'この病棟名は既に登録されています' }, { status: 409 });
    }

    const ward = await prisma.ward.create({
      data: { name },
    });

    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'CREATE',
      entity: 'Ward',
      entityId: ward.id,
      summary: `病棟「${name}」を登録`,
    });

    return NextResponse.json(ward, { status: 201 });
  } catch (e) {
    console.error('[POST /api/wards]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
