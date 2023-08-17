import camelcaseKeys from '@cjs-exporter/camelcase-keys';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

/*
 * NOTE: To get a sample id token please refer to link format below:
 * - https://{domain}/authorize?client_id={client_id}&response_type=id_token&connection={facebook|google}&prompt=login&scope=openid%20profile%20email&redirect_uri=https://jwt.io&state={state}&nonce={nonce}
 */
export interface Auth0IdTokenPayload {
  familyName: string,
  nickName: string,
  name: string,
  picture: string,
  updatedAt: Date,
  email: string,
  emailVerified: boolean,
  iss: string,
  aud: string,
  iat: number,
  exp: number,
  sub: string,
  authTime: number,
  sid: string,
  nonce: string;
}

export type Auth0TransformPayload = Pick<
  Auth0IdTokenPayload, 'name' | 'picture' | 'email' | 'emailVerified'
> & { provider: string };

@Injectable()
export class AuthService {
  private publicKey: string;
  private jwtIssuer: string;
  private jwtSecret: string;
  private jwtAging: number;
  private providerMap: { [key: string]: string } = {
    'facebook': 'facebook',
    'google-oauth2': 'google'
  };

  constructor(
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('core.jwtSecret');
    this.jwtIssuer = this.configService.get<string>('core.jwtIssuer');
    this.jwtAging = this.configService.get<number>('core.jwtAging');
  }

  async onModuleInit() {
    const auth0Domain = this.configService.get<string>('auth0.domain');
    const auth0Kid = this.configService.get<string>('auth0.kid');

    if (!auth0Domain) {
      throw new Error('The domain of Auth0 is not found, please set as an environment variable.');
    }
    const jwksClient = new JwksClient({ jwksUri: `https://${auth0Domain}/.well-known/jwks.json` });
    this.publicKey = (await jwksClient.getSigningKey(auth0Kid)).getPublicKey();
  }

  verifyToken(token: string, secret: string) {
    try {
      jwt.verify(token, secret);
      return { success: true };
    } catch(e) {
      return {
        success: false,
        message: e.message
      };
    }
  }

  verifyAuth0Token(token: string) {
    return this.verifyToken(token, this.publicKey);
  }

  verifyPrimaryAuthToken(token: string) {
    return this.verifyToken(token, this.jwtSecret);
  }

  decodeToken<T = any>(token: string) {
    return jwt.decode(token) as T;
  }

  decodeAuth0Token(token: string): Auth0TransformPayload {
    const {
      name,
      picture,
      email,
      emailVerified,
      sub
    }: Auth0IdTokenPayload = camelcaseKeys(this.decodeToken(token));

    return {
      name,
      picture,
      email,
      emailVerified,
      provider: this.providerMap[sub.slice(0, sub.indexOf('|'))]
    };
  }

  generateAuthToken<T extends object>(input: T, options: { aging: number } = { aging: this.jwtAging }) {
    return jwt.sign(input, this.jwtSecret, {
      issuer: this.jwtIssuer,
      expiresIn: Math.floor(Date.now() / 1000) + options.aging
    });
  }
}
