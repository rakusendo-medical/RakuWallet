import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 患者詳細取得
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
  });

  if (!patient) {
    return NextResponse.json({ error: '患者が見つかりません' }, { status: 404 });
  }

  return NextResponse.json(patient);
}

// 患者情報更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: {
      name: body.name,
      nameKana: body.nameKana,
      wardName: body.wardName ?? '',
      roomNumber: body.roomNumber ?? '',
      admittedAt: body.admittedAt ? new Date(body.admittedAt) : null,
      dischargedAt: body.dischargedAt ? new Date(body.dischargedAt) : null,
      isActive: body.isActive,
      note: body.note ?? '',
    },
  });

  return NextResponse.json(patient);
}

// 患者削除（論理削除）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.patient.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
