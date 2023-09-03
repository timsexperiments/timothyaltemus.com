import { json } from '@sveltejs/kit';

/** @satisfies {import('./$types').RequestHandler} */
export async function GET({ platform, cookies }) {
  if (!platform?.env?.CHAT_KV) {
    return json({ onlineUsers: [] });
  }

  return json([JSON.parse(cookies.get('user') ?? '[]')]);
  // const { onlineUsers = [] } = await getMembers(platform?.env?.CHAT_KV);
  // return json(onlineUsers ?? []);
}
