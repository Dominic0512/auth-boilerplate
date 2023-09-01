import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  Inject,
  Get,
  Req,
  LiteralObject,
  Put,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { Request } from "express";

import {
  ApiBadRequestException,
  ApiUnauthorizedException,
} from "./common/swagger";
import { AuthService } from "./auth/auth.service";
import { RequestWithCurrentUser } from "./auth/middleware";
import { ApiBearAuthWithRoles } from "./auth/auth.decorator";
import {
  EmailVerificationTokenPayload,
  RefreshTokenPayload,
  RoleEnum,
} from "./auth/auth.type";
import { TokenResponse } from "./auth/auth.response";
import {
  LoginRequest,
  AuthByIdTokenRequest,
  RegisterRequest,
  VerifyRequest,
  ResetPasswordRequest,
} from "./auth/auth.request";
import { RefreshTokenInterceptor } from "./auth/interceptor";
import { UserDto, UpdateMyNameDto } from "./dto/user.dto";

// TODO: Let it be shared between gateway and user service.
export enum UserStateEnum {
  Pending = "Pending",
  Verified = "Verified",
}

@ApiTags("auth")
@Controller()
@UseInterceptors(RefreshTokenInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject("USER_SERVICE") private readonly userServiceClient: ClientProxy
  ) {}

  @Post("/register")
  @ApiCreatedResponse({
    type: UserDto,
    description: "Register request sent, please check the verification email.",
  })
  @ApiBadRequestException()
  async register(
    @Body() { email, password }: RegisterRequest
  ): Promise<UserDto> {
    const user = await firstValueFrom(
      this.userServiceClient.send("USER_GET_BY_EMAIL", { email })
    );

    if (user) {
      throw new BadRequestException(`The email ${email} is exists.`);
    }

    return new UserDto(
      await firstValueFrom(
        this.userServiceClient.send("USER_CREATE_WITH_PASSWORD", {
          name: email.slice(0, email.indexOf("@")),
          email,
          ...this.authService.hashPasswordPairFactory(password),
          verifyToken:
            this.authService.generateToken<EmailVerificationTokenPayload>({
              email,
            }),
        })
      )
    );
  }

  @Post("/verify")
  @ApiCreatedResponse({ type: TokenResponse, description: "Email verified." })
  @ApiUnauthorizedException()
  async verify(@Body() { token }: VerifyRequest): Promise<TokenResponse> {
    const { email } = this.authService.decodeToken<{ email: string }>(token);
    const { id, role } = await firstValueFrom(
      this.userServiceClient.send("USER_VERIFY_BY_EMAIL", { email })
    );
    return new TokenResponse({
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id }),
    });
  }

  @Post("/login")
  @ApiCreatedResponse({ type: TokenResponse, description: "Logged in." })
  @ApiBadRequestException()
  @ApiUnauthorizedException()
  async login(
    @Body() { email, password }: LoginRequest
  ): Promise<TokenResponse> {
    const user = await firstValueFrom(
      this.userServiceClient.send("USER_GET_BY_EMAIL", { email })
    );

    if (!user) {
      throw new BadRequestException(`The email ${email} is not found.`);
    }

    const { id, state, password: originPassword, passwordSalt, role } = user;

    if (state !== UserStateEnum.Verified) {
      throw new UnauthorizedException("Please complete the email verify step.");
    }

    const hashPassword = this.authService.hashPasswordFactory(
      password,
      passwordSalt
    );

    if (hashPassword !== originPassword) {
      throw new UnauthorizedException("Invalid password.");
    }

    this.userServiceClient.emit("USER_LOGGED_IN", { id });

    return new TokenResponse({
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id }),
    });
  }

  @Post("/auth-by-id-token")
  @ApiCreatedResponse({
    type: TokenResponse,
    description: "Authorization by OIDC is accepted.",
  })
  @ApiBadRequestException()
  async authByIdToken(
    @Body() { idToken }: AuthByIdTokenRequest
  ): Promise<TokenResponse> {
    const { email, provider, picture, name } =
      this.authService.decodeAuth0Token(idToken);

    const { id, role } = await firstValueFrom(
      this.userServiceClient.send("USER_UPSERT_WITH_PROVIDER", {
        name,
        email,
        providers: [
          {
            name: provider,
            picture,
          },
        ],
      })
    );

    this.userServiceClient.emit("USER_LOGGED_IN", { id, provider });

    return new TokenResponse({
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id }),
    });
  }

  @Post("/refresh-token")
  @ApiCreatedResponse({
    type: TokenResponse,
    description: "Authorization by OIDC is accepted.",
  })
  @ApiUnauthorizedException()
  async refreshToken(@Req() req: Request): Promise<TokenResponse> {
    const refreshToken = req.cookies.refreshToken;
    const { success } =
      this.authService.verifyPrimaryRefreshToken(refreshToken);

    if (!success)
      throw new UnauthorizedException(
        "The refresh token is expired, please re-login."
      );

    const { id } =
      this.authService.decodeToken<RefreshTokenPayload>(refreshToken);
    const { role } = await firstValueFrom(
      this.userServiceClient.send("USER_GET_BY_ID", { id })
    );

    this.userServiceClient.emit("USER_TOKEN_REFRESHED", { id });

    return new TokenResponse({
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id }),
    });
  }

  @Post("/logout")
  @ApiNoContentResponse({ description: "Logged out." })
  async logout(): Promise<LiteralObject> {
    // NOTE: Currently, only clean the refresh token in cookies by auth.interceptor.ts
    return {};
  }

  @Post("/reset-password")
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiNoContentResponse({
    description: "The password is reset. Please re-login.",
  })
  @ApiUnauthorizedException()
  @ApiBadRequestException()
  async resetPassword(
    @Req() req: RequestWithCurrentUser,
    @Body() resetPasswordRequest: ResetPasswordRequest
  ): Promise<LiteralObject> {
    const { id } = req.currentUser;
    const { password, passwordSalt } = await firstValueFrom(
      this.userServiceClient.send("USER_GET_BY_ID", { id })
    );
    const { oldPassword, newPassword } = resetPasswordRequest;
    const hashOldPassword = this.authService.hashPasswordFactory(
      oldPassword,
      passwordSalt
    );

    if (hashOldPassword !== password) {
      throw new UnauthorizedException("Invalid old password.");
    }

    const newHashPassword = this.authService.hashPasswordFactory(
      newPassword,
      passwordSalt
    );
    await firstValueFrom(
      this.userServiceClient.send("USER_RESET_PASSWORD", {
        id,
        newHashPassword,
      })
    );
    return {};
  }

  @Get("/me")
  @ApiOkResponse({ type: UserDto, description: "Get personal profiles." })
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  async me(@Req() req: RequestWithCurrentUser): Promise<UserDto> {
    const { id } = req.currentUser;
    return new UserDto(
      await firstValueFrom(
        this.userServiceClient.send("USER_GET_BY_ID", { id })
      )
    );
  }

  @Put("/username")
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiOkResponse({ type: UserDto, description: "Receive updated user name." })
  @ApiUnauthorizedException()
  async updateMyName(
    @Req() req: RequestWithCurrentUser,
    @Body() { name }: UpdateMyNameDto
  ): Promise<UpdateMyNameDto> {
    const { id } = req.currentUser;
    return new UserDto(
      await firstValueFrom(
        this.userServiceClient.send("USER_UPDATE_BY_ID", { id, name })
      )
    );
  }
}
