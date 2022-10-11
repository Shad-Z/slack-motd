import * as admin from "firebase-admin";
import * as config from "./config";

export const getMemeUrls = async () => {
  const memeUrls: string[] = [];
  const files = await admin.storage()
      .bucket()
      .getFiles();

  files[0].map(async (f) => {
    const fileMetadata = await f.getMetadata();
    const url = `https://firebasestorage.googleapis.com/v0/b/${config.STORAGE_BUCKET_NAME}"
    +"/o/${encodeURI(fileMetadata[0].name)}"
    +"?alt=media&token=${fileMetadata[0].metadata.firebaseStorageDownloadTokens}`;
    memeUrls.push(url);
  });

  return memeUrls;
};
