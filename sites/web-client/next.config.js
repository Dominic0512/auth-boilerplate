/** @type {import('next').NextConfig} */

function auth0RedirectUrlFactory(params) {
  const { authorizeUrl, clientId, callbackUrl, state } = params;

  function getRandomByRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  return (connection) => {
    const nonce = getRandomByRange(10000, 99999);
    return `${authorizeUrl}?client_id=${clientId}&response_type=id_token&connection=${connection}&prompt=login&scope=openid profile email&redirect_uri=${callbackUrl}&state=${state}&nonce=${nonce}`;
  }
}


const nextConfig = {
  async redirects() {
    const authorizeUrlFactory = auth0RedirectUrlFactory({
      authorizeUrl: process.env.OAUTH_CLIENT_AUTH_URL,
      clientId: process.env.OAUTH_CLIENT_ID,
      callbackUrl: `${process.env.WEB_CLIENT_HOST}/oauth-callback`,
      state: ''
    });
    return [
      {
        source: '/authorize/facebook',
        destination: authorizeUrlFactory('facebook'),
        permanent: false
      },
      {
        source: '/authorize/google',
        destination: authorizeUrlFactory('google-oauth2'),
        permanent: false
      },
    ]
  }
}

module.exports = nextConfig
