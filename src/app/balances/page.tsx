'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { formatCurrency, formatMonth } from '@/lib/format';

interface BalanceData {
  year: number;
  month: number;
  monthEnd: string;
  totalBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  balances: Array<{
    patientId: string;
    patientCode: string;
    name: string;
    wardName: string;
    roomNumber: string;
    balance: number;
    monthDeposit: number;
    monthWithdrawal: number;
  }>;
}

export default function BalancesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(() => {
    setLoading(true);
    fetch(`/api/balances?year=${year}&month=${month}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => console.error('balances fetch error:', e))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        月末残高一覧
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>年</InputLabel>
          <Select value={year} label="年" onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}年
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>月</InputLabel>
          <Select value={month} label="月" onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {m}月
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {data && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  預かり金 総残高
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(data.totalBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {formatMonth(year, month)} 入金合計
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(data.totalDeposit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {formatMonth(year, month)} 出金合計
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  {formatCurrency(data.totalWithdrawal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>患者番号</TableCell>
                <TableCell>患者名</TableCell>
                <TableCell>病棟</TableCell>
                <TableCell>病室</TableCell>
                <TableCell align="right">当月入金</TableCell>
                <TableCell align="right">当月出金</TableCell>
                <TableCell align="right">月末残高</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                data.balances.map((row) => (
                  <TableRow key={row.patientId} hover>
                    <TableCell>{row.patientCode}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.wardName}</TableCell>
                    <TableCell>{row.roomNumber}</TableCell>
                    <TableCell align="right">
                      <Typography color="success.main">
                        {row.monthDeposit > 0 ? formatCurrency(row.monthDeposit) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error.main">
                        {row.monthWithdrawal > 0 ? formatCurrency(row.monthWithdrawal) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight="bold"
                        color={row.balance < 0 ? 'error.main' : 'text.primary'}
                      >
                        {formatCurrency(row.balance)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {data.balances.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography fontWeight="bold">合計 ({data.balances.length}名)</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="success.main">
                      {formatCurrency(data.totalDeposit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="error.main">
                      {formatCurrency(data.totalWithdrawal)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatCurrency(data.totalBalance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}
