'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency, formatDate } from '@/lib/format';

interface Patient {
  id: string;
  patientCode: string;
  name: string;
}

interface Transaction {
  id: string;
  patientId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  patient: { name: string; patientCode: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPatient, setFilterPatient] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    patientId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchTransactions = useCallback(() => {
    const params = new URLSearchParams();
    if (filterPatient) params.set('patientId', filterPatient);
    if (filterType) params.set('type', filterType);

    fetch(`/api/transactions?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setTransactions)
      .catch((e) => console.error('transactions fetch error:', e))
      .finally(() => setLoading(false));
  }, [filterPatient, filterType]);

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setPatients)
      .catch((e) => console.error('patients fetch error:', e));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSave = async () => {
    try {
      if (!form.patientId || !form.amount || !form.date) {
        throw new Error('患者、金額、日付は必須です');
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setDialogOpen(false);
      setForm({
        patientId: '',
        type: 'deposit',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setSnackbar({ open: true, message: '登録しました', severity: 'success' });
      fetchTransactions();
    } catch (e) {
      setSnackbar({ open: true, message: (e as Error).message, severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この取引を削除しますか？')) return;

    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setSnackbar({ open: true, message: '削除しました', severity: 'success' });
    fetchTransactions();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          入出金記録
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          新規記録
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>患者で絞り込み</InputLabel>
          <Select
            value={filterPatient}
            label="患者で絞り込み"
            onChange={(e) => setFilterPatient(e.target.value)}
          >
            <MenuItem value="">全て</MenuItem>
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.patientCode} - {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>種別</InputLabel>
          <Select
            value={filterType}
            label="種別"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">全て</MenuItem>
            <MenuItem value="deposit">入金</MenuItem>
            <MenuItem value="withdrawal">出金</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  取引データがありません
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
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
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleDelete(tx.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>入出金記録</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="患者"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              required
              fullWidth
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.patientCode} - {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="種別"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'deposit' | 'withdrawal' })}
              required
              fullWidth
            >
              <MenuItem value="deposit">入金</MenuItem>
              <MenuItem value="withdrawal">出金</MenuItem>
            </TextField>
            <TextField
              label="金額"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="摘要"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              placeholder="例: 売店（飲料）"
            />
            <TextField
              label="日付"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave}>
            登録
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
