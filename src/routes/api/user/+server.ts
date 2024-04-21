import { json } from '@sveltejs/kit';
import zod from 'zod';
import { SUDO_PASSWORD } from '$env/static/private';
import { sanitizeUser, validate } from '$lib/util.js';
import { createAccount, deleteAccount, updateAccount } from '$lib/account';
import { Prisma } from '@prisma/client';

const UNAUTH_ERR = 'not authorized';

export async function GET({ locals }): Promise<Response> {
	const user = locals.user;
	if (user == null) {
		return json(
			{
				ok: false,
				error: UNAUTH_ERR
			},
			{ status: 401 }
		);
	}
	return json({
		user: sanitizeUser(user)
	});
}

export async function POST({ request, cookies }): Promise<Response> {
	const sudoPass = cookies.get('sudo');
	if (sudoPass !== SUDO_PASSWORD) {
		return json(
			{
				ok: false,
				error: UNAUTH_ERR
			},
			{ status: 401 }
		);
	}
	const { username, role, password } = await request.json();
	const schema = zod.object({
		username: zod
			.string()
			.min(3)
			.toLowerCase()
			.regex(/^[a-z]+$/),
		role: zod.enum(['admin', 'user']),
		password: zod.string().min(5)
	});
	const result = validate(schema, { username, role, password });
	if (Array.isArray(result)) {
		return json(
			{
				ok: false,
				error: result
			},
			{ status: 400 }
		);
	}
	try {
		const user = await createAccount(result);

		cookies.set('auth', user.token, {
			maxAge: 60 * 60 * 24 * 90,
			path: '/'
		});

		return json({
			ok: true,
			user: sanitizeUser(user)
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return json(
				{
					ok: false,
					error: 'username already exists'
				},
				{ status: 400 }
			);
		}
		throw error;
	}
}

// update password, username or role
export async function PATCH({ request, locals, cookies }): Promise<Response> {
	const user = locals.user;
	if (user == null) {
		return json(
			{
				ok: false,
				error: UNAUTH_ERR
			},
			{ status: 401 }
		);
	}
	const { username, password, role } = await request.json();
	const schema = zod.object({
		username: zod
			.string()
			.min(3)
			.toLowerCase()
			.regex(/^[a-z]+$/)
			.optional(),
		role: zod.enum(['admin', 'user']).optional(),
		password: zod.string().min(5).optional()
	});
	const result = validate(schema, { username, role, password });
	if (Array.isArray(result)) {
		return json(
			{
				ok: false,
				error: result
			},
			{ status: 400 }
		);
	}
	const data = Object.fromEntries(Object.entries(result).filter(([_, v]) => v != null));

	if (data.role != null && user.role !== 'admin') {
		return json(
			{
				ok: false,
				error: 'operation not permitted'
			},
			{ status: 401 }
		);
	}

	const updatedUser = await updateAccount(user.id, data);
	if (data.password != null) {
		cookies.set('auth', updatedUser.token, {
			maxAge: 60 * 60 * 24 * 90,
			path: '/'
		});
	}

	return json({
		ok: true,
		user: sanitizeUser(updatedUser)
	});
}

export async function DELETE({ locals, cookies }): Promise<Response> {
	const user = locals.user;
	if (user == null) {
		return json(
			{
				ok: false,
				error: UNAUTH_ERR
			},
			{ status: 401 }
		);
	}
	cookies.delete('auth', {
		path: '/'
	});

	await deleteAccount(user.id);

	return json({
		ok: true
	});
}
