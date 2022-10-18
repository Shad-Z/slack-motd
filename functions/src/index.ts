import * as functions from "firebase-functions";
import * as slack from "./slack";
import * as admin from "firebase-admin";
import * as memeChooser from "./meme-chooser";
import {gather} from "./gather";
import {receiver} from "./app_slack";

admin.initializeApp();

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

exports.slack = functions
    .region("europe-west1")
    .runWith({
      memory: "1GB",
      secrets: [
        // "SLACK_TOKEN",
        // "SLACK_SIGNING_SECRET",
      //   "SLACK_APP_TOKEN",
      ],
    })
    .https.onRequest(receiver.app);
