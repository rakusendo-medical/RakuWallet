'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type User = {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const initialForm = {
  loginId: '',
  email: '',
  name: '',
  password: '',
  role: 'office' as string,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpen = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setForm({
        loginId: user.loginId,
        email: user.email,
        name: user.name,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setForm(initialForm);
    }
    setError('');
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.loginId || !form.email || !form.name) {
      setError('ログインID・メールアドレス・表示名は必須です');
      return;
    }
    if (!editingUser && !form.password) {
      setError('パスワードは必須です');
      return;
    }

    const body: any = {
      loginId: form.loginId,
      email: form.email,
      name: form.name,
      role: form.role,
    };
    if (form.password) body.password = form.password;

    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '保存に失敗しました');
      return;
    }

    handleClose();
    fetchUsers();
    setSnackbar({
      open: true,
      message: editingUser ? 'ユーザーを更新しました' : 'ユーザーを登録しました',
    });
  };

  const handleToggleActive = async (user: User) => {
    if (user.isActive) {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setSnackbar({ open: true, message: data.error || '無効化に失敗しました' });
        return;
      }
    } else {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        setSnackbar({ open: true, message: '有効化に失敗しました' });
        return;
      }
    }
    fetchUsers();
    setSnackbar({
      open: true,
      message: user.isActive ? 'ユーザーを無効化しました' : 'ユーザーを有効化しました',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          ユーザー管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          ユーザー登録
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ログインID</TableCell>
              <TableCell>表示名</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>権限</TableCell>
              <TableCell>状態</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ opacity: user.isActive ? 1 : 0.5 }}>
                <TableCell>{user.loginId}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? '管理者' : '事務'}
                    color={user.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? '有効' : '無効'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(user)}
                    color={user.isActive ? 'warning' : 'success'}
                  >
                    {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  ユーザーが登録されていません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 登録/編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'ユーザー編集' : '新規ユーザー登録'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="ログインID"
            fullWidth
            margin="normal"
            value={form.loginId}
            onChange={(e) => setForm({ ...form, loginId: e.target.value })}
            required
          />
          <TextField
            label="表示名"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextField
            label="メールアドレス"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label={editingUser ? 'パスワード（変更する場合のみ）' : 'パスワード'}
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingUser}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>権限</InputLabel>
            <Select
              value={form.role}
              label="権限"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="admin">管理者</MenuItem>
              <MenuItem value="office">事務</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? '更新' : '登録'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
