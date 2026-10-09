import { eventBus } from './eventBus';
import { SystemEventPayload } from '../types/events';

const CHANNEL_NAME = 'AI_ECOSYSTEM_SYNC_CHANNEL';

class BroadcastSyncManager {
  private channel: BroadcastChannel | null = null;
  private isProcessingRemote = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SystemEventPayload>) => {
          this.handleRemoteMessage(event.data);
        };
      } catch (err) {
        console.warn('[BroadcastSync] BroadcastChannel unavailable:', err);
      }
    }

    // Forward local eventBus emissions to BroadcastChannel
    eventBus.on('*', (payload) => {
      if (this.isProcessingRemote) return;
      if (this.channel) {
        try {
          this.channel.postMessage(payload);
        } catch (err) {
          console.warn('[BroadcastSync] Failed to post message:', err);
        }
      }
    });
  }

  private handleRemoteMessage(payload: SystemEventPayload) {
    this.isProcessingRemote = true;
    try {
      // Re-emit on local eventBus so local tab handles it (creates toast/notification/UI refresh)
      eventBus.emit(payload.type, payload.data, {
        projectId: payload.projectId,
        senderUserId: payload.senderUserId,
        senderRole: payload.senderRole,
        entityId: payload.entityId,
        entityKey: payload.entityKey,
      });
    } finally {
      this.isProcessingRemote = false;
    }
  }
}

export const broadcastSyncManager = new BroadcastSyncManager();
