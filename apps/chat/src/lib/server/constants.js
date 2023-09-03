import { error, redirect } from '@sveltejs/kit';

export const PLATFORM_ERROR = error(500, {
  message: 'Platform was not found.',
  code: 'Internal Error',
});

export const CHAT_REDIRECT = redirect(303, `/chat`);

export const LOGIN_REDIRECT = redirect(303, '/chat/login');
