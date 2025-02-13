import * as table from '$lib/server/db/schema'
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';

export async function createProduct(name: string, price: number) {
    const productId = generateProduct();
    const product: table.Product = {
        id: productId,
        name: name,
        price: price
    }

    await db.insert(table.product).values(product);
}

function generateProduct () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}