'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  ListSubheader,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BalanceIcon from '@mui/icons-material/AccountBalance';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const DRAWER_WIDTH = 260;

type MenuItem = {
  text: string;
  icon: React.ReactNode;
  path: string;
};

const mainMenuItems: MenuItem[] = [
  { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
  { text: '患者管理', icon: <PeopleIcon />, path: '/patients' },
  { text: '入出金記録', icon: <AccountBalanceWalletIcon />, path: '/transactions' },
  { text: '月次出納帳', icon: <ReceiptLongIcon />, path: '/ledger' },
  { text: '月末残高一覧', icon: <BalanceIcon />, path: '/balances' },
];

const adminMenuItems: MenuItem[] = [
  { text: '病棟マスタ管理', icon: <LocalHospitalIcon />, path: '/wards' },
  { text: 'ユーザー管理', icon: <ManageAccountsIcon />, path: '/users' },
  { text: '操作ログ', icon: <HistoryIcon />, path: '/audit-logs' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  if (pathname === '/login') return null;

  const isAdmin = session?.user?.role === 'admin';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            RakuWallet
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ pl: 0.5 }}>
          入院患者お小遣い管理システム
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {isAdmin && (
        <>
          <Divider />
          <List
            subheader={
              <ListSubheader component="div" sx={{ lineHeight: '36px', fontSize: '0.75rem' }}>
                管理者メニュー
              </ListSubheader>
            }
          >
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => router.push(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
