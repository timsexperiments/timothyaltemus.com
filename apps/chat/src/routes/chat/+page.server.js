import { LOGIN_REDIRECT, PLATFORM_ERROR } from '$lib/server/constants';
import { getChat, getMembers } from '$lib/server/kv';

/** @satisfies {import('./$types').PageServerLoad} */
export const load = async ({ platform, cookies }) => {
  if (!platform || !platform.env) {
    throw PLATFORM_ERROR;
  }

  const chat = await getChat(platform.env.CHAT_KV);
  const messages = (chat.messages ?? []).map((message) => message);

  const members = await getMembers(platform.env.CHAT_KV);
  const onlineUsers = (members.onlineUsers ?? []).map((member) => member);

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
