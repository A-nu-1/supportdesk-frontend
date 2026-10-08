import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';

import {
  Auth,
  UserRole,
} from '../../services/auth';

import {
  Category,
  CategoryService,
} from '../../services/category';

import {
  Ticket,
  TicketPriority,
  TicketService,
  TicketStatus,
} from '../../services/ticket';

type TicketView =
  | 'MY'
  | 'ASSIGNED'
  | 'ALL';

@Component({
  selector: 'app-tickets',
  imports: [
    RouterLink,
    FormsModule,
    Navbar,
  ],
  styleUrl: './tickets.css',
  templateUrl: './tickets.html',
})
export class Tickets implements OnInit {
  private readonly ticketService =
    inject(TicketService);

  private readonly categoryService =
    inject(CategoryService);

  protected readonly auth = inject(Auth);

  protected readonly tickets =
    signal<Ticket[]>([]);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly activeView =
    signal<TicketView>('ALL');

  protected readonly categories =
    signal<Category[]>([]);

  protected readonly currentPage =
    signal(0);

  protected readonly totalPages =
    signal(0);

  protected readonly totalElements =
    signal(0);

  protected search = '';

  protected categoryId:
    number | null = null;

  protected status:
    TicketStatus | '' = '';

  protected priority:
    TicketPriority | '' = '';

  protected readonly statuses:
    TicketStatus[] = [
      'OPEN',
      'ASSIGNED',
      'IN_PROGRESS',
      'WAITING_FOR_USER',
      'RESOLVED',
      'CLOSED',
    ];

  protected readonly priorities:
    TicketPriority[] = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'CRITICAL',
    ];

  ngOnInit(): void {
    const role =
      this.auth.currentUser()?.role;

    if (role === 'EMPLOYEE') {
      this.activeView.set('MY');
    } else if (
      role === 'SUPPORT_AGENT'
    ) {
      this.activeView.set('ASSIGNED');
    } else {
      this.activeView.set('ALL');
    }

    this.loadCategories();
    this.loadTickets();
  }

  protected role():
    UserRole | undefined {
    return this.auth.currentUser()?.role;
  }

  protected changeView(
    view: TicketView,
  ): void {
    if (this.activeView() === view) {
      return;
    }

    this.activeView.set(view);
    this.currentPage.set(0);
    this.loadTickets();
  }

  protected applyFilters(): void {
    this.currentPage.set(0);
    this.loadTickets();
  }

  protected clearFilters(): void {
    this.search = '';
    this.categoryId = null;
    this.status = '';
    this.priority = '';

    this.currentPage.set(0);
    this.loadTickets();
  }

  protected previousPage(): void {
    if (this.currentPage() === 0) {
      return;
    }

    this.currentPage.update(
      (page) => page - 1,
    );

    this.loadTickets();
  }

  protected nextPage(): void {
    if (
      this.currentPage() + 1 >=
      this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(
      (page) => page + 1,
    );

    this.loadTickets();
  }

  private loadCategories(): void {
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
        },
      });
  }

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set('');

    const view = this.activeView();

    if (view === 'MY') {
      this.ticketService
        .getMyTickets()
        .subscribe({
          next: (tickets) => {
            this.setTickets(tickets);
          },
          error: () => {
            this.setError();
          },
        });

      return;
    }

    if (view === 'ASSIGNED') {
      this.ticketService
        .getAssignedTickets()
        .subscribe({
          next: (tickets) => {
            this.setTickets(tickets);
          },
          error: () => {
            this.setError();
          },
        });

      return;
    }

    this.ticketService
      .getTickets({
        search: this.search,
        categoryId:
          this.categoryId ?? undefined,
        status:
          this.status || undefined,
        priority:
          this.priority || undefined,
        page: this.currentPage(),
        size: 10,
      })
      .subscribe({
        next: (page) => {
          this.tickets.set(page.content);
          this.currentPage.set(
            page.number,
          );
          this.totalPages.set(
            page.totalPages,
          );
          this.totalElements.set(
            page.totalElements,
          );
          this.loading.set(false);
        },

        error: () => {
          this.setError();
        },
      });
  }

  private setTickets(
    tickets: Ticket[],
  ): void {
    this.tickets.set(tickets);

    // These views currently return List<Ticket>,
    // not a paginated Page<Ticket>.
    this.totalPages.set(0);
    this.totalElements.set(
      tickets.length,
    );

    this.loading.set(false);
  }

  private setError(): void {
    this.error.set(
      'Unable to load tickets.',
    );

    this.loading.set(false);
  }
}