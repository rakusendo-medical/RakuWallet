import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 取引削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.transaction.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

// 取引更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  return NextResponse.json(transaction);
}
