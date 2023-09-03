import { ClientEvent, User, serializeClientEvent } from 'chat-messages';

export type WebSocketSession = {
	socket: WebSocket;
	user: User;
};

export type WebSocketServerEvent = {
	session: WebSocketSession;
};

export type WebSocketServerEventHandler = (
	server: WebSocketServer,
	event: WebSocketServerEvent,
) => void | Promise<void>;

export type WebSocketServerConstructorArgs = {
	onJoin?: WebSocketServerEventHandler;
	onLeave?: WebSocketServerEventHandler;
};

export class WebSocketServer {
	sessions: WebSocketSession[];
	readonly onJoin?: WebSocketServerEventHandler;
	readonly onLeave?: WebSocketServerEventHandler;

	constructor({ onJoin, onLeave }: WebSocketServerConstructorArgs) {
		this.sessions = [];
		this.onJoin = onJoin;
		this.onLeave = onLeave;
	}

	get length() {
		return this.sessions.length;
	}

	users() {
		return this.sessions.map((session) => session.user);
	}

	sendMessage(session: WebSocketSession, event: ClientEvent) {
		session.socket.send(serializeClientEvent(event));
	}

	broadcast(event: ClientEvent) {
		for (const session of this.sessions) {
			this.sendMessage(session, event);
		}
	}

	brodcastWithoutSessions(event: ClientEvent, exclude: WebSocketSession[] = []) {
		for (const session of this.sessions) {
			if (!exclude.includes(session)) {
				this.sendMessage(session, event);
			}
		}
	}

	async addSession(session: WebSocketSession): Promise<WebSocketSession> {
		const { socket } = session;

		socket.accept();
		socket.addEventListener('close', async () => {
			if (this.onLeave) {
				await this.onLeave(this, { session });
			}
			this.sessions = this.sessions.filter((sess) => {
				return sess !== session;
			});
		});

		socket.addEventListener('error', async (event) => {
			console.error('An error occurred:', event);
		});

		if (this.onJoin) {
			await this.onJoin(this, { session });
		}
		this.sessions.push(session);

		return session;
	}
}
