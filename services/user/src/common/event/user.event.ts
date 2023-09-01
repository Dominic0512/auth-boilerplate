export class UserRegisterByPasswordEvent {
  public static eventName = 'user.register-by-password';

  constructor(
    public readonly payload: {
      name: string;
      email: string;
      link: string;
    },
  ) {}
}

export class UserLoggedInEvent {
  public static eventName = 'user.logged-in';

  constructor(
    public readonly payload: {
      id: number;
      provider: string;
    },
  ) {}
}

export class UserTokenRefreshedEvent {
  public static eventName = 'user.token-refreshed';

  constructor(
    public readonly payload: {
      id: number;
    },
  ) {}
}
