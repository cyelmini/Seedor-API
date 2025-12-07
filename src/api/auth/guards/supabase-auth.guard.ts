import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, AuthUser } from '../auth.service';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
  token: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authorization.split(' ')[1];

    try {
      const user = await this.authService.validateToken(token);
      request.user = user;
      request.token = token;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
