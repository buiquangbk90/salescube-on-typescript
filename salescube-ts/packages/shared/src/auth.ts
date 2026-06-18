import { z } from 'zod';

/**
 * Auth shared schemas + types.
 */

export const loginSchema = z.object({
  code: z.string().trim().min(1, 'Mã đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  code: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
