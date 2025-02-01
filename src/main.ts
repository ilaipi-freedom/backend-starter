import { AdminApiModule } from 'src/apps/admin/admin.module';
import { CliModule } from 'src/apps/cli/cli.module';
import { AppInstanceEnum } from 'src/types/helper';
import { serverBootstrap, cliBootstrap } from 'src/utils/app.helper';

switch (process.env.APP_INSTANCE) {
  case AppInstanceEnum.ADMIN:
    serverBootstrap(AdminApiModule);
    break;
  case AppInstanceEnum.CLI:
    cliBootstrap(CliModule);
    break;
  default:
    console.log('Unsupported app, please check: #types/helper#AppInstanceEnum');
    break;
}
