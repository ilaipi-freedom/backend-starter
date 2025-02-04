import { AppInstanceEnum } from './helper';

export class AuthSessionKey {
  type: AppInstanceEnum;
  key: string;
  id: string | number;
}

export class AuthSession {
  id: string;
  corpId: string;
  type: AppInstanceEnum;
  username: string;
  token: string;
  role: string; // role.perm
}
