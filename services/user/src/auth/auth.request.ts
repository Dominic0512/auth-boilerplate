import { IsValidAuth0Token } from "./auth.validator";

export class AuthByAuth0Request {
  @IsValidAuth0Token()
  idToken: string;
}
