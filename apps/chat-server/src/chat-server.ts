import {
	ClientEventType,
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
	toProtoTimestamp,
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
		this.server = new WebSocketServer({
			onJoin: async (server, { session }) => {
				console.log(session.user.username, 'just joined the server.');
				const { onlineUsers = [] } = deserializeChatMembers(
					(await this.env.CHAT_KV.get(MEMBERS_KV_KEY))!,
				);
				console.log('The original memebers were: ', onlineUsers);
				onlineUsers.push(session.user);
				console.log(onlineUsers);
				await this.env.CHAT_KV.put(MEMBERS_KV_KEY, serializeChatMembers({ onlineUsers }));
				server.broadcast(createClientEvent({ type: ClientEventType.MEMBERS }));
			},
			onLeave: async (server, { session }) => {
				console.log(session.user.username, 'just is leaving the server.');
				const { onlineUsers = [] } = deserializeChatMembers(
					(await this.env.CHAT_KV.get(MEMBERS_KV_KEY))!,
				);
				console.log('The original memebers were: ', onlineUsers);
				const newUsers = createChatMembers({
					onlineUsers: onlineUsers.filter((user) => user.username !== session.user.username),
				});
				console.log('New users', newUsers);
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
			console.log('Recieved a', event.type, 'event from', user.username + '.');
			switch (event.type) {
				case 'MESSAGE': {
					const chat = deserializeChat((await this.env.CHAT_KV.get(CHAT_KV_KEY))!);
					const newMessage = createMessage({
						id: crypto.randomUUID(),
						author: event.message?.author,
						content: event.message?.content,
						createdAt: new Date(),
					});
					chat.messages?.push(newMessage);
					await this.env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(chat));
					this.server.broadcast(createClientEvent({ type: ClientEventType.CHAT }));
					break;
				}
				case 'EDIT': {
					const chat = deserializeChat((await this.env.CHAT_KV.get(CHAT_KV_KEY))!);
					const message = chat.messages?.find((message) => message.id === event.message?.id);
					if (!message) {
						throw new Error(`Message ${event.message?.id} does not exist.`);
					}
					message.content = event.message?.content;
					message.editedAt = toProtoTimestamp(new Date());
					await this.env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(chat));
					this.server.broadcast(createClientEvent({ type: ClientEventType.CHAT }));
					break;
				}
				case 'REACT': {
					this.server.brodcastWithoutSessions(createClientEvent({ type: ClientEventType.CHAT }), [
						session,
					]);
					break;
				}
				case 'TYPING': {
					const isTyping = event.metadata!['isTyping'];
					this.server.brodcastWithoutSessions(
						createClientEvent({
							type: ClientEventType.TYPING,
							metadata: {
								username: user.username,
								isTyping,
							},
						}),
						[session],
					);
					break;
				}
				case 'EVENT_TYPE_UNSPECIFIED':
				case 'JOIN':
				case 'LEAVE':
				default:
			}
		});

		return new Response(null, { status: 101, webSocket: client, headers: corsHeaders });
	}
}
