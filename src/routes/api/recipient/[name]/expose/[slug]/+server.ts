import database from '$lib/database.js';
import { json } from '@sveltejs/kit';

export async function GET({ params, url }): Promise<Response> {
	const { slug } = params;
	const expose = await database.expose.findFirst({
		where: {
			slug
		}
	});

	if (expose == null) {
		return json({
			ok: false,
			error: 'expose not found'
		});
	}

	const redirect = url.searchParams.get('r') == '';

	if (redirect) {
		return Response.redirect(expose.url, 301);
	}

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
