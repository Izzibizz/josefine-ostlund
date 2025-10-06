import { storageZone, apiKey } from "../config/bunnyConfig.js";

export async function deleteFromBunny(public_id) {
  try {
    const url = `https://storage.bunnycdn.com/${storageZone}/${public_id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        AccessKey: apiKey,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to delete from Bunny: ${res.status} ${errText}`);
    }

    console.log(`✅ Deleted from Bunny: ${public_id}`);
  } catch (err) {
    console.error("❌ Failed to delete from Bunny:", err.message);
  }
}
