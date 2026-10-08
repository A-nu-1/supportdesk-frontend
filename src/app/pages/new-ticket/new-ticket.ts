import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';
import {
  Category,
  CategoryService,
} from '../../services/category';
import {
  TicketPriority,
  TicketService,
} from '../../services/ticket';

@Component({
  selector: 'app-new-ticket',
  imports: [
    FormsModule,
    RouterLink,
    Navbar,
  ],
  templateUrl: './new-ticket.html',
})
export class NewTicket implements OnInit {
  private readonly categoryService =
    inject(CategoryService);

  private readonly ticketService =
    inject(TicketService);

  private readonly router = inject(Router);

  protected readonly categories =
    signal<Category[]>([]);

  protected readonly loadingCategories =
    signal(true);

  protected readonly categoryError =
    signal('');

  protected readonly submitting =
    signal(false);

  protected readonly submitError =
    signal('');

  protected title = '';
  protected description = '';

  protected categoryId: number | null =
    null;

  protected priority: TicketPriority =
    'MEDIUM';

  protected readonly priorities:
    TicketPriority[] = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'CRITICAL',
    ];

  ngOnInit(): void {
    this.loadCategories();
  }

  protected createTicket(): void {
    const title = this.title.trim();
    const description =
      this.description.trim();

    if (
      !title ||
      !description ||
      this.categoryId === null
    ) {
      this.submitError.set(
        'Please complete all required fields.',
      );
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.ticketService
      .createTicket({
        title,
        description,
        categoryId: this.categoryId,
        priority: this.priority,
      })
      .subscribe({
        next: (ticket) => {
          this.router.navigate([
            '/tickets',
            ticket.id,
          ]);
        },
        error: (error) => {
          this.submitting.set(false);

          this.submitError.set(
            error.error?.message ??
              'Could not create the ticket.',
          );
        },
      });
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoryError.set('');

    this.categoryService
      .getCategories()
      .subscribe({
        next: (categories) => {
          this.categories.set(
            categories.filter(
              (category) =>
                category.active,
            ),
          );

          this.loadingCategories.set(false);
        },

        error: () => {
          this.categoryError.set(
            'Could not load categories.',
          );

          this.loadingCategories.set(false);
        },
      });
  }
}