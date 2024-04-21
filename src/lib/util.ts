import type { User } from '@prisma/client';
import crypto from 'node:crypto';
import type { ZodError, ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>, data: any): T | ZodError[] {
	try {
		return schema.parse(data);
	} catch (error: any) {
		return error.errors;
	}
}

export function generateToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

export function sanitizeUser(user: any): Pick<User, 'id' | 'username' | 'role' | 'createdAt'> {
	const { id, username, role, createdAt } = user;
	return { id, username, role, createdAt };
}
