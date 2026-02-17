import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 月末残高一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = Number(searchParams.get('year') || new Date().getFullYear());
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1);

  // 当月末日を計算
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  // アクティブな患者を取得
  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    orderBy: { patientCode: 'asc' },
  });

  // 各患者の月末時点残高を計算
  const balances = await Promise.all(
    patients.map(async (patient) => {
      const transactions = await prisma.transaction.findMany({
        where: {
          patientId: patient.id,
          date: { lte: monthEnd },
        },
      });

      const balance = transactions.reduce((acc, tx) => {
        return tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount;
      }, 0);

      // 当月の入出金合計
      const monthStart = new Date(year, month - 1, 1);
      const monthTransactions = transactions.filter(
        (tx) => tx.date >= monthStart && tx.date <= monthEnd
      );
      const monthDeposit = monthTransactions
        .filter((tx) => tx.type === 'deposit')
        .reduce((acc, tx) => acc + tx.amount, 0);
      const monthWithdrawal = monthTransactions
        .filter((tx) => tx.type === 'withdrawal')
        .reduce((acc, tx) => acc + tx.amount, 0);

      return {
        patientId: patient.id,
        patientCode: patient.patientCode,
        name: patient.name,
        wardName: patient.wardName,
        roomNumber: patient.roomNumber,
        balance,
        monthDeposit,
        monthWithdrawal,
      };
    })
  );

  return NextResponse.json({
    year,
    month,
    monthEnd: monthEnd.toISOString(),
    balances,
    totalBalance: balances.reduce((acc, b) => acc + b.balance, 0),
    totalDeposit: balances.reduce((acc, b) => acc + b.monthDeposit, 0),
    totalWithdrawal: balances.reduce((acc, b) => acc + b.monthWithdrawal, 0),
  });
}
