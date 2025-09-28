import * as table from '$lib/server/db/schema'
import { encodeBase32LowerCase, encodeBase32UpperCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import path from 'path';
import { promises as fs } from 'fs';
import { and, desc, eq, like } from 'drizzle-orm';
import { addProductToCatalog } from './catalog';

type GetProductsOptions = {
    page?: number;
    limit?: number;
    search?: string;
    catalogId?: string;
}

export async function createProduct(name: string, price: number, imgs: FileList, catalogId?: string) {
    const productId = generateId();
    const product: table.Product = {
        id: productId,
        name: name,
        price: price,
        createdAt: new Date()
    }
    
    await db.insert(table.product).values(product).execute();
    // console.log("LastInsertRowid: " + res.lastInsertRowid);
    
    const uploadsDir = path.join(process.cwd(), 'uploads', 'imgs');
    await checkDir(uploadsDir);


    if (imgs.length > 0) {
        for (const img of Array.from(imgs)) {
            const imgId = generateId();
            const imgName = `${generateRandomName()}.webp`;
            const imgURL = await handleImage(img, imgName);

            await db.insert(table.img).values({
                id: imgId,
                url: imgURL,
                productId: productId
            }).execute();
        }
    }
    // console.log('CatalogID: ', catalogId)
    if (catalogId) {
        await addProductToCatalog(productId, catalogId);
    }

}

export async function getProducts (options: GetProductsOptions = {}) {
    // console.log('CatalogID: ', catalogId)
    let { page = 1, limit = 2, search, catalogId } = options;
    const offset = (page - 1) * limit;
    let products: table.Product[];
    
    if (search) {
        const searchPattern = `%${search}%`
        products= !catalogId 
                            ? await db.select().from(table.product).where(like(table.product.name, searchPattern)).limit(limit).offset(offset).orderBy(desc(table.product.createdAt)).execute() 
                            : await db.select({
                                id: table.product.id,
                                name: table.product.name,
                                price: table.product.price,
                                createdAt: table.product.createdAt
                            }).from(table.product).innerJoin(table.productCatalog, eq(table.product.id, table.productCatalog.productId)).where(and(eq(table.productCatalog.catalogId, catalogId ?? ''), like(table.product.name, searchPattern))).limit(limit).offset(offset).orderBy(desc(table.product.createdAt)).execute()
    } else {
        products= !catalogId 
                            ? await db.select().from(table.product).limit(limit).offset(offset).orderBy(desc(table.product.createdAt)).execute() 
                            : await db.select({
                                id: table.product.id,
                                name: table.product.name,
                                price: table.product.price,
                                createdAt: table.product.createdAt
                            }).from(table.product).innerJoin(table.productCatalog, eq(table.product.id, table.productCatalog.productId)).where(eq(table.productCatalog.catalogId, catalogId ?? '')).limit(limit).offset(offset).orderBy(desc(table.product.createdAt)).execute()
    }
                        
                        
    const listProducts: {product: table.Product, imgs: table.Img[]}[] = [];

    for (const product of products) {
        const imgs = await getImgs(product.id);
        listProducts.push({
            product: product,
            imgs: imgs
        })

    } 

    let totalProducts: number;
    if (search) {
        const searchPattern = `%${search}%`;
        totalProducts = !catalogId
            ? (await db.select().from(table.product).where(like(table.product.name, searchPattern)).execute()).length 
            : (await db.select({
                id: table.product.id,
                name: table.product.name,
                price: table.product.price,
                createdAt: table.product.createdAt
            }).from(table.product).innerJoin(table.productCatalog, eq(table.product.id, table.productCatalog.productId)).where(and(eq(table.productCatalog.catalogId, catalogId ?? ''), like(table.product.name, searchPattern))).execute()).length
            
    } else {
        totalProducts = !catalogId
            ? (await db.select().from(table.product).execute()).length 
            : (await db.select({
                id: table.product.id,
                name: table.product.name,
                price: table.product.price,
                createdAt: table.product.createdAt
            }).from(table.product).innerJoin(table.productCatalog, eq(table.product.id, table.productCatalog.productId)).where(eq(table.productCatalog.catalogId, catalogId ?? '')).execute()).length

    }

    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products: listProducts,
        totalPages,
        currentPage: page
    };
}

export async function updateProduct (product_id: string, name: string, price: number, imgs?: FileList, imgsDelete?: string[]) {
    await db.update(table.product).set({name: name, price: price}).where(eq(table.product.id, product_id)).execute();
    if (typeof imgs !== 'undefined') {
        // console.log(imgs);
        if (imgs.length > 0) {
            for (const img of Array.from(imgs)) {
                if (img.name && img.size) {
                    const imgId = generateId();
                    const imgName = `${generateRandomName()}.webp`;
                    const imgURL = await handleImage(img, imgName);
                    await db.insert(table.img).values({
                        id: imgId,
                        url: imgURL,
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
        const filePath = path.join(process.cwd(), 'uploads', img.url);
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

async function handleImage (img: File, imgName: string) {
    // console.log(process.cwd())
    // console.log(await fs.readdir(process.cwd()))

    const uploadsDir = path.join(process.cwd(), 'uploads', 'imgs');

    const buffer = await img.arrayBuffer();
    const filePath = path.join(uploadsDir, imgName);

    await fs.writeFile(filePath, Buffer.from(buffer));

    const imgURL = `/imgs/${imgName}`;

    return imgURL;
}

async function checkDir (path: string) {
    try {
        await fs.access(path)
    } catch {
        await fs.mkdir(path, { recursive: true })
    }
}