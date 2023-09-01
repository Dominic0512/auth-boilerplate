export class UserRegisterByPasswordEvent {
  public static eventName = "user.register-by-password";

  constructor(
    public readonly payload: {
      name: string;
      email: string;
      link: string;
    }
  ) {}
}
