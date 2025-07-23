import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';

interface ManagedOverlay {
  ref: OverlayRef;
  source?: string;
  type: 'modal' | 'alert' | 'other';
  priority: number; // 1 = alta (não fechar), 2 = normal, 3 = baixa (fechar primeiro)
  id: string; // ✅ NOVO: ID único para evitar duplicatas
  registeredAt: Date; // ✅ NOVO: Timestamp do registro
}

@Injectable({
  providedIn: 'root'
})
export class OverlayManagerService {
  private activeOverlays: ManagedOverlay[] = [];
  private detachmentSubscriptions = new Map<string, any>(); // ✅ CONTROLAR SUBSCRIPTIONS

  registerOverlay(
    overlayRef: OverlayRef, 
    source?: string, 
    type: 'modal' | 'alert' | 'other' = 'modal',
    priority: number = 2
  ): void {
    const overlayId = this.generateOverlayId();
    
    // ✅ PREVENÇÃO TOTAL DE DUPLICATAS DE ALERTS
    if (type === 'alert' && source) {
      // Remover alerts similares existentes
      const existingAlerts = this.activeOverlays.filter(overlay => 
        overlay.type === 'alert' && overlay.source === source
      );
      
      if (existingAlerts.length > 0) {
        console.log(`🧹 Removendo ${existingAlerts.length} alerts duplicados de ${source}`);
        existingAlerts.forEach(existing => {
          try {
            if (existing.ref && existing.ref.hasAttached()) {
              existing.ref.dispose();
            }
          } catch (error) {
            console.warn(`Erro ao remover alert duplicado:`, error);
          }
        });
        
        // Remover da lista
        this.activeOverlays = this.activeOverlays.filter(overlay => 
          !existingAlerts.includes(overlay)
        );
      }
      
      // ✅ VERIFICAR CONFLITOS ENTRE TIPOS DE ALERT (mais rigoroso)
      const conflictingAlerts = this.activeOverlays.filter(overlay => 
        overlay.type === 'alert' && 
        overlay.source !== source &&
        (Date.now() - overlay.registeredAt.getTime()) < 5000 // 5 segundos
      );
      
      if (conflictingAlerts.length > 0) {
        console.log(`🔄 Removendo ${conflictingAlerts.length} alerts conflitantes`);
        conflictingAlerts.forEach(conflicting => {
          try {
            if (conflicting.ref && conflicting.ref.hasAttached()) {
              conflicting.ref.dispose();
            }
          } catch (error) {
            console.warn(`Erro ao remover alert conflitante:`, error);
          }
        });
        
        // Remover da lista
        this.activeOverlays = this.activeOverlays.filter(overlay => 
          !conflictingAlerts.includes(overlay)
        );
      }
    }
    
    console.log(`📝 Registrando overlay ${type}${source ? ` de ${source}` : ''} (prioridade: ${priority}) [ID: ${overlayId}]`);
    
    const managedOverlay: ManagedOverlay = {
      ref: overlayRef,
      source,
      type,
      priority,
      id: overlayId,
      registeredAt: new Date()
    };
    
    this.activeOverlays.push(managedOverlay);
    
    // ✅ REMOVER SUBSCRIPTION ANTERIOR SE EXISTIR
    if (this.detachmentSubscriptions.has(overlayId)) {
      try {
        const oldSubscription = this.detachmentSubscriptions.get(overlayId);
        if (oldSubscription && typeof oldSubscription.unsubscribe === 'function') {
          oldSubscription.unsubscribe();
        }
      } catch (error) {
        console.warn(`Erro ao limpar subscription anterior ${overlayId}:`, error);
      }
    }
    
    // ✅ Remover da lista quando o overlay for fechado naturalmente
    try {
      const subscription = overlayRef.detachments().subscribe(() => {
        this.removeOverlay(overlayRef, source, overlayId);
      });
      
      this.detachmentSubscriptions.set(overlayId, subscription);
    } catch (error) {
      console.error(`❌ Erro ao criar subscription de detachment para ${overlayId}:`, error);
    }
  }

