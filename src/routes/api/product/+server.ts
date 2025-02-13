import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";



export const GET: RequestHandler = async ({fetch}) => {
    const res = await fetch('/productos.json');
    const data = await res.json()
    return json(data)
}