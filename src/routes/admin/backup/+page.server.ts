import type { Actions } from "./$types";
import AdmZip from "adm-zip";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { fail } from "@sveltejs/kit";
import { arrayBuffer } from "stream/consumers";

const execAync = promisify(exec);

export const actions: Actions = {
    upload: async (event) => {
        const formData = await event.request.formData();
        const backup = formData.get("backup") as unknown as File;
        const force = formData.get("force");
        
        try {
            if (!fs.existsSync("backups/")) {
                fs.mkdirSync("backups/");
            }
            if (!fs.existsSync("uploads/")) {
                fs.mkdirSync("uploads/");
            }
        } catch (error) {
            console.error("Error al crear los directorios objetivos", error);
            return fail(500, { message: 'Internal server error' });            
        }
        
        try {
            if (force) {
                await execAync("node scripts/resetData.js");
            }

            const buffer = await backup.arrayBuffer();
            const zip = new AdmZip(Buffer.from(buffer));
            zip.extractEntryTo("backup/data.json", "backups/", false, true);
            zip.extractEntryTo("backup/imgs/", "uploads/imgs", false, true);
            
            const { stdout, stderr } = await execAync("node scripts/restore.js");
            // console.log("STDOUT:", stdout);
            // if (stderr) console.error("STDERR: ", stderr);
            return {
                success: true
            }
        } catch (error) {
            console.error("Error al realizar la extracción del backup: ", error);
            return fail(500, { message: 'Internal server error' });                        
        }
        
    },
    upload_files: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file") as unknown as File;
        if (!file) return;
        console.log(file)
        fs.mkdirSync("backup/", { recursive: true });
        fs.mkdirSync("uploads/imgs/", { recursive: true });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (file.type === "application/json") fs.writeFileSync(`backup/${file.name}`, buffer);
        // if (file.type === "image/webp") fs.writeFileSync(`uploads/imgs/${file.name}`, buffer)
        return {
            success: true
        }
    }

};