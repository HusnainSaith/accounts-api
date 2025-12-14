import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RLSService } from '../services/rls.service';
<<<<<<< HEAD

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
=======
import { DataSource } from 'typeorm';

@Injectable()
export class RLSMiddleware implements NestMiddleware {
  constructor(
    private readonly rlsService: RLSService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (user && user.sub) {
      try {
        // Get company ID from CompanyUser relationship or header
        let companyId = req.headers['x-company-id'] as string;
        
        if (!companyId && user.sub) {
          // Query CompanyUser to get company ID
          const result = await this.dataSource.query(
            'SELECT company_id FROM company_users WHERE user_id = $1 AND is_active = true LIMIT 1',
            [user.sub]
          );
          companyId = result[0]?.company_id;
        }

        if (companyId) {
          await this.rlsService.setCompanyContext(companyId);
          // Store companyId in request for later use
          (req as any).companyId = companyId;
        }

        // Clear context after response
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
        res.on('finish', async () => {
          try {
            await this.rlsService.clearCompanyContext();
          } catch (err) {
<<<<<<< HEAD
            console.error('[RLS] Error clearing tenant context on finish:', err);
=======
            console.error('[RLS] Error clearing tenant context:', err);
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
          }
        });
      } catch (error) {
        console.error('[RLS] Error setting tenant context:', error);
      }
    }

    next();
  }
}
