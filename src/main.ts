import { AdminApiModule } from 'src/apps/admin/admin.module';
import { AppInstanceEnum } from 'src/types/helper';
import { serverBootstrap } from 'src/utils/app.helper';

const bootstrap = async () => {
  switch (process.env.APP_INSTANCE as AppInstanceEnum) {
    case AppInstanceEnum.ADMIN:
      await serverBootstrap(AdminApiModule);
      break;
    default:
      console.log(
        'Unsupported app, please check: #types/helper#AppInstanceEnum',
      );
      break;
  }
};

bootstrap().catch(console.error);
