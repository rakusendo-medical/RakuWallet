import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

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
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const dischargedAt = body.dischargedAt ? new Date(body.dischargedAt) : null;
    const isActive = !dischargedAt;

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        name: body.name,
        nameKana: body.nameKana,
        wardName: body.wardName ?? '',
        roomNumber: body.roomNumber ?? '',
        admittedAt: body.admittedAt ? new Date(body.admittedAt) : null,
        dischargedAt,
        isActive,
        note: body.note ?? '',
      },
    });

    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'UPDATE',
      entity: 'Patient',
      entityId: params.id,
      summary: `患者「${patient.name}」(${patient.patientCode}) を更新`,
      detail: body,
    });

    return NextResponse.json(patient);
  } catch (e) {
    console.error('[PUT /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 患者ステータス切替（入院中 ⇔ 外来/退院済み）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const current = await prisma.patient.findUnique({
      where: { id: params.id },
    });
    if (!current) {
      return NextResponse.json({ error: '患者が見つかりません' }, { status: 404 });
    }

    const newIsActive = !current.isActive;
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        isActive: newIsActive,
        dischargedAt: newIsActive ? null : new Date(),
      },
    });

    const statusLabel = newIsActive ? '入院中' : '外来（退院済み）';
    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'UPDATE',
      entity: 'Patient',
      entityId: params.id,
      summary: `患者「${patient.name}」(${patient.patientCode}) のステータスを「${statusLabel}」に変更`,
      detail: { isActive: newIsActive, dischargedAt: patient.dischargedAt },
    });

    return NextResponse.json(patient);
  } catch (e) {
    console.error('[PATCH /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 患者削除（論理削除）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await writeAuditLog({
      userId: (session?.user as any)?.id || 'unknown',
      userName: session?.user?.name || 'unknown',
      action: 'DELETE',
      entity: 'Patient',
      entityId: params.id,
      summary: `患者「${patient.name}」(${patient.patientCode}) を無効化`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/patients/[id]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
