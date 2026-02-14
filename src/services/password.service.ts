import { hashPassword, verifyPassword } from "../shared/password";

export interface PasswordCheckResult {
  valid: boolean;
  needsRehash: boolean;
}

export class PasswordService {
  hash(value: string): string {
    return hashPassword(value);
  }

  verify(storedValue: string, inputValue: string): PasswordCheckResult {
    return verifyPassword(storedValue, inputValue);
  }
}
