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
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Ward {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchWards = useCallback(() => {
    const params = new URLSearchParams();
    if (showInactive) params.set('active', 'false');

    fetch(`/api/wards?${params}`)
      .then((res) => res.json())
      .then(setWards)
      .catch((e) => console.error('wards fetch error:', e))
      .finally(() => setLoading(false));
  }, [showInactive]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  const handleOpenDialog = (ward?: Ward) => {
    if (ward) {
      setEditingId(ward.id);
      setName(ward.name);
    } else {
      setEditingId(null);
      setName('');
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/wards/${editingId}` : '/api/wards';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setDialogOpen(false);
      setSnackbar({ open: true, message: editingId ? '更新しました' : '登録しました', severity: 'success' });
      fetchWards();
    } catch (e) {
      setSnackbar({ open: true, message: (e as Error).message, severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この病棟を無効化しますか？')) return;

    await fetch(`/api/wards/${id}`, { method: 'DELETE' });
    setSnackbar({ open: true, message: '無効化しました', severity: 'success' });
    fetchWards();
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
          病棟マスタ管理
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          新規登録
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <FormControlLabel
          control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
          label="無効な病棟も表示"
        />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>病棟名</TableCell>
              <TableCell>状態</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  病棟が登録されていません
                </TableCell>
              </TableRow>
            ) : (
              wards.map((ward) => (
                <TableRow key={ward.id} hover>
                  <TableCell>{ward.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={ward.isActive ? '有効' : '無効'}
                      color={ward.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(ward)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {ward.isActive && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(ward.id)}>
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
        <DialogTitle>{editingId ? '病棟編集' : '新規病棟登録'}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              label="病棟名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>
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
