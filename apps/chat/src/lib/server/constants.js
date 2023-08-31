import { error } from '@sveltejs/kit';

export const PLATFORM_ERROR = error(500, {
  message: 'Platform was not found.',
  code: 'Internal Error',
});
