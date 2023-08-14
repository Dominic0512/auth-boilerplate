import { IsValidAuth0Token } from "./auth.validator";

export class SignUpRequest {
  @IsValidAuth0Token()
  idToken: string;
}

export class SignInRequest extends SignUpRequest {}
