export type SecurityEventType =
  | 'UNAUTHORIZED_ADMIN_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ADMIN_REFUND_EXECUTED'
  | 'SUSPICIOUS_DOWNLOAD_ATTEMPT'
  | 'WEBHOOK_SIGNATURE_FAILURE'
  | 'INVALID_PAYMENT_PAYLOAD';

export interface SecurityEventPayload {
  eventType: SecurityEventType;
  ip?: string;
  path?: string;
  method?: string;
  userId?: string | null;
  orderCode?: string;
  details?: Record<string, any>;
}

/**
 * Structured Security Audit Logger
 * Formats events with standardized metadata for Vercel/Cloud logging ingestion.
 */
export function logSecurityEvent(payload: SecurityEventPayload) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    level: 'WARN',
    timestamp,
    service: 'papayey-security',
    ...payload,
  };

  // Structured JSON log line for observability platforms (Vercel Log Drains / Datadog)
  console.warn(`[SECURITY AUDIT] ${payload.eventType}:`, JSON.stringify(logEntry));
}
