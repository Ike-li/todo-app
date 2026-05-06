import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();

  // Validate production secrets
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'dev-secret-change-in-production')
  ) {
    console.error(
      'WARNING: JWT_SECRET is not set or using default value in production!',
    );
    process.exit(1);
  }

  // Compression middleware (before request logging so responses are compressed)
  app.use(compression());

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
      if (res.statusCode >= 400) {
        console.error(log);
      } else {
        console.log(log);
      }
    });
    next();
  });

  app.use(helmet());

  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo App API')
    .setDescription(
      'REST API for managing todos with categories, tags, priorities, and sub-tasks',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoint')
    .addTag('auth', 'Authentication endpoints')
    .addTag('todos', 'Todo CRUD operations')
    .addTag('categories', 'Category management')
    .addTag('tags', 'Tag management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
