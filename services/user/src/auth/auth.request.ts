import { IsValidAuth0Token } from "./auth.validator";

export class RegisterByAuth0Request {
  @IsValidAuth0Token()
  idToken: string;
}

export class LoginByAuth0Request extends RegisterByAuth0Request {}
