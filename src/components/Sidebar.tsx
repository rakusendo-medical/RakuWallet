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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BalanceIcon from '@mui/icons-material/AccountBalance';
import { usePathname, useRouter } from 'next/navigation';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
  { text: '患者管理', icon: <PeopleIcon />, path: '/patients' },
  { text: '入出金記録', icon: <AccountBalanceWalletIcon />, path: '/transactions' },
  { text: '月次出納帳', icon: <ReceiptLongIcon />, path: '/ledger' },
  { text: '月末残高一覧', icon: <BalanceIcon />, path: '/balances' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" fontSize="large" />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            RakuWallet
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
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
    </Drawer>
  );
}

export { DRAWER_WIDTH };
