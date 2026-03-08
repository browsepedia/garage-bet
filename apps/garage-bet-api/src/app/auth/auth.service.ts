import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../services/prisma-service';

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

    const existingUserByDevice = await this.prisma.user.findUnique({
      where: { deviceId: dto.deviceId },
    });

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (
      existingUserByEmail &&
      (!existingUserByDevice ||
        existingUserByEmail.id !== existingUserByDevice.id)
    ) {
      throw new ConflictException('Email already registered');
    }

    const user = existingUserByDevice
      ? await this.prisma.user.update({
          where: { id: existingUserByDevice.id },
          data: {
            email: dto.email,
            name: dto.name,
            deviceId: dto.deviceId,
          },
          select: this.userProfileSelect,
        })
      : await this.prisma.user.create({
          data: {
            email: dto.email,
            name: dto.name,
            deviceId: dto.deviceId,
          },
          select: this.userProfileSelect,
        });

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);

    return { user, accessToken, refreshToken };
  }

  private async loginAnonymousByDeviceId(deviceId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { deviceId },
      select: this.userProfileSelect,
    });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          deviceId,
          name: 'Guest',
        },
        select: this.userProfileSelect,
      }));

    const { accessToken, refreshToken } = await this.issueAuthTokens(user);
    return { accessToken, refreshToken };
  }

  async anonymousLogin(deviceId: string) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    return this.loginAnonymousByDeviceId(deviceId);
  }

  async login(dto: LoginFormModel & DeviceLoginInput) {
    if (dto.deviceId && (!dto.email || !dto.password)) {
      return this.anonymousLogin(dto.deviceId);
    }

    if (!dto.email || !dto.password || !dto.deviceId) {
      throw new BadRequestException('Email and password are required');
    }

    // TODO: Add password hash verification once password auth is modeled in Prisma.
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        ...this.userProfileSelect,
        deviceId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.deviceId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { deviceId: dto.deviceId },
      });
    } else if (user.deviceId !== dto.deviceId) {
      throw new UnauthorizedException('Device mismatch');
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
      return await this.jwtService.verifyAsync<{ sub?: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
