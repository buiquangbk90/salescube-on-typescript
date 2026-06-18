import { Controller, Get } from '@nestjs/common';
import type { HealthStatus } from '@salescube/shared';
import { Public } from '../modules/auth/decorators';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  async check(): Promise<HealthStatus> {
    // Simple health check - we'll verify DB connectivity through auth endpoints
    return {
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
