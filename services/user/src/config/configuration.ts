export default () => {
  return {
    core: {
      nodeEnv: process.env.NODE_ENV,
      host: process.env.USER_HOST,
      port: Number(process.env.USER_PORT),
      emailVerifyEndpoint: process.env.EMAIL_VERIFY_ENDPOINT,
      emailDomain: process.env.CORE_EMAIL_DOMAIN
    },
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      name: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true' ? true : false,
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      kid: process.env.AUTH0_KID
    }
  };
};
