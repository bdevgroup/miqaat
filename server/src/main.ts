import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

export async function bootstrap(portOverride?: number): Promise<number> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: false });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = portOverride ?? Number(process.env.PORT ?? 3001);
  await app.listen(port, '127.0.0.1');
  Logger.log(`Miqāt server listening on http://127.0.0.1:${port}/api`, 'Bootstrap');
  return port;
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}
