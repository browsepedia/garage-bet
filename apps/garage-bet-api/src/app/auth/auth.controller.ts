import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

type LoginRequestBody = LoginFormModel & { deviceId?: string };
type DeviceAuthBody = { deviceId: string; name?: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterFormModel) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginRequestBody) {
    return this.service.login(dto);
  }

  /** Whether this device id is already linked to an account (no auth / no tokens). */
  @Post('device/status')
  deviceStatus(@Body() dto: { deviceId: string }) {
    return this.service.getDeviceRegistrationStatus(dto.deviceId);
  }

  /** Device-only account: device must not already be registered. */
  @Post('device/register')
  registerDevice(@Body() dto: DeviceAuthBody) {
    return this.service.registerDeviceAccount(dto.deviceId, dto.name);
  }

  /** Device-only account: device must already be registered (same device). */
  @Post('device/login')
  deviceLogin(@Body() dto: DeviceAuthBody) {
    return this.service.loginDeviceAccount(dto.deviceId, dto.name);
  }

  /**
   * App cold start: returns tokens only for device-only users (no email).
   * Returns 403 if the device is linked to an email account (must use email login).
   */
  @Post('device/auto')
  deviceAutoLogin(@Body() dto: { deviceId: string }) {
    return this.service.autoLoginDeviceOnlyUser(dto.deviceId);
  }
}
