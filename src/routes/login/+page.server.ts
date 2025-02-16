import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
// import { encodeBase32LowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as auth from '$lib/server/auth'
import * as table from '$lib/server/db/schema'
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, "/admin");
    }
    return {};
}

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!validateUsername(username)) {
            return fail(400, { 
                message: 'Username inválido' 
            });
        }

        if (!validatePassword(password)) {
            return fail(400, {
                message: 'Contraseña inválida'
            });
        }

        const results = await db.select().from(table.user).where(eq(table.user.username, username));

        const existingUser = results.at(0);
        if (!existingUser) {
            return fail(400, {
                message: 'El usuario no existe'
            });
        }

        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });
        if (!validPassword) {
            return fail(400, {
                message: 'Contraseña incorrecta'
            });
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return redirect(302, '/admin')

    }
}

// Functions 
// function generateUserId() {
// 	// ID with 120 bits of entropy, or about the same as UUID v4.
// 	const bytes = crypto.getRandomValues(new Uint8Array(15));
// 	const id = encodeBase32LowerCase(bytes);
// 	return id;
// }

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-zA-Z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
