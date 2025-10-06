// services/storageBunny.js
import fs from "fs";
import { storageZone, apiKey } from "../config/bunnyConfig.js";

async function getFetch() {
  if (globalThis.fetch) return globalThis.fetch;
  const mod = await import("node-fetch");
  return mod.default;
}

export async function uploadToBunny(filePath, fileName) {
  const pathOnBunny = `videos/${Date.now()}-${fileName}`; // unikt namn
  const url = `https://storage.bunnycdn.com/${storageZone}/${pathOnBunny}`;

  const fetch = await getFetch();
  const stream = fs.createReadStream(filePath);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: stream,
  });

  if (res.status === 201 || res.status === 200) {
    return {
      url: `https://${storageZone}.b-cdn.net/${pathOnBunny}`,
      public_id: pathOnBunny,
    };
  } else {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed: ${res.status} ${res.statusText} ${text}`);
  }
}

export async function deleteFromBunny(public_id) {
  // public_id = e.g. "videos/163423423-myvideo.mp4"
  const url = `https://storage.bunnycdn.com/${storageZone}/${public_id}`;
  const fetch = await getFetch();
  const res = await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: apiKey },
  });

  // Bunny returnerar 200 vid framgång
  return res.status === 200;
}
