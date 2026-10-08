import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';
import { Auth } from '../../services/auth';
import { DatePipe } from '@angular/common';
import {
  Ticket,
  TicketComment,
  TicketPriority,
  TicketService,
  TicketStatus,
} from '../../services/ticket';

@Component({
  imports: [FormsModule, RouterLink,   DatePipe,
 Navbar],
  selector: 'app-ticket-detail',
  styleUrl: './ticket-detail.css',
  templateUrl: './ticket-detail.html',
})
export class TicketDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);

  protected readonly auth = inject(Auth);

  protected readonly ticket = signal<Ticket | null>(null);

  protected readonly comments = signal<TicketComment[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly actionLoading = signal(false);
  protected readonly actionError = signal('');

  protected readonly submittingComment = signal(false);

  protected readonly commentError = signal('');

  protected newComment = '';

  protected validNextStatuses(): TicketStatus[] {
    const status = this.ticket()?.status;

    switch (status) {
      case 'OPEN':
        return ['ASSIGNED'];

      case 'ASSIGNED':
        return ['IN_PROGRESS'];

      case 'IN_PROGRESS':
        return ['WAITING_FOR_USER', 'RESOLVED'];

      case 'WAITING_FOR_USER':
        return ['IN_PROGRESS', 'RESOLVED'];

      case 'RESOLVED':
        return ['CLOSED', 'IN_PROGRESS'];

      case 'CLOSED':
        return [];

      default:
        return [];
    }
  }
  protected canComment(): boolean {
    const user = this.auth.currentUser();
    const currentTicket = this.ticket();

    if (!user || !currentTicket) {
      return false;
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role === 'EMPLOYEE' && currentTicket.createdById === user.id) {
      return true;
    }

    if (user.role === 'SUPPORT_AGENT' && currentTicket.assignedToId === user.id) {
      return true;
    }

    return false;
  }

  protected readonly priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  private ticketId = 0;

  ngOnInit() {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.ticketId) {
      this.error.set('Invalid ticket.');
      this.loading.set(false);
      return;
    }

    this.loadTicket();
    this.loadComments();
  }

  protected isSupportAgent(): boolean {
    return this.auth.currentUser()?.role === 'SUPPORT_AGENT';
  }

  protected canManageTicket(): boolean {
    const role = this.auth.currentUser()?.role;

    return role === 'SUPPORT_AGENT' || role === 'ADMIN';
  }

  protected canClaimTicket(): boolean {
    const currentTicket = this.ticket();

    return (
      this.isSupportAgent() &&
      currentTicket?.status === 'OPEN' &&
      currentTicket.assignedToId === null
    );
  }

  protected claimTicket() {
    if (this.actionLoading()) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set('');

    this.ticketService.claimTicket(this.ticketId).subscribe({
      next: (updatedTicket) => {
        this.ticket.set(updatedTicket);
        this.actionLoading.set(false);
      },

      error: (error) => {
        this.actionError.set(error.error?.error ?? 'Unable to claim ticket.');

        this.actionLoading.set(false);
      },
    });
  }

  protected updateStatus(status: TicketStatus) {
    const currentTicket = this.ticket();

    if (!currentTicket || status === currentTicket.status || this.actionLoading()) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set('');

    this.ticketService.updateStatus(this.ticketId, status).subscribe({
      next: (updatedTicket) => {
        this.ticket.set(updatedTicket);
        this.actionLoading.set(false);
      },

      error: (error) => {
        this.actionError.set(error.error?.error ?? 'Unable to update status.');

        this.actionLoading.set(false);
      },
    });
  }

  protected updatePriority(priority: TicketPriority) {
    const currentTicket = this.ticket();

    if (!currentTicket || priority === currentTicket.priority || this.actionLoading()) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set('');

    this.ticketService.updatePriority(this.ticketId, priority).subscribe({
      next: (updatedTicket) => {
        this.ticket.set(updatedTicket);
        this.actionLoading.set(false);
      },

      error: (error) => {
        this.actionError.set(error.error?.error ?? 'Unable to update priority.');

        this.actionLoading.set(false);
      },
    });
  }

  protected addComment() {
    const message = this.newComment.trim();

    if (!message || this.submittingComment()) {
      return;
    }

    this.submittingComment.set(true);
    this.commentError.set('');

    this.ticketService.addComment(this.ticketId, message).subscribe({
      next: (comment) => {
        this.comments.update((comments) => [...comments, comment]);

        this.newComment = '';
        this.submittingComment.set(false);
      },

      error: (error) => {
        this.commentError.set(error.error?.error ?? 'Unable to add comment.');

        this.submittingComment.set(false);
      },
    });
  }

  private loadTicket() {
    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.loading.set(false);
      },

      error: () => {
        this.error.set('Unable to load ticket.');

        this.loading.set(false);
      },
    });
  }

  private loadComments() {
    this.ticketService.getComments(this.ticketId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      },

      error: () => {
        this.commentError.set('Unable to load comments.');
      },
    });
  }
}
