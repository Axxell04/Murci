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
    
    await db.insert(table.product).values(product).execute();

    if (imgs.length > 0) {
        for (const img of Array.from(imgs)) {
            const imgId = generateId();
            const imgPath = `/imgs/${generateRandomName()}.webp`;
            await handleImage(img, imgPath);
            await db.insert(table.img).values({
                id: imgId,
                url: imgPath,
                productId: productId
            }).execute();
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

export async function updateProduct (product_id: string, name: string, price: number, imgs?: FileList, imgsDelete?: string[]) {
    await db.update(table.product).set({name: name, price: price}).where(eq(table.product.id, product_id)).execute();
    if (typeof imgs !== 'undefined') {
        // console.log(imgs);
        if (imgs.length > 0) {
            for (const img of Array.from(imgs)) {
                if (img.name && img.size) {
                    const imgId = generateId();
                    const imgPath = `/imgs/${generateRandomName()}.webp`;
                    await handleImage(img, imgPath);
                    await db.insert(table.img).values({
                        id: imgId,
                        url: imgPath,
                        productId: product_id
                    }).execute();
                }
            }
        }
    }
    if (typeof imgsDelete !== 'undefined') {
        if (imgsDelete.length > 0) {
            for (const imgId of imgsDelete) {
                await deleteImg(imgId);
            }
        }
    }
}

export async function deleteProduct (id: string) {
    const imgs = await getImgs(id);
    for (const img of imgs) {
        await deleteImg(img.id)
    }
    // await db.delete(table.img).where(eq(table.img.productId, id)).execute();
    await db.delete(table.product).where(eq(table.product.id, id)).execute();
}

export async function getImgs (productId: string) {
    const imgs = await db.select().from(table.img).where(eq(table.img.productId, productId)).execute();
    return imgs;
}

// Complementary Functions

export async function deleteImg (id: string, img?: table.Img) {
    if (typeof img === 'undefined') {
        const imgs = await db.select().from(table.img).where(eq(table.img.id, id)).execute();
        if (imgs.length === 0) { return };
        img = imgs[0];
    }
    if (!img) { return }
    try {
        const filePath = path.join(process.cwd(), 'static', img.url);
        await fs.unlink(filePath);
        await db.delete(table.img).where(eq(table.img.id, id)).execute();
    } catch (error) {
        console.log(error)
    }
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