  private removeOverlay(overlayRef: OverlayRef, source?: string, id?: string): void {
    try {
      const index = this.activeOverlays.findIndex(overlay => 
        overlay.ref === overlayRef || (id && overlay.id === id)
      );
      
      if (index > -1) {
        const overlay = this.activeOverlays[index];
        console.log(`🗑️ Removendo overlay${source ? ` de ${source}` : ''} da lista [ID: ${overlay.id}]`);
        this.activeOverlays.splice(index, 1);
        
        // ✅ LIMPAR SUBSCRIPTION COM VERIFICAÇÃO SEGURA
        if (overlay.id && this.detachmentSubscriptions.has(overlay.id)) {
          try {
            const subscription = this.detachmentSubscriptions.get(overlay.id);
            if (subscription && typeof subscription.unsubscribe === 'function') {
              subscription.unsubscribe();
            }
            this.detachmentSubscriptions.delete(overlay.id);
          } catch (error) {
            console.warn(`Erro ao limpar subscription ${overlay.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao remover overlay:', error);
    }
  }

  private generateOverlayId(): string {
    return `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  closeAllOverlays(reason?: string, includeAlerts: boolean = false): void {
    try {
      // ✅ Filtrar overlays baseado no tipo
      const overlaysToClose = this.activeOverlays.filter(overlay => {
        if (!overlay || !overlay.ref) return false;
        
        if (!includeAlerts && overlay.type === 'alert') {
          console.log(`⏭️ Mantendo overlay de alert: ${overlay.source || 'desconhecido'} [ID: ${overlay.id}]`);
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
          try {
            if (!overlay.ref) {
              console.log(`  └─ Overlay ${index + 1} (${overlay.type}): ref inválido [ID: ${overlay.id}]`);
              return;
            }

            if (!overlay.ref.hasAttached()) {
              console.log(`  └─ Overlay ${index + 1} (${overlay.type}): já desconectado [ID: ${overlay.id}]`);
            } else {
              console.log(`  └─ Overlay ${index + 1} (${overlay.type}): fechando... [ID: ${overlay.id}]`);
              overlay.ref.dispose();
            }
            
            // ✅ LIMPAR SUBSCRIPTION COM VERIFICAÇÃO SEGURA
            if (overlay.id && this.detachmentSubscriptions.has(overlay.id)) {
              try {
                const subscription = this.detachmentSubscriptions.get(overlay.id);
                if (subscription && typeof subscription.unsubscribe === 'function') {
                  subscription.unsubscribe();
                }
                this.detachmentSubscriptions.delete(overlay.id);
              } catch (error) {
                console.warn(`Erro ao limpar subscription ${overlay.id}:`, error);
              }
            }
          } catch (error) {
            console.warn(`  └─ Erro ao fechar overlay ${index + 1}:`, error);
          }
        });
        
        // ✅ Remover overlays fechados da lista
        this.activeOverlays = this.activeOverlays.filter(overlay => 
          !overlaysToClose.includes(overlay)
        );
      }

      // ✅ LIMPEZA ADICIONAL: Remover backdrop restante (exceto se houver alerts)
      if (includeAlerts || this.activeOverlays.filter(o => o && o.type === 'alert').length === 0) {
        this.forceCleanupBackdrops(reason);
      }
    } catch (error) {
      console.error('❌ Erro ao fechar overlays:', error);
    }
  }

  closeModalsOnly(reason?: string): void {
    try {
      const modals = this.activeOverlays.filter(overlay => 
        overlay && overlay.ref && overlay.type === 'modal'
      );
      
      if (modals.length > 0) {
        console.log(`🚪 Fechando ${modals.length} modais${reason ? ` (${reason})` : ''}`);
        
        modals.forEach((overlay, index) => {
          try {
            if (!overlay.ref) {
              console.log(`  └─ Modal ${index + 1}: ref inválido [ID: ${overlay.id}]`);
              return;
            }

            console.log(`  └─ Modal ${index + 1}: fechando... [ID: ${overlay.id}]`);
            overlay.ref.dispose();
            
            // ✅ LIMPAR SUBSCRIPTION COM VERIFICAÇÃO SEGURA
            if (overlay.id && this.detachmentSubscriptions.has(overlay.id)) {
              try {
                const subscription = this.detachmentSubscriptions.get(overlay.id);
                if (subscription && typeof subscription.unsubscribe === 'function') {
                  subscription.unsubscribe();
                }
                this.detachmentSubscriptions.delete(overlay.id);
              } catch (error) {
                console.warn(`Erro ao limpar subscription ${overlay.id}:`, error);
              }
            }
          } catch (error) {
            console.warn(`  └─ Erro ao fechar modal ${index + 1}:`, error);
          }
        });
        
        // ✅ Remover modais fechados da lista
        this.activeOverlays = this.activeOverlays.filter(overlay => 
          !modals.includes(overlay)
        );
      }
    } catch (error) {
      console.error('❌ Erro ao fechar modais:', error);
    }
  }

  registerAlert(overlayRef: OverlayRef, source?: string): void {
    this.registerOverlay(overlayRef, source, 'alert', 1); // Prioridade alta (não fechar)
  }

  // ✅ NOVO: Método para limpar alerts duplicados por fonte
  clearDuplicateAlerts(source: string): void {
    const duplicateAlerts = this.activeOverlays.filter(overlay => 
      overlay.type === 'alert' && overlay.source === source
    );
    
    if (duplicateAlerts.length > 1) {
      console.log(`🧹 Removendo ${duplicateAlerts.length - 1} alerts duplicados de ${source}`);
      
      // Manter apenas o mais recente
      duplicateAlerts
        .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())
        .slice(0, -1) // Todos exceto o último
        .forEach(overlay => {
          overlay.ref.dispose();
        });
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

  logActiveOverlays(): void {
    try {
      console.log(`📊 Overlays ativos: ${this.activeOverlays.length}`);
      this.activeOverlays.forEach((overlay, index) => {
        if (!overlay) {
          console.log(`  └─ Overlay ${index + 1}: INVÁLIDO`);
          return;
        }
        
        const status = overlay.ref && overlay.ref.hasAttached ? 
          (overlay.ref.hasAttached() ? 'ativo' : 'desconectado') : 
          'ref inválido';
          
        console.log(`  └─ Overlay ${index + 1}: ${overlay.type} (${overlay.source || 'desconhecido'}) [ID: ${overlay.id || 'sem-id'}] - ${status}`);
      });
    } catch (error) {
      console.error('❌ Erro ao listar overlays ativos:', error);
    }
  }

  // ✅ NOVO: Método para debuggar subscriptions
  logSubscriptions(): void {
    try {
      console.log(`📡 Subscriptions ativas: ${this.detachmentSubscriptions.size}`);
      Array.from(this.detachmentSubscriptions.keys()).forEach((id, index) => {
        const subscription = this.detachmentSubscriptions.get(id);
        const status = subscription && typeof subscription.unsubscribe === 'function' ? 'válida' : 'inválida';
        console.log(`  └─ Subscription ${index + 1}: [ID: ${id}] - ${status}`);
      });
    } catch (error) {
      console.error('❌ Erro ao listar subscriptions:', error);
    }
  }

  // ✅ NOVO: Método para limpeza geral (útil para debugging)
  forceCleanupAll(): void {
    console.log('🧹 Limpeza forçada de todos os overlays e subscriptions');
    
    try {
      // Limpar todos os overlays
      this.activeOverlays.forEach(overlay => {
        try {
          if (overlay.ref && overlay.ref.hasAttached()) {
            overlay.ref.dispose();
          }
        } catch (error) {
          console.warn(`Erro ao limpar overlay ${overlay.id}:`, error);
        }
      });
      
      // Limpar todas as subscriptions
      this.detachmentSubscriptions.forEach((subscription, id) => {
        try {
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        } catch (error) {
          console.warn(`Erro ao limpar subscription ${id}:`, error);
        }
      });
      
      // Reset das listas
      this.activeOverlays = [];
      this.detachmentSubscriptions.clear();
      
      // Limpeza do DOM
      this.forceCleanupBackdrops('limpeza forçada');
      
      console.log('✅ Limpeza forçada concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza forçada:', error);
    }
  }
}