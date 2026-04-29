import { RegisterFormModel } from '@garage-bet/models';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';

/**
 * Public base URL of the API (no trailing slash), e.g. https://garage-bet-api.herokuapp.com
 * Used to build verification links in outgoing email.
 */
function apiPublicBaseUrl(): string {
  const raw = process.env.API_PUBLIC_URL?.trim() || '';
  return raw.replace(/\/$/, '');
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor() {
    const key = process.env.RESEND_API_KEY?.trim();
    this.resend = key ? new Resend(key) : null;
  }

  buildEmailVerificationLink(token: string): string {
    const base = apiPublicBaseUrl();
    const pathSuffix = '/api/auth/confirm-email';
    const qs = new URLSearchParams({ token }).toString();
    return base ? `${base}${pathSuffix}?${qs}` : `${pathSuffix}?${qs}`;
  }

  async sendVerificationEmail(
    registerForm: RegisterFormModel,
    token: string,
  ): Promise<void> {
    const verificationUrl = this.buildEmailVerificationLink(token);
    const html = this.loadTemplate('verify-email-template', {
      name: registerForm.name?.trim() || 'there',
      verificationUrl,
      unsubscribeUrl: verificationUrl,
    });

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY not set; verification email not sent. Link: ' +
          verificationUrl,
      );
      return;
    }

    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!from) {
      this.logger.warn(
        'RESEND_FROM_EMAIL not set; verification email not sent',
      );
      return;
    }

    await this.resend.emails.send({
      from,
      to: registerForm.email,
      subject: 'Confirm your email — Garage Bet',
      html,
    });
  }

  private loadTemplate(name: string, vars: Record<string, string>): string {
    const fileName = name.endsWith('.html') ? name : `${name}.html`;
    const file = path.join(
      __dirname,
      'assets',
      'email-templates',
      fileName,
    );
    let html = fs.readFileSync(file, 'utf-8');
    for (const [key, val] of Object.entries(vars)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    return html;
  }
}
