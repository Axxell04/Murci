import { type RequestHandler } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import path from 'path'

export const GET: RequestHandler = async ({ params }) => {

    const filePath = path.join(process.cwd(), 'uploads', 'imgs', params.slug ?? '');
    
    try {
        const data = await readFile(filePath);
        return new Response(data, { headers: { 'Content-Type': 'image/webp' } });
    } catch {
        return new Response('Archivo no encontrado', { status: 404 });
    }

    
}