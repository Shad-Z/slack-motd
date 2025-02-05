import * as admin from "firebase-admin";
import * as config from "./config";
import * as util from "util";

export const getMemeUrls = async (): Promise<{url: string, name: string}[]> => {
  const files = await admin.storage()
    .bucket()
    .getFiles();

  return Promise.all(
    files[0].map(async (f) => {
      const fileMetadata = await f.getMetadata();
      const file = fileMetadata[0];
      if (!file || !file.name || !file.metadata) {
        return {url: "", name: ""};
      }
      const url = util.format(
        "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
        config.STORAGE_BUCKET_NAME,
        encodeURI(file.name),
        file.metadata.firebaseStorageDownloadTokens,
      );

      return {url: url, name: file.name};
    })
  );
};
