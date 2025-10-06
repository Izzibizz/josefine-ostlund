import dotenv from "dotenv";
dotenv.config();

export const storageZone = process.env.BUNNY_STORAGE_ZONE;
export const apiKey = process.env.BUNNY_STORAGE_API_KEY;

if (!storageZone || !apiKey) {
  throw new Error("Bunny config saknas! Kolla .env");
}