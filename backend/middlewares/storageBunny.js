import { storageZone, apiKey } from "../config/bunnyConfig.js";

export async function uploadToBunny(fileBuffer, fileName) {
  const path = `videos/${fileName}`;
  const url = `https://storage.bunnycdn.com/${storageZone}/${path}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (res.status === 201) {
    return {
      url: `https://${storageZone}.b-cdn.net/${path}`,
      public_id: path,
    };
  } else {
    throw new Error(`Bunny upload failed: ${res.status} ${res.statusText}`);
  }
}

export async function deleteFromBunny(public_id) {
  const url = `https://storage.bunnycdn.com/${storageZone}/${public_id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: apiKey },
  });

  return res.status === 200;
}
