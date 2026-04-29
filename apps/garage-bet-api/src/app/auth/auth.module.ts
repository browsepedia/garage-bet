import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from '../services/email/email-service';
import { PrismaService } from '../services/prisma-service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-only-change-me',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
