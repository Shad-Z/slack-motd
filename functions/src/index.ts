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
      const msg = `<!here> ${meme}
Rappel des règles :

Tous les mardis, un meme est posté à 9h du matin dans #meme-of-the-week
Le but du jeu est de poster une phrase afin de créer le meme le plus drôle possible
Chaque joueur vote ensuite, avec l'emoji :white_check_mark:, pour les phrases qui le font le plus rire
Le joueur ayant reçu le plus de :white_check_mark: à la fin de la journée gagne !
(Rien à gagner pour l'instant sauf l'immense honneur d'être Mr/Mme FUN)

Vous pouvez aussi voter pour la pire phrase avec un beau :hankey:, les perdants seront bien entendu shame comme il se doit !
`;
      const response = await slack.postToSlack(msg);
      const docRef = db.collection("slack").doc("latest");
      await docRef.set(response);

      return null;
    });

exports.scheduledPostResult = functions
    .region("europe-west1")
    .pubsub
    .schedule("every tuesday 18:30")
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
