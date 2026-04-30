import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  buildChangePasswordAppDeepLink,
  buildEmailVerificationErrorDeepLink,
  buildEmailVerifiedAppDeepLink,
  buildPasswordResetErrorDeepLink,
} from '../config/deep-link';
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
   * Password-reset link from email: `GET ...?token=<passwordResetToken>`.
   * Validates the token, then redirects to change-password or the error screen.
   */
  @Get('reset-password')
  async resetPasswordRedirect(
    @Query('token') token: string | undefined,
    @Res({ passthrough: false }) res: Response,
  ) {
    const t = token?.trim();
    if (!t) {
      return res.redirect(302, buildPasswordResetErrorDeepLink());
    }
    try {
      await this.service.validatePasswordResetToken(t);
      return res.redirect(302, buildChangePasswordAppDeepLink(t));
    } catch {
      return res.redirect(302, buildPasswordResetErrorDeepLink());
    }
  }

  @Post('reset-password')
  resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.service.resetPassword(dto.token, dto.newPassword);
  }

  @Get(['confirm-email', 'verify-email'])
  async confirmEmail(
    @Query('token') token: string | undefined,
    @Headers('accept') accept: string | undefined,
    @Res({ passthrough: false }) res: Response,
  ) {
    const wantsHtml = accept?.includes('text/html') ?? false;
    try {
      const result = await this.service.confirmEmailByToken(token);
      if (wantsHtml) {
        return res.redirect(302, buildEmailVerifiedAppDeepLink());
      }
      return res.json(result);
    } catch (err) {
      if (wantsHtml) {
        return res.redirect(302, buildEmailVerificationErrorDeepLink());
      }
      throw err;
    }
  }
}
