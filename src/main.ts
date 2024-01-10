import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule, bootstrap as runtimeBootstrap } from './common/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = 'xxapi';
  app.setGlobalPrefix(apiPrefix);
  const logger = app.get(Logger);
  app.useLogger(logger);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Backend Starter API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(configService.get('env.appInstance'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/apidocs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = await configService.get('env.appPort');
  await app.listen(port);
  logger.log(`app start at ${port}`);
}
if (runtimeBootstrap) {
  runtimeBootstrap();
} else {
  bootstrap();
}
