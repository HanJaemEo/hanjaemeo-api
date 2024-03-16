import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { EnvService } from './common/service/env/env.service';

const bootstrap = async () => {
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create(AppModule, { cors: true });

  // app.register(fastifyCompress, {
  //   encodings: ['gzip', 'deflate'],
  // });
  // app.register(fastifyCors, {
  //   origin: '*',
  // });
  // app.register(fastifyHelmet, {
  //   contentSecurityPolicy: {
  //     directives: {
  //       imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
  //       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
  //       manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
  //       frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
  //     },
  //   },
  //   crossOriginEmbedderPolicy: false,
  // });
  // app.register(fastifyRateLimit, {
  //   max: 100,
  //   timeWindow: '1 minute',
  // });

  const port = app.get(EnvService).Port;

  logger.log(`HanJaemEo API API is running on port ${port} 🚀`);

  await app.listen(port, '0.0.0.0');
};

bootstrap();
