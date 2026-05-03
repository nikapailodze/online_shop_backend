require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const express = require('express');
const { AppModule } = require('./modules/app.module');
const { config } = require('./shared/config');
const { initializeDatabase } = require('./shared/bootstrap');

async function bootstrap() {
  console.log('[bootstrap] Initializing database...');
  await initializeDatabase();
  console.log('[bootstrap] Creating Nest application...');
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

  console.log(`[bootstrap] Starting HTTP server on ${config.host}:${config.port}...`);
  await app.listen(config.port, config.host);
  console.log(`[bootstrap] API running at http://${config.host}:${config.port}`);
}

bootstrap().catch((error) => {
  console.error('[bootstrap] Startup failed:', error);
  process.exit(1);
});
