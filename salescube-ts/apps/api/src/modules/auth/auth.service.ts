import { Injectable } from '@nestjs/common';
import type { LoginInput, LoginResponse } from '@salescube/shared';

@Injectable()
export class AuthService {
  constructor() {
    console.log('AuthService constructor called - no dependencies');
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    console.log('AuthService.login called with mock implementation');
    
    // Mock response for testing
    return {
      accessToken: 'mock-token',
      expiresIn: 604800,
      user: {
        id: 'mock-id',
        code: input.code,
        email: 'admin@example.com',
        name: 'Mock User',
        roles: ['ADMIN'],
        permissions: ['CUSTOMERS_READ', 'CUSTOMERS_WRITE'],
      },
    };
  }
}

function parseExpiresInSeconds(s: string): number {
  const m = /^(\d+)([smhd])$/.exec(s);
  if (!m) return 7 * 86400;
  const n = Number(m[1]);
  const unit = m[2];
  return n * { s: 1, m: 60, h: 3600, d: 86400 }[unit as 's' | 'm' | 'h' | 'd'];
}
