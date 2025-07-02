import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Withdraw } from './withdraw';

describe('Withdraw', () => {
  let component: Withdraw;
  let fixture: ComponentFixture<Withdraw>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Withdraw]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Withdraw);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
