import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm';

export async function createCatalog (name: string, description?: string) {
    const productId = generateId();
    const catalog: table.Catalog = {
        id: productId,
        name: name,
        description: description ?? ''
    }

    await db.insert(table.catalog).values(catalog).execute();

}

export async function getCatalogs () {
    const catalogs = await db.select().from(table.catalog).execute();
    return catalogs;
}

export async function updateCatalog (id: string, name: string, description: string) {
    await db.update(table.catalog).set({name: name, description: description}).where(eq(table.catalog.id, id)).execute();
}

export async function deleteCatalog (id: string) {
    await db.delete(table.productCatalog).where(eq(table.productCatalog.catalogId, id)).execute();
    await db.delete(table.catalog).where(eq(table.catalog.id, id));
}

export async function validateCatalog (id: string) {
    const exist = (await db.select().from(table.catalog).where(eq(table.catalog.id, id)).execute()).length;
    if (!exist) {
        return false;
    }
    return true;
}

// ProductCatalog Functions
export async function addProductToCatalog (productId: string, catalogId: string) {
    const id = generateId();
    const productCatalog: table.ProductCatalog = {
        id: id,
        productId: productId,
        catalogId: catalogId
    }
    await db.insert(table.productCatalog).values(productCatalog).execute();
}

export async function removeProductToCatalog (id: string) {
    await db.delete(table.productCatalog).where(eq(table.productCatalog.id, id)).execute();
}


// Complementary Functions 

function generateId () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id =encodeBase32LowerCase(bytes);
    return id
}