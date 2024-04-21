declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				username: string;
				password: string;
				role: string;
				token: string;
				createdAt: Date;
			} | null;
		}
	}
}

export {};
