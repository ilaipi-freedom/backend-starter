import { createServer } from 'net';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as bodyParser from 'body-parser';

const serverBootstrap = async (mo: any) => {
  const app = await NestFactory.create<NestExpressApplication>(mo);
  app.set('query parser', 'extended');
  const configService = app.get(ConfigService);
  const appInstance = configService.get('env.appInstance');
  const { appPort, apiPrefix } = configService.get('env.bootstrap');
  app.setGlobalPrefix(apiPrefix);
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('Backend API')
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

const cliBootstrap = async (mo: any) => {
  const app = await NestFactory.createApplicationContext(mo);
  await app.init();
  const configService = app.get(ConfigService);
  const appInstance = configService.get('env.appInstance');
  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.log(`${appInstance} app start`);
  // keep alive
  createServer().listen();
};

const isProd = (config: ConfigService) => {
  const deployment = config.get('env.appDeployment');
  return deployment === 'prod';
};

export { isProd, serverBootstrap, cliBootstrap };
