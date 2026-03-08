import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

type LoginRequestBody = LoginFormModel & { deviceId?: string };
type AnonymousLoginBody = { deviceId: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterFormModel) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginRequestBody) {
    try {
      return this.service.login(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('anonymous')
  anonymousLogin(@Body() dto: AnonymousLoginBody) {
    return this.service.anonymousLogin(dto.deviceId);
  }
}
