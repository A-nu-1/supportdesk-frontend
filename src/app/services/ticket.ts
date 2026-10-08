import { inject, Injectable } from '@angular/core';
import {   HttpParams,
HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

export type Ticket = {
  id: number;
  title: string;
  description: string;

  categoryId: number;
  categoryName: string;

  createdById: number;
  createdByName: string;

  assignedToId: number | null;
  assignedToName: string | null;

  priority: TicketPriority;
  status: TicketStatus;

  createdAt: string;
  updatedAt: string;
};

export type TicketPage = {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type TicketComment = {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  message: string;
  createdAt: string;
};

export type CreateTicketRequest = {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
};

export type TicketFilters = {
  search?: string;
  categoryId?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  size?: number;
};

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);

 getTickets(
  filters: TicketFilters = {},
): Observable<TicketPage> {
  let params = new HttpParams()
    .set('page', filters.page ?? 0)
    .set('size', filters.size ?? 10);

  if (filters.search?.trim()) {
    params = params.set(
      'search',
      filters.search.trim(),
    );
  }

  if (filters.categoryId !== undefined) {
    params = params.set(
      'categoryId',
      filters.categoryId,
    );
  }

  if (filters.status) {
    params = params.set(
      'status',
      filters.status,
    );
  }

  if (filters.priority) {
    params = params.set(
      'priority',
      filters.priority,
    );
  }

  return this.http.get<TicketPage>(
    '/api/tickets',
    { params },
  );
}

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`/api/tickets/${id}`);
  }

  getComments(ticketId: number): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(`/api/tickets/${ticketId}/comments`);
  }

  addComment(ticketId: number, message: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`/api/tickets/${ticketId}/comments`, { message });
  }

  claimTicket(ticketId: number): Observable<Ticket> {
    return this.http.post<Ticket>(`/api/tickets/${ticketId}/claim`, {});
  }

  updateStatus(ticketId: number, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${ticketId}/status`, { status });
  }

  updatePriority(ticketId: number, priority: TicketPriority): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${ticketId}/priority`, { priority });
  }

  createTicket(request: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', request);
  }
  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>('/api/tickets/my');
  }

  getAssignedTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>('/api/tickets/assigned-to-me');
  }
}
