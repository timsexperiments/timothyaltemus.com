import { createChat, createChatMembers, serializeChat, serializeChatMembers } from 'chat-messages';
import {
	CHAT_KV_KEY,
	corsHeaders as CORS_HEADERS,
	MEMBERS_KV_KEY,
	MEMBERS_ROUTE,
} from './constants';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { CHAT_ROUTE, MESSAGES_ROUTE } from './constants';
export { ChatServer } from './chat-server';

export interface Env {
	CHAT_KV: KVNamespace;
	CHAT_DO: DurableObjectNamespace;
}

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

		const members = await env.CHAT_KV.get(MEMBERS_KV_KEY);
		if (!members) {
			await env.CHAT_KV.put(
				MEMBERS_KV_KEY,
				serializeChatMembers(createChatMembers({ onlineUsers: [] })),
			);
		}

		const chat = await env.CHAT_KV.get(CHAT_KV_KEY);
		if (!chat) {
			await env.CHAT_KV.put(CHAT_KV_KEY, serializeChat(createChat({ messages: [] })));
		}

		return await httpRouter.handler(request, env);
	},
};

const httpRouter = {
	async handler(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case MESSAGES_ROUTE:
				if (request.method !== 'GET') {
					return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
				}
				return new Response(await env.CHAT_KV.get(CHAT_KV_KEY), {
					headers: {
						...CORS_HEADERS,
						'Content-Type': 'application/x-protobuf', // This should help cloudflare optimize.
					},
				});
			case MEMBERS_ROUTE: {
				if (request.method !== 'GET') {
					return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
				}
				const chatMembers = await env.CHAT_KV.get(MEMBERS_KV_KEY);
				return new Response(chatMembers, {
					headers: {
						...CORS_HEADERS,
						'Content-Type': 'application/x-protobuf',
					},
				});
			}
		}
		return new Response('Not found', { status: 404, headers: CORS_HEADERS });
	},
};
