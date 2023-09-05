import { PUBLIC_CHAT_WS } from '$env/static/public';
import {
  ClientEventType,
  ServerEventType,
  createMessage,
  createServerEvent,
  deserializeClientEvent,
  deserializeTypingMetadata,
  serializeServerEvent,
} from 'chat-messages';
import { writable } from 'svelte/store';

export default class ChatClient {
  /**
   * @param {User} user
   * @param {import('chat-messages').Message[]} initialMessages
   * @param {User[]} initialMembers
   */
  constructor(user, initialMessages = [], initialMembers = []) {
    /** @type {import('svelte/store').Writable<import('chat-messages').Message[]>} */
    this.messages = writable(initialMessages);
    /** @type {import('svelte/store').Writable<User[]>} */
    this.members = writable(initialMembers);
    this.error = writable(null);
    this.isConnected = writable(false);
    /** @type {import('svelte/store').Writable<string[]>} */
    this.typing = writable([]);
    /** @type {string[]} */
    this.typingUsers = [];
    this.user = user;
    /** @type {import('chat-messages').Message[]} */
    this.previousMessage = initialMessages;

    // Attach username and avatar to the WebSocket URL
    const wsURL = new URL(PUBLIC_CHAT_WS);
    wsURL.searchParams.append('username', user.username);
    wsURL.searchParams.append('avatar', user.avatar);

    this.ws = new WebSocket(wsURL);

    this.ws.addEventListener('open', () => {
      this.isConnected.set(true);
    });

    this.ws.addEventListener('message', ({ data }) => {
      const clientEvent = deserializeClientEvent(data);
      this.handleClientEvent(clientEvent);
    });

    this.ws.addEventListener('close', () => {
      this.isConnected.set(false);
    });

    window.addEventListener(
      'beforeunload',
      (event) => {
        event.preventDefault();
        try {
          this.ws.close(1000);
        } catch (error) {
          console.error(error);
          this.ws.close();
        }
        return (event.returnValue = '');
      },
      { capture: true },
    );
  }

  async updateMembers() {
    await fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        this.members.set(data);
      })
      .catch((err) => {
        this.error.set(err);
      });
  }

  updateMessages() {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        this.messages.set(data);
        this.previousMessage = data;
      })
      .catch((err) => {
        this.error.set(err);
        this.messages.set(this.previousMessage);
      });
  }

  /**
   * @param {import('chat-messages').ClientEvent} clientEvent
   */
  handleClientEvent(clientEvent) {
    switch (clientEvent.type) {
      case ClientEventType.MEMBERS: {
        this.updateMembers();
        break;
      }
      case ClientEventType.CHAT: {
        this.updateMessages();
        break;
      }
      case ClientEventType.TYPING: {
        const { isTyping, user } = deserializeTypingMetadata(
          clientEvent.metadata?.value?.toString() ?? '',
        );
        const { username } = user ?? {};
        if (isTyping && username) {
          this.typingUsers.push(username);
          this.typing.set(this.typingUsers);
        } else {
          this.typingUsers = this.typingUsers.filter((user) => user !== username);
          this.typing.set(this.typingUsers);
        }
        break;
      }
    }
  }

  /**
   * Sends a message to the chat server.
   *
   * @param {string} message
   */
  sendMessage(message) {
    const newMessage = createMessage({
      author: this.user,
      content: message,
      createdAt: new Date(),
    });
    const event = createServerEvent({
      type: ServerEventType.MESSAGE,
      actingUser: this.user,
      message: newMessage,
    });
    this.ws.send(serializeServerEvent(event));
    this.messages.set([...this.previousMessage, newMessage]);
    setTimeout(() => this.updateMessages(), 1000);
  }

  /**
   * Sends a typing event.
   *
   * @param {boolean} isTyping true to indicate the person is typing or false to indicate the person is done typing.
   */
  sendTypingEvent(isTyping) {
    const event = createServerEvent({
      type: ServerEventType.TYPING,
      actingUser: this.user,
      metadata: { isTyping: `${isTyping}` },
    });
    this.ws.send(serializeServerEvent(event));
  }
}
