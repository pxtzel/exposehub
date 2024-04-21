import database from '$lib/database.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }): Promise<Response> {
	const { name } = params;
	const recipient = await database.recipient.findFirst({
		where: { name },
		select: {
			id: true,
			name: true
		}
	});
	if (recipient == null) {
		return json({
			ok: false,
			error: 'recipient not found'
		});
	}

	return json({
		ok: true,
		recipient: {
			id: recipient.id,
			name: recipient.name
		}
	});
}
