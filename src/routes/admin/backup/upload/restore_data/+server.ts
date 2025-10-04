import type { RequestHandler } from "./$types";
import { promisify } from "util";
import { exec } from "child_process";
import { json } from "@sveltejs/kit";

const execAsync = promisify(exec);

export const GET: RequestHandler = async ({ request }) => {
    try {
        await execAsync("node scripts/restore.js");
        return json({ success: true });
    } catch (error) {
        return json({ success: false, message: "Error al ejecutar el comando" });
    }

};