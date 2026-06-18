// Basic types that work
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  db: 'connected' | 'disconnected';
  timestamp: string;
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

// Essential exports for all modules with explicit file extensions
export * from './customer.js';
export * from './auth.js';
export * from './product.js';
export * from './sales-order.js';
