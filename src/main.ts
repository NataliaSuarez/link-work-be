import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as admin from 'firebase-admin';
import * as serviceAccount from '../linwork-e9364-firebase-adminsdk-n5f70-08dd1fcd8a.json';

import { AppModule } from './app.module';
import { LoggerService } from './loggerService/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Link Work API')
    .setDescription('Link Work API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  app.enableCors();
  await app.listen(process.env.PORT || 80);
}
bootstrap();
