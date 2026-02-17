import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 取引一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get('patientId');
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const type = searchParams.get('type');

  const where: Record<string, unknown> = {};

  if (patientId) {
    where.patientId = patientId;
  }

  if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);
    where.date = {
      gte: startDate,
      lt: endDate,
    };
  }

  if (type && (type === 'deposit' || type === 'withdrawal')) {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      patient: {
        select: { name: true, patientCode: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(transactions);
}

// 取引新規登録
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { patientId, type, amount, description, date } = body;

  if (!patientId || !type || !amount || !date) {
    return NextResponse.json(
      { error: '患者ID、種別、金額、日付は必須です' },
      { status: 400 }
    );
  }

  if (type !== 'deposit' && type !== 'withdrawal') {
    return NextResponse.json(
      { error: '種別は deposit または withdrawal を指定してください' },
      { status: 400 }
    );
  }

  if (amount <= 0) {
    return NextResponse.json(
      { error: '金額は正の数を指定してください' },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      patientId,
      type,
      amount: Number(amount),
      description: description || '',
      date: new Date(date),
    },
    include: {
      patient: {
        select: { name: true, patientCode: true },
      },
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
