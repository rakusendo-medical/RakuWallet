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
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { formatCurrency, formatDate, formatMonth } from '@/lib/format';

interface Patient {
  id: string;
  patientCode: string;
  name: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  patient: { name: string; patientCode: string };
}

export default function LedgerPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => res.json())
      .then(setPatients);
  }, []);

  const fetchLedger = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    if (patientId) params.set('patientId', patientId);

    fetch(`/api/transactions?${params}`)
      .then((res) => res.json())
      .then((data) => {
        // 日付昇順にソート
        data.sort((a: Transaction, b: Transaction) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setTransactions(data);
      })
      .finally(() => setLoading(false));
  }, [year, month, patientId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // 出納帳の累計計算
  let runningBalance = 0;
  const ledgerRows = transactions.map((tx) => {
    const deposit = tx.type === 'deposit' ? tx.amount : 0;
    const withdrawal = tx.type === 'withdrawal' ? tx.amount : 0;
    runningBalance += deposit - withdrawal;
    return { ...tx, deposit, withdrawal, balance: runningBalance };
  });

  const totalDeposit = ledgerRows.reduce((sum, r) => sum + r.deposit, 0);
  const totalWithdrawal = ledgerRows.reduce((sum, r) => sum + r.withdrawal, 0);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        月次出納帳
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>患者</InputLabel>
          <Select value={patientId} label="患者" onChange={(e) => setPatientId(e.target.value)}>
            <MenuItem value="">全患者</MenuItem>
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.patientCode} - {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {formatMonth(year, month)} 入金合計
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {formatCurrency(totalDeposit)}
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
                {formatCurrency(totalWithdrawal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                当月差引
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(totalDeposit - totalWithdrawal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>患者番号</TableCell>
                <TableCell>患者名</TableCell>
                <TableCell>摘要</TableCell>
                <TableCell align="right">入金</TableCell>
                <TableCell align="right">出金</TableCell>
                <TableCell align="right">差引残高</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {formatMonth(year, month)}の取引データがありません
                  </TableCell>
                </TableRow>
              ) : (
                ledgerRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row.patient.patientCode}</TableCell>
                    <TableCell>{row.patient.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="right">
                      {row.deposit > 0 ? (
                        <Typography color="success.main">{formatCurrency(row.deposit)}</Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {row.withdrawal > 0 ? (
                        <Typography color="error.main">{formatCurrency(row.withdrawal)}</Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">{formatCurrency(row.balance)}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {ledgerRows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography fontWeight="bold">合計</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="success.main">
                      {formatCurrency(totalDeposit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="error.main">
                      {formatCurrency(totalWithdrawal)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">{formatCurrency(runningBalance)}</Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
