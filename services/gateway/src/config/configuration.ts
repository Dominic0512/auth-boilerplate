export default () => {
  return {
    core: {
      gateway: {
        host: process.env.GATEWAY_HOST,
        port: Number(process.env.GATEWAY_PORT),
      },
      user: {
        host: process.env.USER_HOST,
        port: Number(process.env.USER_PORT),
      },
      jwtSecret: process.env.CORE_JWT_SECRET,
      jwtIssuer: process.env.CORE_JWT_ISSUER,
      jwtAging: eval(process.env.CORE_JWT_AGING),
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      kid: process.env.AUTH0_KID
    }
  };
};
