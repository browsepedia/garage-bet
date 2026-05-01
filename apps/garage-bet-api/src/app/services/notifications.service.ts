import { Injectable, Logger } from '@nestjs/common';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from './prisma-service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  private readonly expo = new Expo();

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

  public async sendNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: object,
  ): Promise<void> {
    const valid = tokens.filter((t) => Expo.isExpoPushToken(t));

    const messages: ExpoPushMessage[] = valid.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      data: data as Record<string, unknown>,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets: ExpoPushTicket[] =
          await this.expo.sendPushNotificationsAsync(chunk);
        this.handleTickets(tickets, valid);
      } catch (err) {
        this.logger.error('Push send failed', err);
      }
    }
  }

  private handleTickets(tickets: ExpoPushTicket[], tokens: string[]): void {
    tickets.forEach((ticket, i) => {
      if (ticket.status === 'error') {
        this.logger.warn(
          `Ticket error for token ${tokens[i]}: ${ticket.message}`,
        );

        if (ticket.details?.error === 'DeviceNotRegistered') {
          return;
        }
      }
    });
  }
}
