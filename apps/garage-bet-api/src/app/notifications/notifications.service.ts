import { Injectable } from '@nestjs/common';
import Expo from 'expo-server-sdk';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../services/prisma-service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async saveToken(authorizationHeader: string, token: string): Promise<void> {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Invalid Expo push token: ${token}`);
    }

    const user = await this.authService.me(authorizationHeader);
    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.userDevice.update({
      data: {
        expoPushToken: token,
        expoPushTokenUpdatedAt: new Date(),
      },
      where: {
        id: user.id,
      },
    });
  }
}
