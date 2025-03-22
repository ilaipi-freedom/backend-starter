import { AppInstanceEnum } from './helper';

export const enum AuthSessionKeyEnum {
  AUTH = 'AUTH',
}

export class AuthSessionKey {
  type: AppInstanceEnum;
  key: AuthSessionKeyEnum;
  id: string | number;
}

export class TAuthSession {
  corpId: string;
  type: AppInstanceEnum;
  token: string;
}

/**
 * Admin account session
 */
export class AuthSession extends TAuthSession {
  id: string;
  username: string;
  role: string; // role.perm
}
