import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('me')
  getMe(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }

  @Post('me/push-token')
  registerPushToken(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { deviceId: string; expoPushToken: string },
  ) {
    return this.authService.registerExpoPushToken(authorization, body);
  }
}
