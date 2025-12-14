import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RLSService } from '../services/rls.service';

@Injectable()
export class RLSMiddleware implements NestMiddleware {
  constructor(private readonly rlsService: RLSService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Assumes an authenticated user has been attached to req.user by auth middleware
    const user = (req as any).user;

    if (user && user.companyId) {
      try {
        await this.rlsService.setCompanyContext(user.companyId);
        // Clear the context after the response finishes to avoid leaking state
        res.on('finish', async () => {
          try {
            await this.rlsService.clearCompanyContext();
          } catch (err) {
            console.error('[RLS] Error clearing tenant context on finish:', err);
          }
        });
      } catch (error) {
        console.error('[RLS] Error setting tenant context:', error);
      }
    }

    next();
  }
}
