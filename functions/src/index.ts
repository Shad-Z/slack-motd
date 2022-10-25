import * as functions from "firebase-functions";
import * as slack from "./slack";
import * as admin from "firebase-admin";
import * as memeChooser from "./meme-chooser";
import {gather} from "./gather";
import {postView} from "./slack";

admin.initializeApp();

exports.httpWebhook = functions
    .region("europe-west1")
    .https
    .onRequest(async (request, response) => {
      functions.logger.info("received log", request.body);
      if (request.body.type == "url_verification") {
        response.header("content-type", "application/json");
        response.send({"challenge": request.body.challenge});
        return;
      }

      if (request.body.event.type == "app_home_opened") {
        const {user} = request.body.event;

        const view = {
          type: "home",
          callback_id: "home_view",

          /* body of the view */
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Bienvenue sur le meilleur jeu slack jamais développé",
              },
            },
            {
              type: "divider",
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "Règles",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Tous les jours, un meme est posté à 9h " +
                    "du matin dans #meme-of-the-day",
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Le but du jeu est de poster une phrase afin de " +
                    "créer le meme le plus *drôle* possible",
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Chaque joueur vote ensuite, avec l'emoji " +
                    ":white_check_mark:, pour les phrases qui le font le plus rire ",
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Le joueur ayant reçu le plus de :white_check_mark: " +
                    "à la fin de la journée gagne ! (Rien à gagner pour " +
                    "l'instant sauf l'immense honneur d'être *Mr/Mme FUN*)",
              },
            },
          ],
        };
        await postView(user, JSON.stringify(view));
        response.header("content-type", "application/json");
        response.send({});
        return;
      }

      response.statusCode = 404;
      response.header("content-type", "application/json");
      response.send({"message": "route not found"});
    });

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
