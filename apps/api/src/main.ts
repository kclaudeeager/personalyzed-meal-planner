// =============================================================================
// API Entry Point
// =============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Web dashboard
      'http://localhost:8081', // Expo
    ],
    credentials: true,
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Adaptive Meal Platform API')
    .setDescription(
      'API for personalized meal recommendations tailored to Rwandan households',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile and preferences')
    .addTag('meals', 'Meal catalog and details')
    .addTag('recommendations', 'Personalized meal recommendations')
    .addTag('feedback', 'User meal feedback')
    .addTag('health', 'Health check')
    .addTag('meal-plans', 'Weekly meal planning')
    .addTag('shopping-lists', 'Shopping list management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.warn(`🍽️  Adaptive Meal Platform API running on http://localhost:${port}`);
  console.warn(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
