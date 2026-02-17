import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// 初回セットアップ用API（User テーブルにデータを投入）
// ブラウザから /api/seed にアクセスして実行
export async function GET() {
  try {
    // 既にユーザーが存在するかチェック
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({
        message: `既に ${count} 件のユーザーが存在します。シード不要です。`,
      });
    }

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

    return NextResponse.json({
      message: 'シード完了！',
      users: [
        { loginId: 'admin', password: 'admin123', role: '管理者' },
        { loginId: 'jimu01', password: 'office123', role: '事務' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
