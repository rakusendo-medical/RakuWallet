// Turso に User テーブルを追加し、シードデータを投入するスクリプト
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // User テーブル作成（既に存在する場合はスキップ）
  console.log('Creating User table...');
  await client.execute(`
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
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "User_loginId_key" ON "User"("loginId")`);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
  console.log('User table ready.');

  // 既存ユーザーチェック
  const existing = await client.execute(`SELECT COUNT(*) as cnt FROM "User"`);
  const count = Number(existing.rows[0].cnt);
  if (count > 0) {
    console.log(`Already ${count} users exist. Skipping seed.`);
    return;
  }

  // シードデータ投入
  const adminPassword = await bcrypt.hash('admin123', 10);
  const officePassword = await bcrypt.hash('office123', 10);
  const now = new Date().toISOString();

  await client.execute({
    sql: `INSERT INTO "User" ("id", "loginId", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['admin-001', 'admin', 'admin@rakuwallet.local', adminPassword, '管理者', 'admin', true, now, now],
  });

  await client.execute({
    sql: `INSERT INTO "User" ("id", "loginId", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['office-001', 'jimu01', 'jimu01@rakuwallet.local', officePassword, '事務 太郎', 'office', true, now, now],
  });

  console.log('Seeded: admin / admin123, jimu01 / office123');
}

main()
  .then(() => { console.log('Done!'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
