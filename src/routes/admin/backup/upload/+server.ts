import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";

export const POST: RequestHandler = async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file") as unknown as File;
    if (!file) return json({ success: false, message: "Parámetro archivo no recivido" });
    try {
        if (!fs.existsSync("backups/")) {
            fs.mkdirSync("backups/", { recursive: true });
        }
        if (!fs.existsSync("uploads/imgs/")) {
            fs.mkdirSync("uploads/imgs/", { recursive: true });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (file.type === "application/json") fs.writeFileSync(`backups/${file.name}`, buffer);
        if (file.type === "image/webp") fs.writeFileSync(`uploads/imgs/${file.name}`, buffer)
        return json({ success: true });
    } catch (error) {
        return json({ success: false, message: "Error al realizar la restauración" })
    }
};
