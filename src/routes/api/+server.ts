import { json } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	return json({
		maintainers: ['adithya', 'daniel'],
		staff: ['pokeblox'],
		message: 'a storage and management utility for our personal "expose" collection'
	});
}
