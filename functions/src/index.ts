import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore} from "firebase-admin/firestore";
// import {chooseMeme} from "./meme-chooser";
import admin from "firebase-admin";
// import {postToSlack} from "./slack";
import {gather} from "./gather";
import {logger} from "firebase-functions";
// import {onRequest} from "firebase-functions/v2/https";
// import {httpWebhookController} from "./http-webhook-controller";

admin.initializeApp();

const db = getFirestore();

// exports.httpWebhook = onRequest(
//   {region: "europe-west1"},
//   httpWebhookController
// );
//
//
// exports.scheduledFunction = onSchedule({schedule: "every tuesday 09:00", timeZone: "Europe/Paris", region: "europe-west1"}, async () => {
//   const expireAt = new Date();
//   expireAt.setDate(expireAt.getDate() + 365);
//   logger.info(`meme document expire at ${expireAt}`);
//
//   const historyCollection = db.collection("history");
//   let historyDocumentList = await historyCollection.get();
//   if (historyDocumentList.empty) {
//     await historyCollection.doc().set({url: "dummy", name: "first item", expireAt: expireAt});
//     historyDocumentList = await historyCollection.get();
//   }
//   const historyList: string[] = [];
//   historyDocumentList.forEach((doc) => {
//     const docData = doc.data();
//     historyList.push(docData.name);
//   });
//
//   const meme = await chooseMeme(historyList);
//   const msg = `<!here> ${meme.url}
// Rappel des règles :
//
// Tous les mardis, un meme est posté à 9h du matin dans #meme-of-the-week
// Le but du jeu est de poster une phrase afin de créer le meme le plus drôle possible
// Chaque joueur vote ensuite, avec l'emoji :white_check_mark:, pour les phrases qui le font le plus rire
// Le joueur ayant reçu le plus de :white_check_mark: à la fin de la journée gagne !
// (Rien à gagner pour l'instant sauf l'immense honneur d'être Mr/Mme FUN)
//
// Vous pouvez aussi voter pour la pire phrase avec un beau :hankey:, les perdants seront bien entendu shame comme il se doit !
// `;
//   const response = await postToSlack(msg);
//   const docRef = db.collection("slack").doc("latest");
//   await docRef.set(response);
//
//   await historyCollection.doc().set({expireAt: expireAt, ...meme});
// });

exports.scheduledPostResult = onSchedule({schedule: "every tuesday 18:30", timeZone: "Europe/Paris", region: "europe-west1"}, async () => {
  const docRef = db.collection("slack").doc("latest");
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.error("No such document!");
    return;
  }
  const docData = doc.data();
  const tsLastMessage = docData?.message?.ts;
  if (!tsLastMessage) {
    logger.error("ts not found", docData);
    return;
  }

  await gather(tsLastMessage);

});

// exports.scheduledRappelVote = onSchedule({schedule: "
// every tuesday 17:30", timeZone: "Europe/Paris", region: "europe-west1"}, async () => {
//   await postToSlack("<!here> Hop hop hop ! On oublie pas de voter pour Mr/Mme FUN :) Résultat à 18h30 !");
// });

// exports.scheduledStats = onSchedule({schedule: "every tuesday 12:30", timeZone: "Europe/Paris", region: "europe-west1"}, async () => {
//   await postToSlack("<!here> Classement des joueurs sur les 10 derniers meme!");
// });
