import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 患者詳細取得
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!patient) {
      return NextResponse.json({ error: '患者が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (e) {
    console.error('[GET /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 患者情報更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (e) {
    console.error('[PUT /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 患者削除（論理削除）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patient.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
