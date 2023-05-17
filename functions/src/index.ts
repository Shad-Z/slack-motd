import * as functions from "firebase-functions";
import * as slack from "./slack";
import * as admin from "firebase-admin";
import * as memeChooser from "./meme-chooser";
import {gather} from "./gather";
import {httpWebhookController} from "./http-webhook-controller";
import {getFirestore} from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore();

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
      const response = await slack.postToSlack(meme);
      const docRef = db.collection("slack").doc("latest");
      await docRef.set(response);

      return null;
    });

exports.scheduledPostResult = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 17:00")
    .timeZone("Europe/Paris")
    .onRun(async () => {
      const docRef = db.collection("slack").doc("latest");
      const doc = await docRef.get();
      if (!doc.exists) {
        functions.logger.error("No such document!");
        return null;
      }
      const docData = doc.data();
      const tsLastMessage = docData?.message?.ts;
      if (!tsLastMessage) {
        functions.logger.error("ts not found", docData);
        return null;
      }

      await gather(tsLastMessage);
      return null;
    });
