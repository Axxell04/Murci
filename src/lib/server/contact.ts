import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from './db';
import { eq } from 'drizzle-orm';


export async function createContact (icon: string, text: string, url: string) {
    const id = generateId();
    const contact: table.Contact = {
        id: id,
        icon: icon,
        text: text,
        url: url
    }

    await db.insert(table.contact).values(contact).execute();
}

export async function getContacts () {
    const contacts = await db.select().from(table.contact).execute();
    return contacts;
}

export async function updateContact (id: string, icon: string, text: string, url: string) {
    await db.update(table.contact).set({icon: icon, text: text, url: url}).where(eq(table.contact.id, id)).execute();
}

export async function deleteContact (id: string) {
    await db.delete(table.contact).where(eq(table.contact.id, id)).execute();
}

// Complementary Functions 

function generateId () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id =encodeBase32LowerCase(bytes);
    return id
}