import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { loginSchema, type AuthUser, type LoginInput } from '@salescube/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';

@Controller('auth')
export class AuthController {
  constructor() {
    console.log('AuthController constructor called - no dependencies');
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    console.log('AuthController.login called with mock implementation');
    
    // Direct mock response without dependency injection
    return {
      accessToken: 'mock-token',
      expiresIn: 604800,
      user: {
        id: 'mock-id',
        code: body.code,
        email: 'admin@example.com',
        name: 'Mock User',
        roles: ['ADMIN'],
        permissions: ['CUSTOMERS_READ', 'CUSTOMERS_WRITE'],
      },
    };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
