import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// 初回セットアップ用API（テーブル作成 + シードデータ投入）
// ブラウザから /api/seed にアクセスして実行
export async function GET() {
  try {
    // User テーブルを作成（存在しない場合）
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "loginId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'office',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_loginId_key" ON "User"("loginId")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);

    // Ward テーブルを作成（存在しない場合）
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Ward" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Ward_name_key" ON "Ward"("name")`);

    // AuditLog テーブルを作成（存在しない場合）
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "userName" TEXT NOT NULL DEFAULT '',
        "action" TEXT NOT NULL,
        "entity" TEXT NOT NULL,
        "entityId" TEXT NOT NULL,
        "summary" TEXT NOT NULL DEFAULT '',
        "detail" TEXT NOT NULL DEFAULT '',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`);

    // ユーザーシード
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const officePassword = await bcrypt.hash('office123', 10);

      await prisma.user.create({
        data: {
          loginId: 'admin',
          email: 'admin@rakuwallet.local',
          password: adminPassword,
          name: '管理者',
          role: 'admin',
        },
      });

      await prisma.user.create({
        data: {
          loginId: 'jimu01',
          email: 'jimu01@rakuwallet.local',
          password: officePassword,
          name: '事務 太郎',
          role: 'office',
        },
      });
    }

    // 病棟マスタシード
    const wardCount = await prisma.ward.count();
    if (wardCount === 0) {
      await prisma.ward.create({ data: { name: '第一病棟' } });
      await prisma.ward.create({ data: { name: '第二病棟' } });
    }

    return NextResponse.json({
      message: 'シード完了！',
      users: [
        { loginId: 'admin', password: 'admin123', role: '管理者' },
        { loginId: 'jimu01', password: 'office123', role: '事務' },
      ],
      wards: ['第一病棟', '第二病棟'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
