import * as functions from "firebase-functions";
import * as slack from "./slack";
import * as admin from "firebase-admin";
import * as memeChooser from "./meme-chooser";
import {gather} from "./gather";
import {httpWebhookController} from "./http-webhook-controller";

admin.initializeApp();

exports.httpWebhook = functions
    .region("europe-west1")
    .https
    .onRequest(httpWebhookController);

exports.scheduledFunction = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 09:00")
    .timeZone("Europe/Paris")
    .onRun(async () => {
      const meme = await memeChooser.chooseMeme();
      await slack.postToSlack(meme);
      return null;
    });

exports.scheduledPostResult = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 17:00")
    .timeZone("Europe/Paris")
    .onRun(async () => {
      await gather();
      return null;
    });
