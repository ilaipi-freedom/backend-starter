import { createServer } from 'net';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { CliModule } from './cli.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule);
  await app.init();
  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.log('queue-consumer app start');
  // keep alive
  createServer().listen();
}
export default bootstrap;
