// See https://svelte.dev/docs/kit/types#app.d.ts

import type { PurchaseDetail } from '$lib/interfaces/cart';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			catalogId: string | undefined;
			cart: PurchaseDetail[];
			orderViewState: string | undefined;
		}
	}
}

export {};
