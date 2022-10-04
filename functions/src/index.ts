import * as functions from "firebase-functions";
import * as slack from './slack';
import * as config from './config';
import * as admin from "firebase-admin";
import * as util from "util";

admin.initializeApp();

const postMeme = async (callback: { (jsonBody: string): void; } | null) => {
  functions.logger.info("Start function postMeme");
  const memeUrls: string[] = [];
  functions.logger.info("Start function postMeme");
  const files = await admin.storage()
      .bucket()
      .getFiles();

  for (const f of files[0]) {
    const fileMetadata = await f.getMetadata();
    const url = util.format(
        config.FIREBASE_STORAGE_BASE_URL,
        config.FIREBASE_STORAGE_BUCKET_NAME,
        encodeURI(fileMetadata[0].name),
        fileMetadata[0].metadata.firebaseStorageDownloadTokens,
    );
    memeUrls.push(url);
  }
  const memeUrl = memeUrls[Math.floor(Math.random() * memeUrls.length)] ?? "no meme found in storage";
  await slack.postToSlack(memeUrl, callback);
};

export const fnPostMeme = functions
    .region("europe-west1")
    .https
    .onRequest((request, response) => {
      postMeme((jsonBody: string) => {
        response.header("content-type", "application/json");
        response.send(jsonBody);
      });
    });

exports.scheduledFunction = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 09:00")
    .timeZone("Europe/Paris")
    .onRun(() => {
      postMeme(null);
      return null;
    });
