import { getMembers } from '$lib/server/kv';
import { json } from '@sveltejs/kit';

/** @satisfies {import('./$types').RequestHandler} */
export async function GET({ platform }) {
  if (!platform?.env?.CHAT_KV) {
    return json({ messages: [] });
  }
  const { onlineUsers = [] } = await getMembers(platform?.env?.CHAT_KV);
  return json(onlineUsers ?? []);
}
