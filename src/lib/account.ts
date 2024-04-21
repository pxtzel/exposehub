import bcrypt from 'bcrypt';
import { generateToken } from '$lib/util';
import database from './database';
import type { User } from '@prisma/client';

export async function createAccount({
	username,
	role,
	password
}: {
	username: string;
	role: string;
	password: string;
}): Promise<User> {
	const hash = await bcrypt.hash(password, 10);
	const token = generateToken();
	const user = await database.user.create({
		data: {
			username,
			role,
			password: hash,
			token
		}
	});
	return user;
}

// update function to optionally update role, password, or username or everything
// update hash on pass change

export async function updateAccount(
	id: any,
	{
		username,
		role,
		password
	}: {
		username?: string;
		role?: string;
		password?: string;
	}
): Promise<User> {
	const data: any = {};
	if (username) {
		data.username = username;
	}
	if (role) {
		data.role = role;
	}
	if (password) {
		data.password = await bcrypt.hash(password, 10);
		data.token = generateToken();
	}
	const user = await database.user.update({
		where: {
			id
		},
		data
	});
	return user;
}

export async function deleteAccount(id: any): Promise<User> {
	const user = await database.user.delete({
		where: {
			id
		}
	});
	return user;
}
