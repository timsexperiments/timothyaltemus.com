import { AVATARS } from '$lib/constants';
import { CHAT_REDIRECT, PLATFORM_ERROR } from '$lib/server/constants';
import { getMembers as getChatMembers } from '$lib/server/kv';
import z from 'zod';

const USER_EXISTS_ERROR = 'There is already a user online with that username.';

/** @satisfies {import('./$types').PageServerLoad} */
export const load = async ({ platform, cookies }) => {
  if (!platform || !platform.env) {
    throw PLATFORM_ERROR;
  }

  /** @type {User} */
  const savedUser = JSON.parse(cookies.get('user') ?? '{}');
  const { onlineUsers = [] } = await getChatMembers(platform.env.CHAT_KV);
  if (onlineUsers?.map(({ username }) => username).includes(savedUser.username)) {
    return {
      initialUsername: savedUser.username,
      initialAvatar: savedUser.avatar,
      who: { errors: [USER_EXISTS_ERROR] },
      why: { errors: [] },
    };
  }
  if (savedUser && savedUser.username && savedUser.avatar) {
    throw CHAT_REDIRECT;
  }
  return { initialUsername: '', initialAvatar: 'basic' };
};

/** @type {import('./$types').Actions} */
export const actions = {
  login: async ({ platform, request, cookies }) => {
    if (!platform || !platform.env) {
      throw PLATFORM_ERROR;
    }
    const { onlineUsers = [] } = await getChatMembers(platform.env.CHAT_KV);
    const formValidator = z.object({
      who: z
        .string()
        .min(1, 'A username is required')
        .refine(
          (who) => !onlineUsers?.map(({ username }) => username).includes(who),
          USER_EXISTS_ERROR,
        ),
      avatar: z.enum(AVATARS),
      why: z.string().min(1, 'The reason is required.'),
    });

    const formData = await request.formData();
    const parsed = formValidator.safeParse({
      who: formData.get('who'),
      avatar: formData.get('avatar'),
      why: formData.get('why'),
    });
    if (parsed.success) {
      const user = { who: parsed.data.who, why: parsed.data.why, avatar: parsed.data.avatar };
      /** @type {string[]} */
      const visitors = JSON.parse((await platform.env.CHAT_KV.get('visitors')) ?? '[]');
      visitors.push(JSON.stringify(user));
      await platform.env.CHAT_KV.put('visitors', JSON.stringify(Array.from(new Set(visitors))));
      cookies.set('user', JSON.stringify({ username: user.who, avatar: user.avatar }), {
        httpOnly: true,
        sameSite: true,
      });
      throw CHAT_REDIRECT;
    }
    const errors = parsed.error.flatten().fieldErrors;
    return { who: { errors: errors.who }, why: { errors: errors.why } };
  },
};
