export default () => {
  const redisPass = process.env.REDIS_PASS;
  const redis = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
    ...(redisPass ? { password: redisPass } : {}),
  };
  const appInstance = process.env.APP_INSTANCE || 'App';
  const appPortKey = `${appInstance.toUpperCase()}_APP_PORT`;
  const appJwtSecret = `${appInstance.toUpperCase()}_JWT_SECRET`;
  const env = {
    appPort: process.env[appPortKey] || 6000,
    appInstance,
    isProduction: process.env.NODE_ENV === 'production',
    appDeployment: process.env.APP_DEPLOYMENT,
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
      ...redis,
      ttl: 60000, // 默认缓存1分钟
    },
  };
  return { env };
};
