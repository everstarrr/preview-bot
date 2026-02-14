import { CategoryRepository } from "../repositories/category.repository";
import type { Category } from "../shared/types";
import { PasswordService } from "./password.service";

export type CategoryAccessResult =
  | { status: "not_found" }
  | { status: "invalid_password" }
  | { status: "ok"; category: Category };

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly passwordService: PasswordService
  ) {}

  listCategories(): Category[] {
    return this.categoryRepository.list();
  }

  getCategoryById(categoryId: number): Category | null {
    return this.categoryRepository.getById(categoryId);
  }

  createCategory(name: string, password: string): number {
    const hash = this.passwordService.hash(password);
    return this.categoryRepository.create(name, hash);
  }

  changeCategoryPassword(categoryId: number, password: string): boolean {
    const hash = this.passwordService.hash(password);
    return this.categoryRepository.updatePassword(categoryId, hash);
  }

  verifyCategoryAccess(categoryId: number, inputPassword: string): CategoryAccessResult {
    const category = this.categoryRepository.getById(categoryId);
    if (!category) {
      return { status: "not_found" };
    }

    const check = this.passwordService.verify(category.password, inputPassword);
    if (!check.valid) {
      return { status: "invalid_password" };
    }

    if (check.needsRehash) {
      this.changeCategoryPassword(category.id, inputPassword);
    }

    return { status: "ok", category };
  }
}

