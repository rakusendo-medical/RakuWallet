'use client';

import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import AppHeader from '@/components/AppHeader';
import Sidebar, { DRAWER_WIDTH } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <AppHeader />
      <Sidebar />
      <Box
        component="main"
        sx={{
          ml: `${DRAWER_WIDTH}px`,
          p: 3,
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </>
  );
}
