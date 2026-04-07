import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

type LoginRequestBody = LoginFormModel & { deviceId?: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterFormModel) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginRequestBody) {
    return this.service.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: { email: string }) {
    return this.service.forgotPassword(dto.email);
  }

  /**
   * Link from confirmation email: `?token=` from `emailVerificationToken`.
   * Public; no auth header.
   */
  @Get('confirm-email')
  confirmEmail(@Query('token') token: string | undefined) {
    return this.service.confirmEmailByToken(token);
  }
}
