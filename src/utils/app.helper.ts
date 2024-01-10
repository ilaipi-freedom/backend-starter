import { ConfigService } from '@nestjs/config';

import { AdminApiModule } from 'src/apps/admin/admin.module';
import { AppInstanceEnum } from '../types/helper';
import { CliModule } from 'src/apps/cli/cli.module';
import cliBootstrap from 'src/apps/cli/main';

const getRuntimeModule = () => {
  switch (process.env.APP_INSTANCE) {
    case AppInstanceEnum.ADMIN:
      return { module: AdminApiModule };
    case AppInstanceEnum.CLI:
      return { module: CliModule, bootstrap: cliBootstrap };
    default:
      return { bootstrap: () => console.log('custom bootstrap') };
  }
};

const isProd = (config: ConfigService) => {
  const deployment = config.get('env.appDeployment');
  return deployment === 'prod';
};

export { getRuntimeModule, isProd };
