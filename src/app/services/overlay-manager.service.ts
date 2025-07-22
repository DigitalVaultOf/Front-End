import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';

interface ManagedOverlay {
  ref: OverlayRef;
  source?: string;
  type: 'modal' | 'alert' | 'other';
  priority: number; // 1 = alta (não fechar), 2 = normal, 3 = baixa (fechar primeiro)
}

@Injectable({
  providedIn: 'root'
})
export class OverlayManagerService {
  private activeOverlays: ManagedOverlay[] = [];

  registerOverlay(
    overlayRef: OverlayRef, 
    source?: string, 
    type: 'modal' | 'alert' | 'other' = 'modal',
    priority: number = 2
  ): void {
    console.log(`📝 Registrando overlay ${type}${source ? ` de ${source}` : ''} (prioridade: ${priority})`);
    
    const managedOverlay: ManagedOverlay = {
      ref: overlayRef,
      source,
      type,
      priority
    };
    
    this.activeOverlays.push(managedOverlay);
    
    // ✅ Remover da lista quando o overlay for fechado naturalmente
    overlayRef.detachments().subscribe(() => {
      this.removeOverlay(overlayRef, source);
    });
  }

  private removeOverlay(overlayRef: OverlayRef, source?: string): void {
    const index = this.activeOverlays.findIndex(overlay => overlay.ref === overlayRef);
    if (index > -1) {
      console.log(`🗑️ Removendo overlay${source ? ` de ${source}` : ''} da lista`);
      this.activeOverlays.splice(index, 1);
    }
  }

  closeAllOverlays(reason?: string, includeAlerts: boolean = false): void {
    // ✅ Filtrar overlays baseado no tipo
    const overlaysToClose = this.activeOverlays.filter(overlay => {
      if (!includeAlerts && overlay.type === 'alert') {
        console.log(`⏭️ Mantendo overlay de alert: ${overlay.source || 'desconhecido'}`);
        return false;
      }
      return true;
    });

    const count = overlaysToClose.length;
    
    if (count > 0) {
      console.log(`🧹 Fechando ${count} overlays${reason ? ` (${reason})` : ''}`);
      
      // ✅ Ordenar por prioridade (prioridade maior = fecha primeiro)
      overlaysToClose.sort((a, b) => b.priority - a.priority);
      
      // ✅ Fechar overlays selecionados
      overlaysToClose.forEach((overlay, index) => {
        if (overlay.ref && !overlay.ref.hasAttached()) {
          console.log(`  └─ Overlay ${index + 1} (${overlay.type}): já desconectado`);
        } else if (overlay.ref) {
          console.log(`  └─ Overlay ${index + 1} (${overlay.type}): fechando...`);
          try {
            overlay.ref.dispose();
          } catch (error) {
            console.warn(`  └─ Erro ao fechar overlay ${index + 1}:`, error);
          }
        }
      });
      
      // ✅ Remover overlays fechados da lista
      this.activeOverlays = this.activeOverlays.filter(overlay => 
        !overlaysToClose.includes(overlay)
      );
    }

    // ✅ LIMPEZA ADICIONAL: Remover backdrop restante (exceto se houver alerts)
    if (includeAlerts || this.activeOverlays.filter(o => o.type === 'alert').length === 0) {
      this.forceCleanupBackdrops(reason);
    }
  }

  private forceCleanupBackdrops(reason?: string): void {
    // ✅ Só limpar se não houver alerts ativos
    const hasActiveAlerts = this.activeOverlays.some(overlay => 
      overlay.type === 'alert' && overlay.ref.hasAttached()
    );

    if (hasActiveAlerts) {
      console.log(`💡 Preservando backdrops devido a alerts ativos`);
      return;
    }

    // ✅ Buscar todos os backdrops restantes no DOM
    const backdrops = document.querySelectorAll('.cdk-overlay-backdrop');
    const overlayPanes = document.querySelectorAll('.cdk-overlay-pane');
    
    if (backdrops.length > 0 || overlayPanes.length > 0) {
      console.log(`🔧 Limpeza forçada do DOM${reason ? ` (${reason})` : ''}:`);
      console.log(`  └─ ${backdrops.length} backdrops encontrados`);
      console.log(`  └─ ${overlayPanes.length} overlay panes encontrados`);
      
      // Remover backdrops apenas se não forem de alerts
      backdrops.forEach((backdrop, index) => {
        // ✅ Verificar se o backdrop não pertence a um alert
        const parentPane = backdrop.nextElementSibling;
        const isAlertBackdrop = parentPane?.classList.contains('alert-overlay') || 
                               parentPane?.querySelector('.alert-container') ||
                               backdrop.classList.contains('alert-backdrop');
        
        if (!isAlertBackdrop) {
          console.log(`  └─ Removendo backdrop ${index + 1}`);
          backdrop.remove();
        } else {
          console.log(`  └─ Preservando backdrop ${index + 1} (alert)`);
        }
      });
      
      // Remover overlay panes que não são alerts
      overlayPanes.forEach((pane, index) => {
        const isAlertPane = pane.classList.contains('alert-overlay') || 
                           pane.querySelector('.alert-container');
        
        if (!isAlertPane) {
          console.log(`  └─ Removendo overlay pane ${index + 1}`);
          pane.remove();
        } else {
          console.log(`  └─ Preservando overlay pane ${index + 1} (alert)`);
        }
      });

      // ✅ Só alterar body se não houver mais overlays
      const remainingBackdrops = document.querySelectorAll('.cdk-overlay-backdrop');
      if (remainingBackdrops.length === 0) {
        document.body.classList.remove('cdk-overlay-open');
        document.body.style.overflow = '';
      }
    }
  }

  getActiveOverlaysCount(): number {
    return this.activeOverlays.length;
  }

  // ✅ NOVO: Método específico para fechar apenas modais
  closeModalsOnly(reason?: string): void {
    const modals = this.activeOverlays.filter(overlay => overlay.type === 'modal');
    
    if (modals.length > 0) {
      console.log(`🚪 Fechando ${modals.length} modais${reason ? ` (${reason})` : ''}`);
      
      modals.forEach((overlay, index) => {
        if (overlay.ref) {
          console.log(`  └─ Modal ${index + 1}: fechando...`);
          try {
            overlay.ref.dispose();
          } catch (error) {
            console.warn(`  └─ Erro ao fechar modal ${index + 1}:`, error);
          }
        }
      });
      
      // ✅ Remover modais fechados da lista
      this.activeOverlays = this.activeOverlays.filter(overlay => 
        !modals.includes(overlay)
      );
    }
  }

  // ✅ NOVO: Registrar overlay de alert
  registerAlert(overlayRef: OverlayRef, source?: string): void {
    this.registerOverlay(overlayRef, source, 'alert', 1); // Prioridade alta (não fechar)
  }

  // ✅ MÉTODO PARA DEBUG
  logActiveOverlays(): void {
    console.log(`📊 Overlays ativos: ${this.activeOverlays.length}`);
    this.activeOverlays.forEach((overlay, index) => {
      console.log(`  └─ Overlay ${index + 1}: ${overlay.type} (${overlay.source || 'desconhecido'}) - ${overlay.ref.hasAttached() ? 'ativo' : 'desconectado'}`);
    });
  }
}