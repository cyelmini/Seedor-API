import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../../api/auth/auth.service';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
