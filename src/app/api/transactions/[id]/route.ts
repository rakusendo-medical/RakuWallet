import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

// 取引削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { patient: { select: { name: true, patientCode: true } } },
    });

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    if (transaction) {
      const typeLabel = transaction.type === 'deposit' ? '入金' : '出金';
      await writeAuditLog({
        userId: (session?.user as any)?.id || 'unknown',
        userName: session?.user?.name || 'unknown',
        action: 'DELETE',
        entity: 'Transaction',
        entityId: params.id,
        summary: `${transaction.patient.patientCode} ${transaction.patient.name} の${typeLabel} ¥${transaction.amount} を削除`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/transactions/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 取引更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        type: body.type,
        amount: Number(body.amount),
        description: body.description ?? '',
        date: new Date(body.date),
      },
      include: {
        patient: {
          select: { name: true, patientCode: true },
        },
      },
    });

    const typeLabel = transaction.type === 'deposit' ? '入金' : '出金';
    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'UPDATE',
      entity: 'Transaction',
      entityId: params.id,
      summary: `${transaction.patient.patientCode} ${transaction.patient.name} の${typeLabel} ¥${transaction.amount} を更新`,
      detail: body,
    });

    return NextResponse.json(transaction);
  } catch (e) {
    console.error('[PUT /api/transactions/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
