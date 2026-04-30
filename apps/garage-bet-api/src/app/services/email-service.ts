import { RegisterFormModel } from '@garage-bet/models';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor() {
    const key = process.env.RESEND_API_KEY?.trim();
    this.resend = key ? new Resend(key) : null;
  }

  buildPasswordResetLink(token: string): string {
    const base = 'https://garage-bet-api-5f371ca7b557.herokuapp.com/api';
    const qs = new URLSearchParams({ token }).toString();
    return `${base}/auth/reset-password?${qs}`;
  }

  async sendPasswordResetEmail(
    user: { email: string; name: string | null },
    token: string,
  ): Promise<void> {
    const resetUrl = this.buildPasswordResetLink(token);
    const html = this.loadTemplate('reset-password-template', {
      name: user.name?.trim() || 'there',
      resetUrl,
    });

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY not set; password reset email not sent. Link: ' +
          resetUrl,
      );
      return;
    }

    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!from) {
      this.logger.warn(
        'RESEND_FROM_EMAIL not set; password reset email not sent',
      );
      return;
    }

    await this.resend.emails.send({
      from,
      to: user.email,
      subject: 'Reset your password — Garage Bet',
      html,
    });
  }

  buildEmailVerificationLink(token: string): string {
    const base = 'https://garage-bet-api-5f371ca7b557.herokuapp.com/api';
    const pathSuffix = '/auth/confirm-email';
    const qs = new URLSearchParams({ token }).toString();
    return `${base}${pathSuffix}?${qs}`;
  }

  async sendVerificationEmail(
    registerForm: RegisterFormModel,
    token: string,
  ): Promise<void> {
    const verificationUrl = this.buildEmailVerificationLink(token);
    const html = this.loadTemplate('verify-email-template', {
      name: registerForm.name?.trim() || 'there',
      verificationUrl,
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
    const file = path.join(__dirname, 'assets', 'email-templates', fileName);
    let html = fs.readFileSync(file, 'utf-8');
    for (const [key, val] of Object.entries(vars)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    return html;
  }
}
