import { fastifyCompress } from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyRateLimit } from '@fastify/rate-limit';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { EnvService } from './common/service/env/env.service';

const bootstrap = async () => {
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.register(fastifyCompress, {
    encodings: ['gzip', 'deflate'],
  });
  app.register(fastifyCors, {
    origin: true,
  });
  app.register(fastifyHelmet);
  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  const port = app.get(EnvService).Port;

  logger.log(`HanJaemEo API API is running on port ${port} 🚀`);

  await app.listen(port, '0.0.0.0');
};

bootstrap();
