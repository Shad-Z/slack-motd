import * as functions from "firebase-functions";
import * as https from "https";
import * as admin from "firebase-admin";
import * as util from "util";

const SLACK_TOKEN = functions.config().slack?.token || process.env.SLACK_TOKEN;
const SLACK_CHANNEL = functions.config().slack?.channel ||
    process.env.SLACK_CHANNEL ||
    "meme-of-the-day-game";
const FIREBASE_STORAGE_BUCKET_NAME = functions.config().storage?.bucketname ||
    process.env.FIREBASE_STORAGE_BUCKET_NAME;
const FIREBASE_STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s";

admin.initializeApp();

const postMeme = async (callback: { (jsonBody: string): void; } | null) => {
  const memeUrls: string[] = [];
  functions.logger.info("Start function postMeme");
  const files = await admin.storage()
      .bucket()
      .getFiles();

  for (const f of files[0]) {
    const fileMetadata = await f.getMetadata();
    const url = util.format(
        FIREBASE_STORAGE_BASE_URL,
        FIREBASE_STORAGE_BUCKET_NAME,
        encodeURI(fileMetadata[0].name),
        fileMetadata[0].metadata.firebaseStorageDownloadTokens,
    );
    memeUrls.push(url);
  }
  const memeUrl = memeUrls[Math.floor(Math.random() * memeUrls.length)];
  const message = {
    channel: SLACK_CHANNEL,
    text: memeUrl,
  };
  const url = "https://slack.com/api/chat.postMessage";
  const options = {
    headers: {
      "Authorization": "Bearer " + SLACK_TOKEN,
      "Content-Type": "application/json; charset=utf-8",
    },
    method: "POST",
  };
  const slackReq = https.request(url, options, (slackRes) => {
    functions.logger.info("Prepare posting meme to slack channel");
    let body = "";
    slackRes.on("data", (data: string) => {
      functions.logger.debug("Read response from slack");
      body += data;
    });
    slackRes.on("end", () => {
      const jsonBody = JSON.parse(body);
      const logResponseAs = jsonBody.ok ?
          functions.logger.info :
          functions.logger.error;
      logResponseAs(
          "Output slack response",
          {ok: jsonBody.ok, error: jsonBody?.error}
      );
      if (callback) {
        callback(body);
      }
    });
  });
  functions.logger.info("Posting meme to slack channel", {payload: message});
  slackReq.write(JSON.stringify(message));
  slackReq.end();
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

exports.scheduledPostResult = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 17:00")
    .timeZone("Europe/Paris")
    .onRun(() => {
      functions.logger.info("Post result")
      return null;
    });
