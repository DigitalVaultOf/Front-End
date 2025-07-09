import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletarConta } from './deletar-conta';

describe('DeletarConta', () => {
  let component: DeletarConta;
  let fixture: ComponentFixture<DeletarConta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletarConta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletarConta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
