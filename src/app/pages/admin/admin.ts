import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Category, CategoryService } from '../../services/category';
import { Auth, AuthUser, UserRole } from '../../services/auth';

import { UpdateUserRequest, UserService } from '../../services/user';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, Navbar],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly users = signal<AuthUser[]>([]);

  protected readonly loading = signal(true);

  protected readonly error = signal('');

  protected readonly savingUserId = signal<number | null>(null);

  protected readonly userError = signal('');
  protected readonly auth = inject(Auth);

  protected isCurrentUser(user: AuthUser): boolean {
    return this.auth.currentUser()?.id === user.id;
  }

  protected readonly roles: UserRole[] = ['EMPLOYEE', 'SUPPORT_AGENT', 'ADMIN'];
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);

  protected readonly categoriesLoading = signal(true);

  protected readonly categoryError = signal('');

  protected readonly savingCategoryId = signal<number | null>(null);

  protected readonly creatingCategory = signal(false);

  protected newCategoryName = '';

  ngOnInit(): void {
    this.loadUsers();
    this.loadCategories();
  }

  protected updateRole(user: AuthUser, role: UserRole): void {
    if (user.role === role) {
      return;
    }

    this.saveUser(user, {
      role,
      active: user.active,
    });
  }

  protected toggleActive(user: AuthUser): void {
    this.saveUser(user, {
      role: user.role,
      active: !user.active,
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },

      error: () => {
        this.error.set('Unable to load users.');

        this.loading.set(false);
      },
    });
  }

  private saveUser(user: AuthUser, request: UpdateUserRequest): void {
    this.userError.set('');
    this.savingUserId.set(user.id);

    this.userService.updateUser(user.id, request).subscribe({
      next: (updatedUser) => {
        this.users.update((users) =>
          users.map((existingUser) =>
            existingUser.id === updatedUser.id ? updatedUser : existingUser,
          ),
        );

        this.savingUserId.set(null);
      },

      error: (error) => {
        this.userError.set(error.error?.message ?? 'Unable to update user.');

        this.savingUserId.set(null);
      },
    });
  }

  protected createCategory(): void {
    const name = this.newCategoryName.trim();

    if (!name) {
      return;
    }

    this.categoryError.set('');
    this.creatingCategory.set(true);

    this.categoryService.createCategory({ name }).subscribe({
      next: (category) => {
        this.categories.update((categories) => [...categories, category]);

        this.newCategoryName = '';
        this.creatingCategory.set(false);
      },

      error: (error) => {
        this.categoryError.set(
          error.error?.error ?? error.error?.message ?? 'Unable to create category.',
        );

        this.creatingCategory.set(false);
      },
    });
  }

  protected toggleCategory(category: Category): void {
    this.categoryError.set('');
    this.savingCategoryId.set(category.id);

    this.categoryService
      .updateCategory(category.id, {
        name: category.name,
        active: !category.active,
      })
      .subscribe({
        next: (updatedCategory) => {
          this.categories.update((categories) =>
            categories.map((existingCategory) =>
              existingCategory.id === updatedCategory.id ? updatedCategory : existingCategory,
            ),
          );

          this.savingCategoryId.set(null);
        },

        error: (error) => {
          this.categoryError.set(
            error.error?.error ?? error.error?.message ?? 'Unable to update category.',
          );

          this.savingCategoryId.set(null);
        },
      });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryError.set('');

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },

      error: () => {
        this.categoryError.set('Unable to load categories.');

        this.categoriesLoading.set(false);
      },
    });
  }
}
