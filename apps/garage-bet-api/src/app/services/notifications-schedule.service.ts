import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PrismaService } from './prisma-service';

@Injectable()
export class NotificationsScheduleService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('0 * * * *')
  async checkMatchesStartingSoon() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 1000 * 60 * 60);

    const matches = await this.prisma.match.findMany({
      where: {
        kickoffAt: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      select: {
        homeTeam: {
          select: {
            name: true,
          },
        },
        awayTeam: {
          select: {
            name: true,
          },
        },
      },
    });

    const devicePushNotificationTokens = await this.prisma.userDevice.findMany({
      select: {
        expoPushToken: true,
      },
    });

    if (matches.length === 1) {
      const match = matches[0];

      if (devicePushNotificationTokens.length > 0) {
        await this.notificationsService.sendNotification(
          devicePushNotificationTokens.map((device) => device.expoPushToken),
          'Match starting soon',
          `The match ${match.homeTeam.name} vs ${match.awayTeam.name} is starting in 1 hour`,
        );
      }
    }

    if (matches.length > 1) {
      if (devicePushNotificationTokens.length > 0) {
        await this.notificationsService.sendNotification(
          devicePushNotificationTokens.map((device) => device.expoPushToken),
          'Matches starting soon',
          `There are ${matches.length} matches starting in 1 hour`,
          {
            type: 'matches-starting-soon',
          },
        );
      }
    }
  }
}
