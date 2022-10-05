import * as functions from "firebase-functions";
import * as slack from "./slack";
import * as admin from "firebase-admin";
import * as memeChooser from "./meme-chooser";

admin.initializeApp();

const postMeme = async (callback: { (jsonBody: string): void; } | null) => {
  functions.logger.info("Start function postMeme");
  let meme: string;
  try {
    meme = await memeChooser.chooseMeme();
  } catch (e) {
    functions.logger.error(e);
    return;
  }

  const responseContent = await slack.postToSlack(meme);
  if (callback) {
    callback(responseContent);
  }
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
      functions.logger.info("Post result");
      return null;
    });
