import { serializeChatMembers } from './../../../packages/chat-messages/src/index';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {
	ClientEvent,
	ClientEventType,
	ServerEventType,
	User,
	UserProto,
	createChat,
	createChatMembers,
	createClientEvent,
	createMessage,
	createUser,
	deserializeChat,
	deserializeChatMembers,
	deserializeServerEvent,
	serializeChat,
	serializeClientEvent,
	serializeUser,
	serializedStringToUInt8,
} from 'chat-messages';

export interface Env {
	CHAT_KV: KVNamespace;
	CHAT_DO: DurableObjectNamespace;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
};

const CHAT_ROUTE = '/api/ws' as const;
const MESSAGES_ROUTE = '/api/messages' as const;
const MEMBERS_ROUTE = '/api/members' as const;

const CHAT_KV_KEY = 'chat';
const MEMBERS_KV_KEY = 'members';

/** @type {ExportedHandler} */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case CHAT_ROUTE:
				let id = env.CHAT_DO.idFromName(url.pathname);
				let stub = env.CHAT_DO.get(id);
				return await stub.fetch(request);
		}
		return await httpRouter.handler(request, env);
	},
};

export class ChatServer {
	private readonly server: WebSocketServer;

	constructor(
		private readonly state: DurableObjectState,
		private readonly env: Omit<Env, 'CHAT_DO'>,
	) {
		this.env.CHAT_KV.get(MEMBERS_KV_KEY).then(async (members) => {
			if (!members) {
				await this.env.CHAT_KV.put(
					MEMBERS_KV_KEY,
					serializeChatMembers(createChatMembers({ onlineUsers: [] })),
				);
			}
		});

		this.server = new WebSocketServer({
			onJoin: async (server, { session }) => {
				const members = deserializeChatMembers((await this.env.CHAT_KV.get(MEMBERS_KV_KEY))!);
				members.onlineUsers.push(session.user);
				await this.env.CHAT_KV.put(MEMBERS_KV_KEY, serializeChatMembers(members));
				server.broadcast(createClientEvent({ type: ClientEventType.MEMBERS }));
			},
			onLeave: async (server, { session }) => {
				const users = deserializeChatMembers((await this.env.CHAT_KV.get(MEMBERS_KV_KEY))!);
				const newUsers = createChatMembers({
					onlineUsers: users.onlineUsers.filter((user) => user.username !== session.user.username),
				});
				await this.env.CHAT_KV.put(MEMBERS_KV_KEY, serializeChatMembers(newUsers));
				server.broadcast(createClientEvent({ type: ClientEventType.MEMBERS }));
			},
		});
	}

	async fetch(request: Request): Promise<Response> {
		const upgradHeader = request.headers.get('Upgrade');
		if (!upgradHeader || upgradHeader !== 'websocket') {
			return new Response('Expected upgrade: websocket', { status: 426, headers: corsHeaders });
		}

		const url = new URL(request.url);
		const username = url.searchParams.get('username');
		const avatar = url.searchParams.get('avatar');
		if (!username || !avatar) {
			return new Response('User details were not provided.', { status: 412, headers: corsHeaders });
		}

		const chat = await this.env.CHAT_KV.get(CHAT_KV_KEY);
		if (!chat) {
			await this.env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(createChat({ messages: [] })));
		}

		const user = createUser({ avatar, username });

		const wsPair = new WebSocketPair();
		const client = wsPair[0];
		const server = wsPair[1];

		client.addEventListener('close', () => {
			console.log(username, 'just closed the socket...');
		});

		server.addEventListener('error', (e) => {
			console.log('websocket error', e);
		});

		let session = await this.server.addSession({
			socket: server,
			user,
		});
		session.socket.addEventListener('message', async ({ data }) => {
			const event = deserializeServerEvent(data.toString());
			switch (event.type) {
				case ServerEventType.MESSAGE: {
					const chat = deserializeChat((await this.env.CHAT_KV.get(CHAT_KV_KEY))!);
					const newMessage = createMessage({
						id: crypto.randomUUID(),
						author: event.message?.author,
						content: event.message?.content,
						createdAt: new Date(),
					});
					chat.messages.push(newMessage);
					await this.env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(chat));
					this.server.brodcastWithoutSessions(createClientEvent({ type: ClientEventType.CHAT }), [
						session,
					]);
					break;
				}
				case ServerEventType.EDIT: {
					const chat = deserializeChat((await this.env.CHAT_KV.get(CHAT_KV_KEY))!);
					const message = chat.messages.find((message) => message.id === event.message?.id);
					if (!message) {
						throw new Error(`Message ${event.message?.id} does not exist.`);
					}
					await this.env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(chat));
					this.server.brodcastWithoutSessions(createClientEvent({ type: ClientEventType.CHAT }), [
						session,
					]);
					this.server.broadcast(createClientEvent({ type: ClientEventType.CHAT }));
					break;
				}
				case ServerEventType.REACT: {
					this.server.brodcastWithoutSessions(createClientEvent({ type: ClientEventType.CHAT }), [
						session,
					]);
					break;
				}
				case ServerEventType.TYPING: {
					this.server.brodcastWithoutSessions(
						createClientEvent({
							type: ClientEventType.TYPING,
							metadata: {
								type_url: UserProto.name,
								value: serializedStringToUInt8(serializeUser(user)),
							},
						}),
						[session],
					);
					break;
				}
				case ServerEventType.EVENT_TYPE_UNSPECIFIED:
				case ServerEventType.JOIN:
				case ServerEventType.LEAVE:
				default:
			}
		});

		return new Response(null, { status: 101, webSocket: client, headers: corsHeaders });
	}
}

type WebSocketSession = {
	socket: WebSocket;
	user: User;
};

type WebSocketServerEvent = {
	session: WebSocketSession;
};

type WebSocketServerEventHandler = (
	server: WebSocketServer,
	event: WebSocketServerEvent,
) => void | Promise<void>;

type WebSocketServerConstructorArgs = {
	onJoin?: WebSocketServerEventHandler;
	onLeave?: WebSocketServerEventHandler;
};

class WebSocketServer {
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
			console.error(event);
		});

		if (this.onJoin) {
			await this.onJoin(this, { session });
		}
		this.sessions.push(session);

		return session;
	}
}

const httpRouter = {
	async handler(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case MESSAGES_ROUTE:
				if (request.method !== 'GET') {
					return new Response('Method not allowed', { status: 405, headers: corsHeaders });
				}
				return new Response(await env.CHAT_KV.get(CHAT_KV_KEY), {
					headers: {
						...corsHeaders,
						'Content-Type': 'application/x-protobuf', // This should help cloudflare optimize.
					},
				});
			case MEMBERS_ROUTE: {
				if (request.method !== 'GET') {
					return new Response('Method not allowed', { status: 405, headers: corsHeaders });
				}
				const chatMembers = await env.CHAT_KV.get(MEMBERS_KV_KEY);
				return new Response(chatMembers, {
					headers: {
						...corsHeaders,
						'Content-Type': 'application/x-protobuf',
					},
				});
			}
		}
		return new Response('Not found', { status: 404, headers: corsHeaders });
	},
};
