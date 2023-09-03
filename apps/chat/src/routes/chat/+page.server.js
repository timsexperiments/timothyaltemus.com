import { LOGIN_REDIRECT, PLATFORM_ERROR } from '$lib/server/constants';
import { getChat, getMembers } from '$lib/server/kv';

/** @satisfies {import('./$types').PageServerLoad} */
export const load = async ({ platform, cookies }) => {
  if (!platform || !platform.env) {
    throw PLATFORM_ERROR;
  }

  const { messages = [] } = await getChat(platform.env.CHAT_KV);

  const { onlineUsers = [] } = await getMembers(platform.env.CHAT_KV);

  /** @type {User} */
  const user = JSON.parse(cookies.get('user') ?? '{}');

  if (
    !user ||
    !user.username ||
    !user.avatar ||
    onlineUsers?.map(({ username }) => username).includes(user.username)
  ) {
    throw LOGIN_REDIRECT;
  }

  return { user, messages: messages ?? [], onlineUsers: onlineUsers ?? [] };
};
