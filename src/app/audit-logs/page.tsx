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
  Paper,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';
import { formatDate } from '@/lib/format';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  detail: string;
  createdAt: string;
}

const entityLabels: Record<string, string> = {
  Patient: '患者',
  Transaction: '取引',
  User: 'ユーザー',
  Ward: '病棟',
  Product: '商品',
};

const actionColors: Record<string, 'success' | 'info' | 'error'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
};

const actionLabels: Record<string, string> = {
  CREATE: '登録',
  UPDATE: '更新',
  DELETE: '削除',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (entityFilter) params.set('entity', entityFilter);
    params.set('limit', String(rowsPerPage));
    params.set('offset', String(page * rowsPerPage));

    fetch(`/api/audit-logs?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      })
      .catch((e) => console.error('audit-logs fetch error:', e))
      .finally(() => setLoading(false));
  }, [entityFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          操作ログ
        </Typography>
      </Box>

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>対象</InputLabel>
          <Select
            value={entityFilter}
            label="対象"
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">すべて</MenuItem>
            <MenuItem value="Patient">患者</MenuItem>
            <MenuItem value="Transaction">取引</MenuItem>
            <MenuItem value="User">ユーザー</MenuItem>
            <MenuItem value="Ward">病棟</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日時</TableCell>
                  <TableCell>操作者</TableCell>
                  <TableCell>操作</TableCell>
                  <TableCell>対象</TableCell>
                  <TableCell>概要</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      操作ログがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>
                        <Chip
                          label={actionLabels[log.action] || log.action}
                          color={actionColors[log.action] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{entityLabels[log.entity] || log.entity}</TableCell>
                      <TableCell>{log.summary}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="表示件数"
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </>
      )}
    </Box>
  );
}
