import {
	ClientEventType,
	ServerEventType,
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
	serializeChatMembers,
	serializeUser,
	serializedStringToUInt8,
} from 'chat-messages';
import { CHAT_KV_KEY, MEMBERS_KV_KEY, corsHeaders } from './constants';
import { WebSocketServer } from './websocket-server';
import { Env } from './worker';

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