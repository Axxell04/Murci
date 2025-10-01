import type { RequestHandler } from "./$types";
import { spawn } from "child_process";
import { json } from "@sveltejs/kit";
import path from "path";
import fs from "fs";

export const GET: RequestHandler = async () => {

    const data = { name: "Axel", project: "Murci" };
    // const json = JSON.stringify(data, null, 2);

    const scriptPath = path.resolve("scripts/backup.js");

    return new Promise ((resolve) => {
        const process = spawn("node", [scriptPath]);
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        process.stderr.on('data', (data) => {
            console.error("Error: ", data.toString());
        });
        process.on('close', (code) => {
            console.log(`Script finalizado con código ${code}`);
            const backup = fs.readFileSync("backups/data.json", "utf-8");
            resolve(new Response (backup, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="MurciBackup-${new Date().toISOString()}.json"`
                }
            }));
        })
    })

    // return new Response(json, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Content-Disposition': `attachment; filename="MurciBackup-${new Date().toISOString()}.json"`
    //     }
    // })
};