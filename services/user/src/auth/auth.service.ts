import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

/*
 * NOTE: To get a sample id token please refer to link format below:
 * - https://{domain}/authorize?client_id={client_id}&response_type=id_token&connection={facebook|google}&prompt=login&scope=openid%20profile%20email&redirect_uri=https://jwt.io&state={state}&nonce={nonce}
 */
export interface Auth0IdTokenPayload {
  family_name: string,
  nick_name: string,
  name: string,
  picture: string,
  updated_at: Date,
  email: string,
  email_verified: boolean,
  iss: string,
  aud: string,
  iat: number,
  exp: number,
  sub: string,
  auth_time: number,
  sid: string,
  nonce: string;
}

@Injectable()
export class AuthService {
  private publicKey: string;
  private jwtIssuer: string = 'auth-boilerplate';
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = 'C4F643B276ACDBA165AF2EE61E41D';
  }

  async onModuleInit() {
    const auth0Domain = 'dev-wp8ohtuqhmro5mwa.us.auth0.com';
    const auth0Kid = 'jyrIzgfkKE4gl9TiQCaYg';

    if (!auth0Domain) {
      throw new Error('The domain of Auth0 is not found, please set as an environment variable.');
    }
    const jwksClient = new JwksClient({ jwksUri: `https://${auth0Domain}/.well-known/jwks.json` });
    this.publicKey = (await jwksClient.getSigningKey(auth0Kid)).getPublicKey();
  }

  async verifyAuth0Token(token: string) {
    try {
      jwt.verify(token, this.publicKey);
      return { success: true };
    } catch(e) {
      return {
        success: false,
        message: e.message
      };
    }
  }

  decodeToken<T = any>(token: string) {
    return jwt.decode(token) as T;
  }

  decodeAuth0Token(token: string): Auth0IdTokenPayload {
    return this.decodeToken<Auth0IdTokenPayload>(token);
  }

  generateAuthToken<T extends object>(input: T, aging: number) {
    return jwt.sign(input, this.jwtSecret, {
      issuer: this.jwtIssuer,
      expiresIn: Math.floor(Date.now() / 1000) + aging
    });
  }
}
