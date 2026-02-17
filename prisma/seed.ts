import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});

async function main() {
  // 初期ユーザー（管理者 + 事務）
  const adminPassword = await bcrypt.hash('admin123', 10);
  const officePassword = await bcrypt.hash('office123', 10);

  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      loginId: 'admin',
      email: 'admin@rakuwallet.local',
      password: adminPassword,
      name: '管理者',
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { loginId: 'jimu01' },
    update: {},
    create: {
      loginId: 'jimu01',
      email: 'jimu01@rakuwallet.local',
      password: officePassword,
      name: '事務 太郎',
      role: 'office',
    },
  });

  console.log('Users seeded: admin / admin123, jimu01 / office123');

  // 病棟マスタ
  const wardNames = ['第一病棟', '第二病棟'];
  for (const wardName of wardNames) {
    await prisma.ward.upsert({
      where: { name: wardName },
      update: {},
      create: { name: wardName },
    });
  }
  console.log('Wards seeded: 第一病棟, 第二病棟');

  // 商品マスタ
  const products = [
    { productCode: 'G-001', name: 'お茶（500ml）', category: '飲料', defaultPrice: 150 },
    { productCode: 'G-002', name: 'コーヒー（缶）', category: '飲料', defaultPrice: 130 },
    { productCode: 'G-003', name: 'ジュース（500ml）', category: '飲料', defaultPrice: 160 },
    { productCode: 'G-004', name: 'せんべい', category: 'お菓子', defaultPrice: 200 },
    { productCode: 'G-005', name: 'チョコレート', category: 'お菓子', defaultPrice: 250 },
    { productCode: 'G-006', name: 'ティッシュ', category: '日用品', defaultPrice: 180 },
    { productCode: 'G-007', name: '歯ブラシ', category: '日用品', defaultPrice: 220 },
    { productCode: 'G-008', name: '石鹸', category: '日用品', defaultPrice: 300 },
    { productCode: 'G-009', name: '新聞', category: 'その他', defaultPrice: 200 },
    { productCode: 'G-010', name: '雑誌', category: 'その他', defaultPrice: 500 },
  ];

  const productRecords = [];
  for (const p of products) {
    const record = await prisma.product.upsert({
      where: { productCode: p.productCode },
      update: {},
      create: p,
    });
    productRecords.push(record);
  }

  // 患者データ
  const patients = [
    {
      patientCode: 'P-001',
      medicalRecordNumber: 'EMR-20251101-001',
      name: '山田 太郎',
      nameKana: 'ヤマダ タロウ',
      birthDate: new Date('1950-03-15'),
      wardName: '3階東病棟',
      roomNumber: '301',
      admittedAt: new Date('2025-11-01'),
    },
    {
      patientCode: 'P-002',
      medicalRecordNumber: 'EMR-20251215-002',
      name: '佐藤 花子',
      nameKana: 'サトウ ハナコ',
      birthDate: new Date('1945-08-20'),
      wardName: '3階東病棟',
      roomNumber: '302',
      admittedAt: new Date('2025-12-15'),
    },
    {
      patientCode: 'P-003',
      medicalRecordNumber: 'EMR-20260110-003',
      name: '鈴木 一郎',
      nameKana: 'スズキ イチロウ',
      birthDate: new Date('1960-01-05'),
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

    const existingTx = await prisma.transaction.count({ where: { patientId: patient.id } });
    if (existingTx > 0) continue;

    // 入金
    await prisma.transaction.create({
      data: {
        patientId: patient.id,
        type: 'deposit',
        amount: 30000,
        description: '家族からの預かり金',
        date: new Date('2026-01-05'),
      },
    });

    // 出金（明細付き）
    const tx1 = await prisma.transaction.create({
      data: {
        patientId: patient.id,
        type: 'withdrawal',
        amount: 480,
        description: '売店購入',
        date: new Date('2026-01-10'),
      },
    });
    await prisma.transactionItem.createMany({
      data: [
        { transactionId: tx1.id, productId: productRecords[0].id, productName: 'お茶（500ml）', unitPrice: 150, quantity: 2, subtotal: 300 },
        { transactionId: tx1.id, productId: productRecords[3].id, productName: 'せんべい', unitPrice: 200, quantity: 1, subtotal: 200 },
      ],
    });

    const tx2 = await prisma.transaction.create({
      data: {
        patientId: patient.id,
        type: 'withdrawal',
        amount: 700,
        description: '売店購入',
        date: new Date('2026-01-15'),
      },
    });
    await prisma.transactionItem.createMany({
      data: [
        { transactionId: tx2.id, productId: productRecords[5].id, productName: 'ティッシュ', unitPrice: 180, quantity: 1, subtotal: 180 },
        { transactionId: tx2.id, productId: productRecords[6].id, productName: '歯ブラシ', unitPrice: 220, quantity: 1, subtotal: 220 },
        { transactionId: tx2.id, productId: productRecords[7].id, productName: '石鹸', unitPrice: 300, quantity: 1, subtotal: 300 },
      ],
    });

    await prisma.transaction.create({
      data: {
        patientId: patient.id,
        type: 'deposit',
        amount: 10000,
        description: '家族からの追加入金',
        date: new Date('2026-02-01'),
      },
    });

    const tx3 = await prisma.transaction.create({
      data: {
        patientId: patient.id,
        type: 'withdrawal',
        amount: 530,
        description: '売店購入',
        date: new Date('2026-02-05'),
      },
    });
    await prisma.transactionItem.createMany({
      data: [
        { transactionId: tx3.id, productId: productRecords[4].id, productName: 'チョコレート', unitPrice: 250, quantity: 1, subtotal: 250 },
        { transactionId: tx3.id, productId: productRecords[1].id, productName: 'コーヒー（缶）', unitPrice: 130, quantity: 1, subtotal: 130 },
        { transactionId: tx3.id, productId: productRecords[0].id, productName: 'お茶（500ml）', unitPrice: 150, quantity: 1, subtotal: 150 },
      ],
    });
  }

  // 請求連絡記録サンプル
  const patient1 = await prisma.patient.findUnique({ where: { patientCode: 'P-001' } });
  if (patient1) {
    const existing = await prisma.billingContact.count({ where: { patientId: patient1.id } });
    if (existing === 0) {
      await prisma.billingContact.create({
        data: {
          patientId: patient1.id,
          contactDate: new Date('2026-02-10'),
          contactMethod: '電話',
          contactTo: '山田 花子（長女）',
          amount: 5000,
          content: '2月分の追加入金のお願い',
          status: 'contacted',
        },
      });
    }
  }

  // 締め処理サンプル（1月を締め済みに）
  await prisma.closingPeriod.upsert({
    where: { year_month: { year: 2026, month: 1 } },
    update: {},
    create: { year: 2026, month: 1, closedBy: '管理者' },
  });

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
