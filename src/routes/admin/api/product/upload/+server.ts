import { json } from "@sveltejs/kit";
import type { RequestHandler } from "../$types";
import fs from "fs";
import { bindImg, createProduct, getProducts } from "$lib/server/product";

export const POST: RequestHandler = async ({ request, locals }) => {
    const formData = await request.formData();
    const phase = formData.get("phase") as string;    
    const catalogId = locals.catalogId;
    if (!phase) return json({ success: false, message: "Parámetro 'phase' no encontrado" });

    if (phase === "1") {
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        
        try {
            const productId = await createProduct(name, price, catalogId);
            return json({ success: true, productId })
        } catch (error) {
            console.log(error);
            return json({ success: false, message: 'Internal server error' });
        }
    } else if (phase === "2") {
        const img = formData.get("img") as File | null;
        const index = formData.get("index") as string;
        const productId = formData.get("product-id") as string;
        if (!img) return json({ success: false, message: "Parámetro 'img' no encontrado" });
        await bindImg(productId, img);
        // const arrayBuffer = await img.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        // fs.mkdirSync("upimg/", { recursive: true });
        // fs.writeFileSync(`upimg/${index}.webp`, buffer);
        return json({ success: true });
    } else if (phase === "3") {
        const pagination = await getProducts({catalogId});
        return json({ success: true , pagination: pagination});
    }
    return json({ success: false, message: "Parámetro 'phase' es incorrecto" })
};