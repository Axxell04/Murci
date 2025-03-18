import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { validateCatalog } from '$lib/server/catalog';

const handleAuth: Handle = async ({ event, resolve }) => {
	const catalogId = event.cookies.get('catalog-id');
	if (catalogId) {
		const valid = await validateCatalog(catalogId);
		if (valid) {
			event.locals.catalogId = catalogId;
		} else {
			event.cookies.delete('catalog-id', { path: '/' });
			event.locals.catalogId = '';
		}
	} else {
		event.locals.catalogId = '';
	}

	const cart = event.cookies.get('cart');
	if (cart) {
		event.locals.cart = JSON.parse(cart);
	} else {
		event.locals.cart = [];
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}
	
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = handleAuth;
