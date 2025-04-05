import { encodeBase32LowerCase } from "@oslojs/encoding";

export function generateId () {
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}