import { getChat } from '$lib/server/kv';
import { error, json } from '@sveltejs/kit';

/** @satisfies {import('./$types').RequestHandler} */
export async function GET({ platform }) {
  if (!platform?.env?.CHAT_KV) {
    throw error(500);
  }
  const { messages = [] } = await getChat(platform?.env?.CHAT_KV);
  return json(messages ?? []);
}
