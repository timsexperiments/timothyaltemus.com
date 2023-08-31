import { error } from '@sveltejs/kit';

export const PLATFORM_ERROR = error(500, {
	message: 'Platform was not found.',
	code: 'Internal Error',
});

/** @type {readonly ['astronaut', 'secret', 'tie', 'nurse', 'basic', 'ninja', 'poo', 'doctor']} */
export const AVATARS = ['astronaut', 'secret', 'tie', 'nurse', 'basic', 'ninja', 'poo', 'doctor'];
