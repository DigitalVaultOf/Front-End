import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarConta } from './editar-conta';

describe('EditarConta', () => {
  let component: EditarConta;
  let fixture: ComponentFixture<EditarConta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarConta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarConta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
