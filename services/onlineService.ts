import { OnlineMessage, Player } from '../types';

type MessageCallback = (msg: OnlineMessage) => void;

class OnlineService {
  private channel: BroadcastChannel | null = null;
  private roomId: string | null = null;
  private onMessageCallback: MessageCallback | null = null;

  connect(roomId: string, onMessage: MessageCallback) {
    this.disconnect(); // Fecha conexão anterior se existir
    this.roomId = roomId;
    this.onMessageCallback = onMessage;
    
    // Cria um canal específico para essa sala
    this.channel = new BroadcastChannel(`tictactoe_room_${roomId}`);
    
    this.channel.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data as OnlineMessage);
      }
    };
  }

  send(message: OnlineMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  disconnect() {
    if (this.channel) {
      // Avisa o outro lado antes de sair
      this.channel.postMessage({ type: 'PLAYER_DISCONNECT' } as OnlineMessage);
      this.channel.close();
      this.channel = null;
    }
    this.roomId = null;
    this.onMessageCallback = null;
  }

  getRoomId() {
    return this.roomId;
  }
}

export const onlineService = new OnlineService();