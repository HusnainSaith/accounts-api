import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'https://your-frontend-domain.com'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // API documentation removed

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Hisab Accounting API running on port ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard/stats`);
  console.log(`🔐 Auth: http://localhost:${port}/auth/login`);
}

bootstrap();
