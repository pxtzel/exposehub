import zod from 'zod';
import database from '$lib/database';
import { json } from '@sveltejs/kit';
import { validate } from '$lib/util.js';

export async function GET({ params, url }): Promise<Response> {
	const { name } = params;

	const recipient = await database.recipient.findFirst({
		where: { name },
		select: {
			id: true,
			name: true,
			exposes: true
		}
	});

	if (recipient == null) {
		return json({
			ok: false,
			error: 'recipient not found'
		});
	}
	const randomExpose = url.searchParams.get('random') == '';

	if (randomExpose) {
		if (recipient.exposes.length === 0) {
			return json({
				ok: false,
				error: 'no exposes'
			});
		}

		const randomIndex = Math.floor(Math.random() * recipient.exposes.length);
		const expose = recipient.exposes[randomIndex];
		return json({
			ok: true,
			expose: {
				id: expose.id,
				title: expose.title,
				url: expose.url,
				slug: expose.slug
			}
		});
	}

	return json({
		ok: true,
		exposes: recipient.exposes.map((expose) => ({
			id: expose.id,
			title: expose.title,
			url: expose.url,
			slug: expose.slug
		}))
	});
}

export async function POST({ request, locals }): Promise<Response> {
	if (locals.user == null) {
		return json(
			{
				ok: false,
				error: 'not authorized'
			},
			{ status: 401 }
		);
	}

	let { title, url, recipients, slug } = await request.json();
	const schema = zod.object({
		title: zod.string().min(1),
		url: zod.string().url(),
		slug: zod.string().min(1).max(15).optional(),
		recipients: zod.array(zod.string())
	});
	const result = validate(schema, { title, url, recipients, slug });
	if (Array.isArray(result)) {
		return json(
			{
				ok: false,
				error: result
			},
			{ status: 400 }
		);
	}

	const recipientRecords = await database.recipient.findMany({
		where: {
			name: {
				in: recipients
			}
		}
	});

	const recipientIds = recipientRecords.map((r) => r.id);

	if (recipientIds.length === 0) {
		return json(
			{
				ok: false,
				error: 'no recipients found'
			},
			{ status: 400 }
		);
	}

	if (slug == null) {
		slug = Math.random().toString(36).substring(2, 15);
	}

	try {
		const expose = await database.expose.create({
			data: {
				title,
				url,
				slug,
				recipients: {
					connect: recipientIds.map((id) => ({ id }))
				},
				user: {
					connect: {
						id: locals.user.id
					}
				}
			}
		});

		return json({
			ok: true,
			expose: {
				id: expose.id,
				title: expose.title,
				url: expose.url,
				slug: expose.slug
			}
		});
	} catch (error) {
		return json({
			ok: false,
			error: 'failed to create expose; slug may already be in use'
		});
	}
}
