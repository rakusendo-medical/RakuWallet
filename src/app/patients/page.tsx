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
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { formatDate } from '@/lib/format';

interface Patient {
  id: string;
  patientCode: string;
  name: string;
  nameKana: string;
  wardName: string;
  roomNumber: string;
  admittedAt: string | null;
  dischargedAt: string | null;
  isActive: boolean;
  note: string;
}

const emptyForm = {
  patientCode: '',
  name: '',
  nameKana: '',
  wardName: '',
  roomNumber: '',
  admittedAt: '',
  note: '',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchPatients = useCallback(() => {
    const params = new URLSearchParams();
    if (showInactive) params.set('active', 'false');
    if (search) params.set('search', search);

    fetch(`/api/patients?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setPatients)
      .catch((e) => console.error('patients fetch error:', e))
      .finally(() => setLoading(false));
  }, [search, showInactive]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingId(patient.id);
      setForm({
        patientCode: patient.patientCode,
        name: patient.name,
        nameKana: patient.nameKana,
        wardName: patient.wardName,
        roomNumber: patient.roomNumber,
        admittedAt: patient.admittedAt ? patient.admittedAt.split('T')[0] : '',
        note: patient.note,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/patients/${editingId}` : '/api/patients';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setDialogOpen(false);
      setSnackbar({ open: true, message: editingId ? '更新しました' : '登録しました', severity: 'success' });
      fetchPatients();
    } catch (e) {
      setSnackbar({ open: true, message: (e as Error).message, severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この患者を無効化しますか？')) return;

    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    setSnackbar({ open: true, message: '無効化しました', severity: 'success' });
    fetchPatients();
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
          患者管理
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          新規登録
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          size="small"
          placeholder="患者番号・氏名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <FormControlLabel
          control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
          label="退院済みも表示"
        />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>患者番号</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>カナ</TableCell>
              <TableCell>病棟</TableCell>
              <TableCell>病室</TableCell>
              <TableCell>入院日</TableCell>
              <TableCell>状態</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  患者が登録されていません
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.patientCode}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.nameKana}</TableCell>
                  <TableCell>{patient.wardName}</TableCell>
                  <TableCell>{patient.roomNumber}</TableCell>
                  <TableCell>{patient.admittedAt ? formatDate(patient.admittedAt) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.isActive ? '入院中' : '退院'}
                      color={patient.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(patient)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {patient.isActive && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(patient.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '患者情報編集' : '新規患者登録'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="患者番号"
              value={form.patientCode}
              onChange={(e) => setForm({ ...form, patientCode: e.target.value })}
              required
              disabled={!!editingId}
              fullWidth
            />
            <TextField
              label="氏名"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="氏名カナ"
              value={form.nameKana}
              onChange={(e) => setForm({ ...form, nameKana: e.target.value })}
              required
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="病棟名"
                value={form.wardName}
                onChange={(e) => setForm({ ...form, wardName: e.target.value })}
                fullWidth
              />
              <TextField
                label="病室番号"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              label="入院日"
              type="date"
              value={form.admittedAt}
              onChange={(e) => setForm({ ...form, admittedAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="備考"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? '更新' : '登録'}
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
