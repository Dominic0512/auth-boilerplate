import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import camelcaseKeys from '@cjs-exporter/camelcase-keys';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { JwksClient } from 'jwks-rsa';
import {
  AccessTokenPayload,
  GenerateTokenOptions,
  RefreshTokenPayload,
} from './auth.type';

/*
 * NOTE: To get a sample id token please refer to link format below:
 * - https://{domain}/authorize?client_id={client_id}&response_type=id_token&connection={facebook|google}&prompt=login&scope=openid%20profile%20email&redirect_uri=https://jwt.io&state={state}&nonce={nonce}
 */
export interface Auth0IdTokenPayload {
  familyName: string;
  nickName: string;
  name: string;
  picture: string;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  authTime: number;
  sid: string;
  nonce: string;
}

export type Auth0TransformPayload = Pick<
  Auth0IdTokenPayload,
  'name' | 'picture' | 'email' | 'emailVerified'
> & { provider: string };

@Injectable()
export class AuthService {
  private auth0PublicKey: string;

  private jwtIssuer: string;

  private accessTokenSecret: string;

  private accessTokenAging: number;

  private refreshTokenSecret: string;

  private refreshTokenAging: number;

  private providerMap: { [key: string]: string } = {
    facebook: 'facebook',
    'google-oauth2': 'google',
  };

  constructor(private readonly configService: ConfigService) {
    this.jwtIssuer = this.configService.get<string>('core.jwtIssuer');
    this.accessTokenSecret = this.configService.get<string>(
      'core.accessTokenSecret',
    );
    this.accessTokenAging = this.configService.get<number>(
      'core.accessTokenAging',
    );
    this.refreshTokenSecret = this.configService.get<string>(
      'core.refreshTokenSecret',
    );
    this.refreshTokenAging = this.configService.get<number>(
      'core.refreshTokenAging',
    );
  }

  async onModuleInit() {
    const auth0Domain = this.configService.get<string>('auth0.domain');
    const auth0Kid = this.configService.get<string>('auth0.kid');

    if (!auth0Domain) {
      throw new Error(
        'The domain of Auth0 is not found, please set as an environment variable.',
      );
    }
    const jwksClient = new JwksClient({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
    });
    this.auth0PublicKey = (
      await jwksClient.getSigningKey(auth0Kid)
    ).getPublicKey();
  }

  verifyToken(token: string, secret: string) {
    try {
      jwt.verify(token, secret);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  verifyAuth0Token(token: string) {
    return this.verifyToken(token, this.auth0PublicKey);
  }

  verifyPrimaryAccessToken(token: string) {
    return this.verifyToken(token, this.accessTokenSecret);
  }

  verifyPrimaryRefreshToken(token: string) {
    return this.verifyToken(token, this.refreshTokenSecret);
  }

  decodeToken<T = any>(token: string) {
    return jwt.decode(token) as T;
  }

  decodeAuth0Token(token: string): Auth0TransformPayload {
    const { name, picture, email, emailVerified, sub }: Auth0IdTokenPayload =
      camelcaseKeys(this.decodeToken(token));

    return {
      name,
      picture,
      email,
      emailVerified,
      provider: this.providerMap[sub.slice(0, sub.indexOf('|'))],
    };
  }

  generateToken<T extends object>(payload: T, options?: GenerateTokenOptions) {
    const aging = options?.aging ?? this.accessTokenAging;
    const secret = options?.secret ?? this.accessTokenSecret;

    return jwt.sign(payload, secret, {
      issuer: this.jwtIssuer,
      expiresIn: aging,
    });
  }

  generateAccessToken(payload: AccessTokenPayload) {
    return this.generateToken<AccessTokenPayload>(payload);
  }

  generateRefreshToken(payload: RefreshTokenPayload) {
    return this.generateToken<RefreshTokenPayload>(payload, {
      aging: this.refreshTokenAging,
      secret: this.refreshTokenSecret,
    });
  }

  hashPasswordFactory(password: string, salt: string) {
    return crypto.createHmac('sha256', salt).update(password).digest('base64');
  }

  hashPasswordPairFactory(password: string) {
    const salt = crypto.randomBytes(16).toString('base64');
    return {
      password: this.hashPasswordFactory(password, salt),
      passwordSalt: salt,
    };
  }
}
