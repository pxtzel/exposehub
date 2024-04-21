import { SUDO_PASSWORD } from '$env/static/private';
import database from '$lib/database.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }): Promise<Response> {
	const sudoPass = cookies.get('sudo');
	if (sudoPass !== SUDO_PASSWORD) {
		return json(
			{
				ok: false,
				error: 'not authorized'
			},
			{ status: 401 }
		);
	}
	const { name } = await request.json();
	try {
		const recipient = await database.recipient.create({
			data: {
				name
			}
		});
		return json({
			ok: true,
			recipient
		});
	} catch (error) {
		return json({
			ok: false
		});
	}
}
