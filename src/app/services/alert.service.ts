// alert.service.ts - COORDENAÇÃO MELHORADA COM DADOS
import { Injectable, Injector, NgZone } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  AlertComponent,
  AlertData,
  ALERT_DATA,
} from '../alert.component/alert.component';
import { OverlayManagerService } from './overlay-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private attemptCounts = new Map<string, number>();
  private activeAlerts = new Set<string>(); // ✅ CONTROLAR ALERTS ATIVOS

  constructor(
    private overlay: Overlay, 
    private injector: Injector,
    private overlayManager: OverlayManagerService,
    private zone: NgZone
  ) {}

  show(data: AlertData): void {
    const alertKey = `${data.type}-${data.title}`;
    const attempts = this.attemptCounts.get(alertKey) || 0;

    if (attempts >= 2) {
      console.warn(`⚠️ Muitas tentativas para ${alertKey}, usando fallback`);
      this.showNativeAlert(data);
      return;
    }

    this.attemptCounts.set(alertKey, attempts + 1);

    // ✅ EXECUTAR CRIAÇÃO DO ALERT FORA DA ZONA ANGULAR
    this.zone.runOutsideAngular(() => {
      try {
        console.log(`🚨 AlertService.show (tentativa ${attempts + 1}):`, data);
        
        const overlayRef = this.overlay.create({
          positionStrategy: this.overlay.position()
            .global()
            .top('20px')
            .right('20px'),
          panelClass: ['alert-overlay', `alert-${data.type}`]
        });

        if (!overlayRef) {
          console.error('❌ Falha ao criar overlay');
          this.showNativeAlert(data);
          return;
        }

        try {
          this.overlayManager.registerAlert(overlayRef, `AlertService-${data.type}`);
        } catch (error) {
          console.error('❌ Erro ao registrar overlay:', error);
          overlayRef.dispose();
          this.showNativeAlert(data);
          return;
        }

        const customInjector = Injector.create({
          parent: this.injector,
          providers: [
            { provide: ALERT_DATA, useValue: data },
            { provide: OverlayRef, useValue: overlayRef },
          ],
        });

        const portal = new ComponentPortal(AlertComponent, null, customInjector);
        
        try {
          const componentRef = overlayRef.attach(portal);
          console.log('✅ Alert anexado com sucesso:', data.type);
          
          // ✅ MARCAR ALERT COMO ATIVO
          this.activeAlerts.add(alertKey);
          
          // ✅ RESET CONTADOR EM CASO DE SUCESSO
          setTimeout(() => {
            this.attemptCounts.delete(alertKey);
          }, 1000);

          // ✅ AUTO-DISMISS MELHORADO - SEM INTERFERIR COM DADOS
          setTimeout(() => {
            try {
              if (overlayRef.hasAttached() && componentRef.instance) {
                // ✅ REMOVER DA LISTA DE ATIVOS
                this.activeAlerts.delete(alertKey);
                
                // ✅ CLOSE FORA DA ZONA PARA NÃO INTERFERIR
                componentRef.instance.close();
              }
            } catch (error) {
              console.warn('Erro no auto-dismiss:', error);
              if (overlayRef.hasAttached()) {
                overlayRef.dispose();
              }
            }
          }, data.type === 'error' ? 7000 : 5000);
          
        } catch (error) {
          console.error('❌ Erro ao anexar portal:', error);
          overlayRef.dispose();
          this.showNativeAlert(data);
        }
        
      } catch (error) {
        console.error('❌ Erro geral no AlertService.show:', error);
        this.showNativeAlert(data);
      }
    });
  }

  // ✅ NOVO: Verificar se há alerts ativos
  hasActiveAlerts(): boolean {
    return this.activeAlerts.size > 0;
  }

  private showNativeAlert(data: AlertData): void {
    const icon = data.type === 'success' ? '✅' : data.type === 'error' ? '❌' : '⚠️';
    alert(`${icon} ${data.title}\n\n${data.message}`);
  }

  showSuccess(title: string, message: string) {
    console.log('✅ AlertService.showSuccess chamado:', { title, message });
    this.show({
      type: 'success',
      title,
      message,
    });
  }
  
  showError(title: string, message: string) {
    console.log('❌ AlertService.showError chamado:', { title, message });
    this.show({
      type: 'error',
      title,
      message,
    });
  }
  
  showWarning(title: string, message: string) {
    console.log('🚨 AlertService.showWarning chamado:', { title, message });
    this.show({
      type: 'warning',
      title,
      message,
    });
  }
}