export class AdminAccessService {
  constructor(private readonly adminIds: Set<number>) {}

  isAdmin(userId: number | null): boolean {
    return userId !== null && this.adminIds.has(userId);
  }
}

