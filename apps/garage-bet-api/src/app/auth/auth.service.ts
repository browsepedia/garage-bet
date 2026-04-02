import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../services/prisma-service';

const scryptAsync = promisify(scrypt);

/** Hours until the email confirmation link stops working. */
const EMAIL_VERIFICATION_TTL_HOURS = 72;

type DeviceLoginInput = {
  deviceId?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

  /**
   * The at-most-one user with no email linked to this deviceId (business rule:
   * only one device-only account per device id; email users may share the same device id).
   */
  private async findDeviceOnlyUserForDevice(
    deviceId: string,
  ): Promise<User | null> {
    const row = await this.prisma.userDevice.findFirst({
      where: {
        deviceId,
        user: { email: null },
      },
      include: { user: true },
    });
    return row?.user ?? null;
  }

  /** One UserDevice row per (userId, deviceId). Many users may share deviceId if at most one has email null. */
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

  /**
   * Completes email verification from a link. Device-only users never receive a token;
   * they are created with emailVerifiedAt already set.
   */
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

    if (!row?.email) {
      throw new NotFoundException('Invalid or expired verification link');
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
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const verifyToken = this.generateEmailVerificationToken();

    const user = await this.prisma.user.create({
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

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);

    return { user, accessToken, refreshToken };
  }

  /** Public check for the app register screen (no tokens). */
  async getDeviceRegistrationStatus(deviceId: string) {
    const trimmed = deviceId?.trim();
    if (!trimmed) {
      throw new BadRequestException('Device ID is required');
    }
    const row = await this.prisma.userDevice.findFirst({
      where: {
        deviceId: trimmed,
        user: { email: null },
      },
      include: { user: true },
    });
    const user = row?.user ?? null;
    return { registered: Boolean(user), user };
  }

  /**
   * Device-only registration — one null-email user per deviceId. Other users may share the
   * same deviceId as long as they have an email.
   */
  async registerDeviceAccount(deviceId: string, displayName?: string) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const deviceOnlyExists = await this.findDeviceOnlyUserForDevice(deviceId);
    if (deviceOnlyExists) {
      throw new ConflictException(
        'This device already has a device-only account. Sign in with device, or register with email for a separate account.',
      );
    }

    const trimmedName = displayName?.trim();
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        ...(trimmedName && trimmedName.length > 0 ? { name: trimmedName } : {}),
        emailVerifiedAt: now,
        devices: {
          create: { deviceId },
        },
      },
      select: this.userProfileSelect,
    });

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);
    return { accessToken, refreshToken };
  }

  /**
   * Device-only login — this device must already be linked to an account.
   */
  async loginDeviceAccount(deviceId: string, displayName?: string) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const deviceOnly = await this.findDeviceOnlyUserForDevice(deviceId);
    if (!deviceOnly) {
      throw new NotFoundException(
        'No device-only account for this device. Register or sign in with email.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: deviceOnly.id },
      select: this.userProfileSelect,
    });
    if (!user) {
      throw new NotFoundException(
        'No account for this device. Register on this device first.',
      );
    }

    const trimmed = displayName?.trim();
    if (trimmed && trimmed.length > 0 && user.name !== trimmed) {
      await this.prisma.user.update({
        where: { id: deviceOnly.id },
        data: { name: trimmed },
      });
    }

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);
    return { accessToken, refreshToken };
  }

  /**
   * Silent bootstrap for the mobile app: issue tokens only if this device belongs to a
   * user without email (device-only account). Email/password accounts must sign in explicitly.
   */
  async autoLoginDeviceOnlyUser(deviceId: string) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const user = await this.findDeviceOnlyUserForDevice(deviceId);
    if (!user) {
      throw new NotFoundException(
        'No device-only account for this device. Register or sign in with email.',
      );
    }

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginFormModel & DeviceLoginInput) {
    if (dto.deviceId && (!dto.email || !dto.password)) {
      return this.loginDeviceAccount(dto.deviceId);
    }

    if (!dto.email || !dto.password || !dto.deviceId) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        ...this.userProfileSelect,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await this.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.linkDeviceToUser(user.id, dto.deviceId);

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
