'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { DRAWER_WIDTH } from '@/components/Sidebar';

export default function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          入院患者 お小遣い管理システム
        </Typography>
        {session?.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={session.user.role === 'admin' ? '管理者' : '事務'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
            <Typography variant="body2">{session.user.name}</Typography>
            <Button
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              ログアウト
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
