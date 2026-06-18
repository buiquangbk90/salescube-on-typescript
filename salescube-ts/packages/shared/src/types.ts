/**
 * Shared TypeScript types across apps.
 */

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  db: 'connected' | 'disconnected';
  timestamp: string;
}
