export default () => {
  const redis = {
    url: process.env.REDIS_URL,
  };
  const appInstance = process.env.APP_INSTANCE || 'App';
  const prefix = appInstance.toUpperCase();
  const appPortKey = `${prefix}_APP_PORT`;
  const appJwtSecret = `${prefix}_JWT_SECRET`;
  const env = {
    appInstance,
    isProduction: process.env.NODE_ENV === 'production',
    appDeployment: process.env.APP_DEPLOYMENT,
    isProd:
      process.env.APP_DEPLOYMENT === 'prod' &&
      process.env.NODE_ENV === 'production',
    bootstrap: {
      appPort: process.env[appPortKey] || 6000,
      apiPrefix: process.env[`${prefix}_API_PREFIX`] || '',
    },
    jwt: {
      secret: process.env[appJwtSecret],
      Admin: {
        signOptions: {
          expiresIn: '1w',
        },
      },
    },
    redis,
    cache: {
      ttl: 60000, // 默认缓存1分钟
    },
  };
  return { env };
};
