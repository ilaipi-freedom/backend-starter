import { createServer } from 'net';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as bodyParser from 'body-parser';

const serverBootstrap = async (mo: any) => {
  const app = await NestFactory.create<NestExpressApplication>(mo, {
    bufferLogs: true,
  });
  app.set('query parser', 'extended');
  const configService = app.get(ConfigService);
  const appInstance = configService.get<string>('env.appInstance');
  const { appPort, apiPrefix } = configService.get<{
    appPort: number;
    apiPrefix: string;
  }>('env.bootstrap');
  app.setGlobalPrefix(apiPrefix);
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle(`${appInstance} API`)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(appInstance)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/apidocs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(appPort);
  logger.log(`${appInstance} start at ${appPort}`);
};

const cliBootstrap = async (mo: any, keepAlive = true) => {
  const app = await NestFactory.createApplicationContext(mo, {
    bufferLogs: true,
  });
  await app.init();
  const configService = app.get(ConfigService);
  const appInstance = configService.get<string>('env.appInstance');
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();
  if (!keepAlive) {
    logger.log(`${appInstance} app done`);
    return;
  }
  logger.log(`${appInstance} app start`);
  // keep alive
  createServer().listen();
};

export { serverBootstrap, cliBootstrap };
