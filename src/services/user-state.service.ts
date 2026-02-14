import { UserStateRepository } from "../repositories/user-state.repository";
import type { StatePayload, UserState } from "../shared/types";

export class UserStateService {
  constructor(private readonly userStateRepository: UserStateRepository) {}

  set(userId: number, stateType: string, payload: StatePayload): void {
    this.userStateRepository.set(userId, stateType, payload);
  }

  get(userId: number): UserState | null {
    return this.userStateRepository.get(userId);
  }

  clear(userId: number): void {
    this.userStateRepository.clear(userId);
  }
}

