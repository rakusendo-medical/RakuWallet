import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // サンプル患者データ
  const patients = [
    {
      patientCode: 'P-001',
      name: '山田 太郎',
      nameKana: 'ヤマダ タロウ',
      wardName: '3階東病棟',
      roomNumber: '301',
      admittedAt: new Date('2025-11-01'),
    },
    {
      patientCode: 'P-002',
      name: '佐藤 花子',
      nameKana: 'サトウ ハナコ',
      wardName: '3階東病棟',
      roomNumber: '302',
      admittedAt: new Date('2025-12-15'),
    },
    {
      patientCode: 'P-003',
      name: '鈴木 一郎',
      nameKana: 'スズキ イチロウ',
      wardName: '4階西病棟',
      roomNumber: '410',
      admittedAt: new Date('2026-01-10'),
    },
  ];

  for (const p of patients) {
    const patient = await prisma.patient.upsert({
      where: { patientCode: p.patientCode },
      update: {},
      create: p,
    });

    // サンプル取引データ
    const existingTx = await prisma.transaction.count({
      where: { patientId: patient.id },
    });

    if (existingTx === 0) {
      await prisma.transaction.createMany({
        data: [
          {
            patientId: patient.id,
            type: 'deposit',
            amount: 30000,
            description: '家族からの預かり金',
            date: new Date('2026-01-05'),
          },
          {
            patientId: patient.id,
            type: 'withdrawal',
            amount: 500,
            description: '売店（飲料）',
            date: new Date('2026-01-10'),
          },
          {
            patientId: patient.id,
            type: 'withdrawal',
            amount: 1200,
            description: '売店（日用品）',
            date: new Date('2026-01-15'),
          },
          {
            patientId: patient.id,
            type: 'deposit',
            amount: 10000,
            description: '家族からの追加入金',
            date: new Date('2026-02-01'),
          },
          {
            patientId: patient.id,
            type: 'withdrawal',
            amount: 800,
            description: '売店（お菓子）',
            date: new Date('2026-02-05'),
          },
        ],
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
