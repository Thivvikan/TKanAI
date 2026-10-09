import { SystemEventType, SystemEventPayload } from '../types/events';

type EventHandler<T = any> = (payload: SystemEventPayload<T>) => void;

class TypedEventBus {
  private handlers: Map<SystemEventType | '*', Set<EventHandler>> = new Map();

  on<T = any>(eventType: SystemEventType | '*', handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  emit<T = any>(type: SystemEventType, data: T, metadata?: { projectId?: string; senderUserId?: string; senderRole?: string; entityId?: string; entityKey?: string }): void {
    const payload: SystemEventPayload<T> = {
      type,
      projectId: metadata?.projectId,
      senderUserId: metadata?.senderUserId,
      senderRole: metadata?.senderRole,
      entityId: metadata?.entityId,
      entityKey: metadata?.entityKey,
      data,
      timestamp: new Date().toISOString(),
    };

    // Specific handlers
    const specificHandlers = this.handlers.get(type);
    if (specificHandlers) {
      specificHandlers.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${type}:`, err);
        }
      });
    }

    // Wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard handler for ${type}:`, err);
        }
      });
    }
  }
}

export const eventBus = new TypedEventBus();
