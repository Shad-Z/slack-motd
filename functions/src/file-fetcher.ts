import * as admin from "firebase-admin";
import * as config from "./config";
import * as util from "util";

export const getMemeUrls = async () => {
  const memeUrls: string[] = [];
  const files = await admin.storage()
      .bucket()
      .getFiles();

  for (const f of files[0]) {
    const fileMetadata = await f.getMetadata();
    const url = util.format(
        config.STORAGE_BASE_URL,
        config.STORAGE_BUCKET_NAME,
        encodeURI(fileMetadata[0].name),
        fileMetadata[0].metadata.firebaseStorageDownloadTokens,
    );
    memeUrls.push(url);
  }

  return memeUrls;
};
