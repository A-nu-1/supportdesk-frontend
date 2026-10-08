import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewTicket } from './new-ticket';

describe('NewTicket', () => {
  let component: NewTicket;
  let fixture: ComponentFixture<NewTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(NewTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
