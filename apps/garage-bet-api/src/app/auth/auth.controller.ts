import { LoginFormModel, RegisterFormModel } from '@garage-bet/models';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterFormModel) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginFormModel) {
    console.log('Login request received');
    try {
      return this.service.login(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
