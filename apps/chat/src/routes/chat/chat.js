import { filter } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

export default class ChatClient {
  constructor() {
    this.socket$ = new WebSocketSubject('ws://your-websocket-url');
  }

  get messages() {
    return this.socket$.pipe(filter((event) => event.type === 'MESSAGES'));
  }

  get members() {
    return this.socket$.pipe(filter((event) => event.type === 'MEMBERS'));
  }

  /**
   * @param {string} message
   */
  sendMessage(message) {
    this.socket$.next(message);
  }

  disconnect() {
    this.socket$.complete();
  }
}
