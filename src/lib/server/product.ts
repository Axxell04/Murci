import * as table from '$lib/server/db/schema'
import { encodeBase32LowerCase, encodeBase32UpperCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import path from 'path';
import { promises as fs } from 'fs';
import { eq } from 'drizzle-orm';

export async function createProduct(name: string, price: number, imgs: FileList) {
    const productId = generateId();
    const product: table.Product = {
        id: productId,
        name: name,
        price: price
    }
    
    await db.insert(table.product).values(product);

    if (imgs.length > 0) {
        for (const img of Array.from(imgs)) {
            const imgId = generateId();
            const imgPath = `/imgs/${generateRandomName()}.webp`;
            await handleImage(img, imgPath);
            await db.insert(table.img).values({
                id: imgId,
                url: imgPath,
                productId: productId
            })
        }
    }

}

export async function getProducts () {
    const products = await db.select().from(table.product).execute();
    const listProducts: {product: table.Product, imgs: table.Img[]}[] = [];

    for (const product of products) {
        const imgs = await getImgs(product.id);
        listProducts.push({
            product: product,
            imgs: imgs
        })

    }

    return listProducts;
}

export async function deleteProduct (id: string) {
    await db.delete(table.img).where(eq(table.img.productId, id));
    await db.delete(table.product).where(eq(table.product.id, id));
}

export async function getImgs (productId: string) {
    const imgs = await db.select().from(table.img).where(eq(table.img.productId, productId)).execute();
    return imgs;
}

function generateId () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}

function generateRandomName () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const name = encodeBase32UpperCase(bytes);
    return name;
}

async function handleImage (img: File, imgPath: string) {
    const buffer = await img.arrayBuffer();
    const filePath = path.join(process.cwd(), 'static', imgPath);
    await fs.writeFile(filePath, Buffer.from(buffer));
}