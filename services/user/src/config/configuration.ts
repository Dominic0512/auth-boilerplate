export default () => {
  return {
    core: {
      host: process.env.USER_HOST,
      port: Number(process.env.USER_PORT),
    },
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      name: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
    },
    mailerSend: {
      domain: process.env.MAILER_SEND_DOMAIN,
      apiKey: process.env.MAILER_SEND_API_KEY
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      kid: process.env.AUTH0_KID
    }
  };
};
