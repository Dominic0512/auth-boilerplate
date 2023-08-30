export const configuration = () => {
  return {
    core: {
      nodeEnv: process.env.NODE_ENV,
      gateway: {
        host: process.env.GATEWAY_HOST,
        port: Number(process.env.GATEWAY_PORT),
      },
      user: {
        host: process.env.USER_HOST,
        port: Number(process.env.USER_PORT),
      },
      accessTokenSecret: process.env.CORE_ACCESS_TOKEN_SECRET,
      accessTokenAging: eval(process.env.CORE_ACCESS_TOKEN_AGING),
      refreshTokenSecret: process.env.CORE_REFRESH_TOKEN_SECRET,
      refreshTokenAging: eval(process.env.CORE_REFRESH_TOKEN_AGING),
      jwtIssuer: process.env.CORE_JWT_ISSUER,
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      kid: process.env.AUTH0_KID,
    },
  };
};
