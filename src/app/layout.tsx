import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import SessionProvider from '@/components/SessionProvider';
import MainLayout from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'RakuWallet - 入院患者お小遣い管理',
  description: '入院患者様のお小遣いを安全に管理するシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          <ThemeRegistry>
            <MainLayout>{children}</MainLayout>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
