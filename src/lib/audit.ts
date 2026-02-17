import { prisma } from '@/lib/prisma';

interface AuditLogParams {
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  summary: string;
  detail?: Record<string, unknown>;
}

export async function writeAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        summary: params.summary,
        detail: params.detail ? JSON.stringify(params.detail) : '',
      },
    });
  } catch (e) {
    console.error('[AuditLog] Failed to write audit log:', e);
  }
}
