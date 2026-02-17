import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 患者一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameKana: { contains: search } },
        { patientCode: { contains: search } },
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { patientCode: 'asc' },
    });

    return NextResponse.json(patients);
  } catch (e) {
    console.error('[GET /api/patients]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 患者新規登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { patientCode, name, nameKana, wardName, roomNumber, admittedAt, note } = body;

    if (!patientCode || !name || !nameKana) {
      return NextResponse.json(
        { error: '患者番号、氏名、氏名カナは必須です' },
        { status: 400 }
      );
    }

    const existing = await prisma.patient.findUnique({
      where: { patientCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'この患者番号は既に登録されています' },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        patientCode,
        name,
        nameKana,
        wardName: wardName || '',
        roomNumber: roomNumber || '',
        admittedAt: admittedAt ? new Date(admittedAt) : null,
        note: note || '',
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (e) {
    console.error('[POST /api/patients]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
