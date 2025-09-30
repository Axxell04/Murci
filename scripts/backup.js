import { createClient } from "@libsql/client";
import { config } from "dotenv";
import * as table from "../src/lib/server/db/schema.js";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";

// Cargar variables de entorno desde el archivo .env
config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const client = createClient({ url: process.env.DATABASE_URL })
const db = drizzle(client);

function replacer (key, value) {
    // console.log(`${typeof value}: ${value} | ${/^\d{4}-\d{2}-\d{2}T/.test(value)}`);
    // if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    //     const date = new Date(value);
    //     return date.getTime();
    // };
    return value;
}

async function backup () {
    const data = {
        user: await db.select().from(table.user),
        catalog: await db.select().from(table.catalog),
        contact: await db.select().from(table.contact),
        cost: await db.select().from(table.cost),
        expense: await db.select().from(table.expense),
        product: await db.select().from(table.product),
        img: await db.select().from(table.img),
        productCatalog: await db.select().from(table.productCatalog),
        revenue: await db.select().from(table.revenue),        
        order: await db.select().from(table.order),
        user_token: await db.select().from(table.user_token),
        // session: await db.select().from(table.session),
    }
    if (!fs.existsSync("backups/")) {
        fs.mkdirSync("backups/");
    }
    fs.writeFileSync("backups/data.json", JSON.stringify(data, replacer, 2))
    // console.log(data);
}

backup();