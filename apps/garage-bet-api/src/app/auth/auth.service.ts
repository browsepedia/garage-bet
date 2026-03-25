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
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../services/prisma-service';

const scryptAsync = promisify(scrypt);

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
  } as const;

  private async issueAccessToken(user: { id: string; email: string | null }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
  }

  private generateRefreshToken() {
    return randomBytes(48).toString('base64url');
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

  private async issueAuthTokens(user: { id: string; email: string | null }) {
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

  /** Returns userId that owns this device, if any. */
  private async findUserIdByDeviceId(deviceId: string): Promise<string | null> {
    const row = await this.prisma.userDevice.findUnique({
      where: { deviceId },
      select: { userId: true },
    });
    return row?.userId ?? null;
  }

  /**
   * Links device to user if new; no-op if already linked to same user.
   * Fails if device belongs to another account.
   */
  private async linkDeviceToUser(userId: string, deviceId: string) {
    const existing = await this.prisma.userDevice.findUnique({
      where: { deviceId },
      select: { userId: true },
    });
    if (existing) {
      if (existing.userId === userId) {
        return;
      }
      throw new UnauthorizedException(
        'This device is registered to a different account.',
      );
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

    const row = await this.prisma.userDevice.findUnique({
      where: { deviceId },
      select: { userId: true },
    });
    if (!row || row.userId !== user.id) {
      throw new ForbiddenException(
        'This device is not linked to your account.',
      );
    }

    await this.prisma.userDevice.update({
      where: { deviceId },
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

  async register(dto: RegisterFormModel) {
    if (!dto.deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const deviceOwnerId = await this.findUserIdByDeviceId(dto.deviceId);
    if (deviceOwnerId) {
      throw new ConflictException(
        'This device is already registered. Log in or use another device.',
      );
    }

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
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
    const userId = await this.findUserIdByDeviceId(trimmed);
    return { registered: Boolean(userId) };
  }

  /**
   * Device-only registration — one device per account; fails if device already registered.
   */
  async registerDeviceAccount(deviceId: string, displayName?: string) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    const existingOwner = await this.findUserIdByDeviceId(deviceId);
    if (existingOwner) {
      throw new ConflictException(
        'This device is already registered. Log in instead.',
      );
    }

    const trimmedName = displayName?.trim();
    const user = await this.prisma.user.create({
      data: {
        ...(trimmedName && trimmedName.length > 0 ? { name: trimmedName } : {}),
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

    const userId = await this.findUserIdByDeviceId(deviceId);
    if (!userId) {
      throw new NotFoundException(
        'No account for this device. Register on this device first.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        where: { id: userId },
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

    const userId = await this.findUserIdByDeviceId(deviceId);
    if (!userId) {
      throw new NotFoundException(
        'No account for this device. Register on this device first.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userProfileSelect,
    });
    if (!user) {
      throw new NotFoundException(
        'No account for this device. Register on this device first.',
      );
    }

    const hasEmail = Boolean(user.email?.trim());
    if (hasEmail) {
      throw new ForbiddenException(
        'This account uses email sign-in. Please log in with your email.',
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
      return await this.jwtService.verifyAsync<{ sub?: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
