export class AuthSessionKey {
  type: string;
  key: string;
  id: string | number;
}

export class AuthSession {
  id: string;
  type: string;
  username: string;
  token: string;
  role: string;
}
