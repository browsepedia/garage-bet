import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { buildEmailVerifiedAppDeepLink } from '../config/deep-link';
import { publicApiBaseUrlFromRequest } from '../config/public-request-url';
import { AuthService } from './auth.service';
import { verifyEmailErrorPage } from './verify-email-browser';

type LoginRequestBody = LoginFormModel & { deviceId?: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterFormModel, @Req() req: Request) {
    const requestPublicBaseUrl = publicApiBaseUrlFromRequest(req);
    if (!requestPublicBaseUrl) {
      throw new BadRequestException(
        'Cannot determine this API public URL from the request (missing Host).',
      );
    }
    return this.service.register(dto, { requestPublicBaseUrl });
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
   * Email verification link: `GET ...?token=<emailVerificationToken>`.
   * Public; no auth header. Alias `verify-email` for templates that use that path.
   * Browsers (`Accept: text/html`) get a 302 to `/(auth)/email-verified`; API clients get JSON.
   */
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
