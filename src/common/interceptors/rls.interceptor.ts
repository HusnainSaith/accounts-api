import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DataSource } from 'typeorm';

@Injectable()
export class RLSInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId;

    if (companyId) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        await queryRunner.query(`SET app.current_company_id = '${companyId}'`);
        request.queryRunner = queryRunner;
      } catch (error) {
        await queryRunner.release();
        throw error;
      }

      return next.handle().pipe(
        finalize(async () => {
          if (queryRunner && !queryRunner.isReleased) {
            await queryRunner.release();
          }
        })
      );
    }

    return next.handle();
  }
}
