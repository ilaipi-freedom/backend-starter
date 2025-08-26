import { Logger } from 'nestjs-pino';

import { AppInstanceEnum } from 'src/types/helper';
import { serverBootstrap } from 'src/utils/app.helper';
import { AdminApiModule } from 'src/apps/admin/admin.module';

let logger: Logger;

const bootstrap = async () => {
  switch (process.env.APP_INSTANCE as AppInstanceEnum) {
    case AppInstanceEnum.ADMIN:
      logger = await serverBootstrap(AdminApiModule);
      break;
    default:
      console.log(
        'Unsupported app, please check: #types/helper#AppInstanceEnum',
      );
      break;
  }
};

bootstrap().catch((err: unknown) => {
  if (logger) {
    logger.error({ err }, 'bootstrap error');
  } else {
    console.error('bootstrap error', err);
  }
  process.exit(1);
});
