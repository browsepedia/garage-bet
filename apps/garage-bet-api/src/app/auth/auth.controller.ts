import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  buildChangePasswordAppDeepLink,
  buildEmailVerifiedAppDeepLink,
} from '../config/deep-link';
import { AuthService } from './auth.service';
import { verifyEmailErrorPage } from './verify-email-browser';

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
   * Redirects to the app's change-password screen with the token.
   */
  @Get('reset-password')
  resetPasswordRedirect(
    @Query('token') token: string | undefined,
    @Res({ passthrough: false }) res: Response,
  ) {
    const t = token?.trim();
    if (!t) {
      return res
        .status(400)
        .type('text/html; charset=utf-8')
        .send('<p>Invalid or missing reset link.</p>');
    }
    return res.redirect(302, buildChangePasswordAppDeepLink(t));
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
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const msg = httpExceptionMessage(err);
        if (wantsHtml) {
          return res
            .status(status)
            .type('text/html; charset=utf-8')
            .send(verifyEmailErrorPage(msg, status));
        }
      }
      throw err;
    }
  }
}

function httpExceptionMessage(e: HttpException): string {
  const r = e.getResponse();
  if (typeof r === 'string') return r;
  if (r && typeof r === 'object' && 'message' in r) {
    const m = (r as { message: string | string[] }).message;
    return Array.isArray(m) ? m.join(', ') : String(m);
  }
  return e.message;
}
