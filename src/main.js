require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const express = require('express');
const { AppModule } = require('./modules/app.module');
const { config } = require('./shared/config');
const { initializeDatabase } = require('./shared/bootstrap');

async function bootstrap() {
  await initializeDatabase();
  const app = await NestFactory.create(AppModule);
  const bodyLimit = '25mb';

  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: false,
    }),
  );

  const origins = config.corsOrigins;
  app.enableCors({
    origin: origins.length ? origins : true,
  });

  await app.listen(config.port, '0.0.0.0');
}

bootstrap();
