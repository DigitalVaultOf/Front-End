import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';

interface BoletoData {
  beneficiary: string;
  amount: string;
  dueDate: string;
  paymentDate: string;
  isExpired: boolean;
}

interface Account {
  id: string;
  name: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class Payment implements OnInit {
  @Input() isOpen = false;
  @Output() paymentSuccess = new EventEmitter<any>();

  paymentForm: FormGroup;
  boletoData: BoletoData | null = null;
  isLoading = false;
  errorMessage = '';
  showWarning = false;
  
  accounts: Account[] = [
    { id: 'cc-001', name: 'Conta Corrente - Final 1234' },
    { id: 'cc-002', name: 'Conta Corrente - Final 5678' },
    { id: 'pp-001', name: 'Conta Poupança - Final 9012' }
  ];

  constructor(private fb: FormBuilder, private overlayRef: OverlayRef,) {
    this.paymentForm = this.fb.group({
      barcode: ['', [Validators.required, this.barcodeValidator]],
      account: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Escutar mudanças no código de barras
    this.paymentForm.get('barcode')?.valueChanges.subscribe(value => {
      if (value && value.length > 10) {
        // this.validateBoleto(value);
      } else {
        this.boletoData = null;
        this.showWarning = false;
      }
    });
  }

  barcodeValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const cleanCode = value.replace(/\s+/g, '').replace(/[.-]/g, '');
    
    if (cleanCode.length !== 44 && cleanCode.length !== 47) {
      return { invalidLength: true };
    }
    
    if (!/^\d+$/.test(cleanCode)) {
      return { invalidFormat: true };
    }
    
    return null;
  }

  formatBarcode(code: string): string {
    const cleanCode = code.replace(/\s+/g, '').replace(/[.-]/g, '');
    
    if (cleanCode.length === 47) {
      return cleanCode.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/, 
        '$1.$2 $3.$4 $5.$6 $7 $8');
    } else if (cleanCode.length === 44) {
      return cleanCode.replace(/(\d{4})(\d{5})(\d{10})(\d{10})(\d{15})/, 
        '$1 $2 $3 $4 $5');
    }
    return cleanCode;
  }

  closeModal(): void {
    console.log('Fechando modal Pix...');
    this.overlayRef.dispose();
  }

  private resetForm() {
    this.paymentForm.reset();
    this.boletoData = null;
    this.showWarning = false;
    this.errorMessage = '';
    this.isLoading = false;
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  get isPaymentEnabled(): boolean {
    return this.paymentForm.valid && !!this.boletoData && !this.isLoading;
  }
}