import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').PageServerLoad} */
export const load = () => {
  throw redirect(302, '/chat/login');
};
