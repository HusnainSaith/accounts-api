import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithCompany {
  companyId?: string;
  user?: {
    companyId?: string;
  };
}

export const CompanyContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithCompany>();
    // Use companyId set by RLS middleware, fallback to user.companyId for backward compatibility
    return request.companyId || request.user?.companyId;
  },
);
