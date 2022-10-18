import * as admin from "firebase-admin";
import * as config from "./config";
import * as util from "util";

export const getMemeUrls = async (): Promise<string[]> => {
  const files = await admin.storage()
      .bucket()
      .getFiles();

  return Promise.all(
      files[0].map(async (f) => {
        const fileMetadata = await f.getMetadata();

        return util.format(
            "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
            config.STORAGE_BUCKET_NAME,
            encodeURI(fileMetadata[0].name),
            fileMetadata[0].metadata.firebaseStorageDownloadTokens,
        );
      })
  );
};
