import { fail, redirect } from '@sveltejs/kit';
import z from 'zod';

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ platform, request }) => {
		if (!platform || !platform.env) {
			return fail(500, { error: 'Platform was not provided.' });
		}
		/** @type {string[]} */
		const existingUsernames = JSON.parse((await platform.env.CHAT_KV?.get('online_users')) ?? '[]');
		const formValidator = z.object({
			who: z
				.string()
				.refine(
					(who) => !existingUsernames.includes(who),
					'There is already a user with that name.',
				),
			why: z.string().min(1, 'The reason is required.'),
		});

		const formData = await request.json();

		const parsed = formValidator.safeParse(formData);
		if (parsed.success) {
			const user = { who: parsed.data.who, why: parsed.data.why };
			/** @type {string[]} */
			const visitors = JSON.parse((await platform.env.CHAT_KV.get('visitors')) ?? '[]');
			visitors.push(JSON.stringify(user));
			await platform.env.CHAT_KV.put('visitors', JSON.stringify(Array.from(new Set(visitors))));
			return redirect(303, `/chat?user=${user.who}`);
		}
		const errors = parsed.error.flatten().fieldErrors;
		return { who: { errors: errors.who }, why: { errors: errors.why } };
	},
};
