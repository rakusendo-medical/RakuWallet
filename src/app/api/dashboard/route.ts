import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      activePatients,
      totalPatients,
      monthTransactions,
      recentTransactions,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.patient.count(),
      prisma.transaction.findMany({
        where: {
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          patient: { select: { name: true, patientCode: true } },
        },
      }),
    ]);

    const monthDeposit = monthTransactions
      .filter((tx) => tx.type === 'deposit')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const monthWithdrawal = monthTransactions
      .filter((tx) => tx.type === 'withdrawal')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const allTransactions = await prisma.transaction.findMany();
    const totalBalance = allTransactions.reduce((acc, tx) => {
      return tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount;
    }, 0);

    return NextResponse.json({
      activePatients,
      totalPatients,
      totalBalance,
      monthDeposit,
      monthWithdrawal,
      monthTransactionCount: monthTransactions.length,
      recentTransactions,
      currentYear: year,
      currentMonth: month,
    });
  } catch (e) {
    console.error('[GET /api/dashboard]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
