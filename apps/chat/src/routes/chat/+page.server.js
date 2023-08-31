import { PLATFORM_ERROR } from '$lib/server/constants';
import { getOnlineUsers, saveOnlineUsers } from '$lib/server/kv';
import { redirect } from '@sveltejs/kit';

const LOGIN_REDIRECT = redirect(303, '/login');

/** @satisfies {import('./$types').PageServerLoad} */
export const load = async ({ platform, cookies }) => {
	if (!platform || !platform.env) {
		throw PLATFORM_ERROR;
	}

	const onlineUsers = await getOnlineUsers(platform.env.CHAT_KV);

	/** @type {User} */
	const user = JSON.parse(cookies.get('user') ?? '{}');
	if (
		!user ||
		!user.username ||
		!user.avatar ||
		onlineUsers.map(({ username }) => username).includes(user.username)
	) {
		throw LOGIN_REDIRECT;
	}

	onlineUsers.push(user);
	saveOnlineUsers(platform.env.CHAT_KV, onlineUsers);
	return { user, onlineUsers };
};
