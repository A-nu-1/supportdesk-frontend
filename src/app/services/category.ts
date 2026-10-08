import {
  inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Category = {
  id: number;
  name: string;
  active: boolean;
};

export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = {
  name: string;
  active: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http =
    inject(HttpClient);

  getCategories():
    Observable<Category[]> {
    return this.http.get<Category[]>(
      '/api/categories',
    );
  }

  createCategory(
    request: CreateCategoryRequest,
  ): Observable<Category> {
    return this.http.post<Category>(
      '/api/categories',
      request,
    );
  }

  updateCategory(
    categoryId: number,
    request: UpdateCategoryRequest,
  ): Observable<Category> {
    return this.http.patch<Category>(
      `/api/categories/${categoryId}`,
      request,
    );
  }
}