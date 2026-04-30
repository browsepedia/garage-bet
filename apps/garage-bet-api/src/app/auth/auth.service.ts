import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { EmailService } from '../services/email-service';
import { PrismaService } from '../services/prisma-service';

const scryptAsync = promisify(scrypt);

/** Hours until the email confirmation link stops working. */
const EMAIL_VERIFICATION_TTL_HOURS = 72;

type DeviceLoginInput = {
  deviceId?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private readonly userProfileSelect = {
    avatarUrl: true,
    id: true,
    email: true,
    name: true,
    createdAt: true,
    emailVerifiedAt: true,
    isAdmin: true,
  } as const;

  private async issueAccessToken(user: {
    id: string;
    email: string | null;
    isAdmin: boolean;
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  private generateRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  private generateEmailVerificationToken() {
    return randomBytes(32).toString('base64url');
  }

  private newEmailVerificationExpiry(): Date {
    const d = new Date();
    d.setHours(d.getHours() + EMAIL_VERIFICATION_TTL_HOURS);
    return d;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    return expiresAt;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${buf.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    stored: string,
  ): Promise<boolean> {
    const [salt, keyHex] = stored.split(':');
    if (!salt || !keyHex) return false;
    const keyBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedBuf = Buffer.from(keyHex, 'hex');
    if (keyBuf.length !== storedBuf.length) return false;
    return timingSafeEqual(keyBuf, storedBuf);
  }

  private async issueAuthTokens(user: {
    id: string;
    email: string | null;
    isAdmin: boolean;
  }) {
    const accessToken = await this.issueAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }

  /** One UserDevice row per (userId, deviceId). Links this install to the user. */
  private async linkDeviceToUser(userId: string, deviceId: string) {
    const existing = await this.prisma.userDevice.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
    if (existing) {
      return;
    }
    await this.prisma.userDevice.create({
      data: { userId, deviceId },
    });
  }

  /**
   * Stores Expo push token for a device row that already belongs to the user.
   */
  async registerExpoPushToken(
    authorizationHeader: string | undefined,
    body: { deviceId: string; expoPushToken: string },
  ) {
    const user = await this.me(authorizationHeader);
    const deviceId = body.deviceId?.trim();
    const expoPushToken = body.expoPushToken?.trim();
    if (!deviceId || !expoPushToken) {
      throw new BadRequestException('deviceId and expoPushToken are required');
    }

    const row = await this.prisma.userDevice.findFirst({
      where: { userId: user.id, deviceId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!row) {
      throw new ForbiddenException(
        'This device is not linked to your account.',
      );
    }

    await this.prisma.userDevice.update({
      where: { id: row.id },
      data: {
        expoPushToken,
        expoPushTokenUpdatedAt: new Date(),
      },
    });

    return { ok: true as const };
  }

  async me(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.verifyAccessToken(token);
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: this.userProfileSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async confirmEmailByToken(rawToken: string | undefined) {
    const token = rawToken?.trim();
    if (!token) {
      throw new BadRequestException('Missing token');
    }

    const row = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        email: true,
        emailVerificationExpiresAt: true,
        emailVerifiedAt: true,
      },
    });

    if (!row) {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    if (row.emailVerifiedAt) {
      return {
        ok: true as const,
        alreadyVerified: true as const,
        emailVerifiedAt: row.emailVerifiedAt.toISOString(),
      };
    }

    if (
      !row.emailVerificationExpiresAt ||
      row.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Verification link has expired');
    }

    const verifiedAt = new Date();
    await this.prisma.user.update({
      where: { id: row.id },
      data: {
        emailVerifiedAt: verifiedAt,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return {
      ok: true as const,
      alreadyVerified: false as const,
      emailVerifiedAt: verifiedAt.toISOString(),
    };
  }

  async register(dto: RegisterFormModel) {
    if (!dto.deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, emailVerifiedAt: true, email: true },
    });

    if (existingUserByEmail?.emailVerifiedAt) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const verifyToken = this.generateEmailVerificationToken();

    let user;

    if (existingUserByEmail) {
      // Unverified account: update credentials and resend verification email
      user = await this.prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          name: dto.name,
          passwordHash,
          emailVerificationToken: verifyToken,
          emailVerificationExpiresAt: this.newEmailVerificationExpiry(),
          devices: {
            upsert: {
              where: {
                userId_deviceId: {
                  userId: existingUserByEmail.id,
                  deviceId: dto.deviceId,
                },
              },
              create: { deviceId: dto.deviceId },
              update: {},
            },
          },
        },
        select: this.userProfileSelect,
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
          emailVerifiedAt: null,
          emailVerificationToken: verifyToken,
          emailVerificationExpiresAt: this.newEmailVerificationExpiry(),
          devices: {
            create: { deviceId: dto.deviceId },
          },
        },
        select: this.userProfileSelect,
      });
    }

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);

    void this.emailService
      .sendVerificationEmail(dto, verifyToken)
      .catch((err: unknown) => {
        this.logger.error(
          `sendVerificationEmail failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      });

    return { user, accessToken, refreshToken };
  }

  /**
   * Sends a password-reset email with a deep-link token.
   * Always returns { ok: true } to avoid leaking account existence.
   */
  async forgotPassword(email: string) {
    const trimmed = email?.trim().toLowerCase();
    if (!trimmed) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: trimmed },
      select: { id: true, email: true, name: true },
    });

    if (user?.email) {
      const resetToken = randomBytes(32).toString('base64url');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiresAt: expiresAt,
        },
      });

      void this.emailService
        .sendPasswordResetEmail(
          { email: user.email, name: user.name },
          resetToken,
        )
        .catch((err: unknown) => {
          this.logger.error(
            `sendPasswordResetEmail failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        });
    }

    return { ok: true as const };
  }

  async validatePasswordResetToken(token: string): Promise<void> {
    const trimmedToken = token?.trim();
    if (!trimmedToken) {
      throw new BadRequestException('Missing token');
    }

    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: trimmedToken },
      select: { id: true, passwordResetExpiresAt: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Reset link has expired');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const trimmedToken = token?.trim();
    if (!trimmedToken) {
      throw new BadRequestException('Missing token');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: trimmedToken },
      select: { id: true, passwordResetExpiresAt: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Reset link has expired');
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return { ok: true as const };
  }

  async login(dto: LoginFormModel & DeviceLoginInput) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        ...this.userProfileSelect,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnprocessableEntityException('Incorrect email or password');
    }

    const passwordOk = await this.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordOk) {
      throw new UnprocessableEntityException('Incorrect email or password');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    if (dto.deviceId) {
      await this.linkDeviceToUser(user.id, dto.deviceId);
    }

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);

    return { accessToken, refreshToken };
  }

  private extractBearerToken(header?: string) {
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
  }

  private async verifyAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<{
        sub?: string;
        isAdmin?: boolean;
      }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async meAdmin(authorizationHeader?: string) {
    const user = await this.me(authorizationHeader);
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return user;
  }
}
