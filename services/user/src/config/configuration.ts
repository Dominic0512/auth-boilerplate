export default () => {
  return {
    core: {
      jwtSecret: process.env.CORE_JWT_SECRET,
      jwtIssuer: process.env.CORE_JWT_ISSUER,
      jwtAging: eval(process.env.CORE_JWT_AGING),
    },
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      name: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
    },
    mailerSend: {
      apiKey: process.env.MAILER_SEND_API_KEY
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      kid: process.env.AUTH0_KID
    }
  };
};
