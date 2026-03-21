import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_API_KEY?.trim();
    if (!expected) {
      throw new ForbiddenException('Admin API is not configured');
    }
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-admin-key'];
    const provided = Array.isArray(key) ? key[0] : key;
    if (provided !== expected) {
      throw new ForbiddenException('Invalid admin key');
    }
    return true;
  }
}
