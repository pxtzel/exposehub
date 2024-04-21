import { type Handle } from '@sveltejs/kit';
import database from '$lib/database';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('auth');
	if (token != null && typeof token === 'string') {
		const user = await database.user.findFirst({
			where: {
				token
			}
		});
		if (user != null) {
			event.locals.user = user;
		}
	}
	return await resolve(event);
};
