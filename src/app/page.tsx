'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatCurrency, formatDate } from '@/lib/format';

interface DashboardData {
  activePatients: number;
  totalBalance: number;
  monthDeposit: number;
  monthWithdrawal: number;
  monthTransactionCount: number;
  currentYear: number;
  currentMonth: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    patient: { name: string; patientCode: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => console.error('Dashboard fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  const summaryCards = [
    {
      title: '管理中の患者数',
      value: `${data.activePatients}名`,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: '預かり金総残高',
      value: formatCurrency(data.totalBalance),
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: `${data.currentMonth}月 入金合計`,
      value: formatCurrency(data.monthDeposit),
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
    },
    {
      title: `${data.currentMonth}月 出金合計`,
      value: formatCurrency(data.monthWithdrawal),
      icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: '#c62828',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        ダッシュボード
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {data.currentYear}年{data.currentMonth}月の概要
      </Typography>

      <Grid container spacing={3} mb={4}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" mt={1}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom fontWeight="bold">
        最近の取引
      </Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell>患者番号</TableCell>
              <TableCell>患者名</TableCell>
              <TableCell>種別</TableCell>
              <TableCell>摘要</TableCell>
              <TableCell align="right">金額</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.recentTransactions.map((tx) => (
              <TableRow key={tx.id} hover>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell>{tx.patient.patientCode}</TableCell>
                <TableCell>{tx.patient.name}</TableCell>
                <TableCell>
                  <Chip
                    label={tx.type === 'deposit' ? '入金' : '出金'}
                    color={tx.type === 'deposit' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell align="right">
                  <Typography
                    color={tx.type === 'deposit' ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {tx.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
