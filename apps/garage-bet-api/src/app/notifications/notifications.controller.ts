import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('set-push-token')
  async setPushToken(
    @Body() body: { expoPushToken: string },
    @Headers('authorization') authorization?: string,
  ) {
    try {
      await this.notificationsService.saveToken(
        body.expoPushToken,
        authorization,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return { ok: true as const };
  }
}
