import {verifySlackSignature} from "./verify-slack-signature";
import {postView} from "./slack";
import {Request} from "firebase-functions/lib/providers/https";
import * as express from "express";
import * as functions from "firebase-functions";
import {createRequest} from "./http";

const httpWebhookController = async (request: Request, response: express.Response) => {
  if (!verifySlackSignature(
      request.headers["x-slack-signature"] as string,
      request.headers["x-slack-request-timestamp"] as string,
      request.rawBody.toString(),
  )) {
    response.statusCode = 403;
    response.header("content-type", "application/json");
    response.send({"message": "failed to check signature"});
    return;
  }

  const event = request.body.event;
  const authorizations = request.body.authorizations;

  if (event.type === "url_verification") {
    functions.logger.info("Event url_verification");
    response.header("content-type", "application/json");
    response.send({"challenge": request.body.challenge});
    return;
  }

  if (event.type === "app_home_opened") {
    functions.logger.info("Event app_home_opened");
    const {user} = event;
    await postView(user, JSON.stringify(homepageView));
    response.header("content-type", "application/json");
    response.send({});
    return;
  }

  if (event.type === "message" && event.channel_type === "im") {
    if (authorizations.length === 0) {
      return;
    }

    const {channel, user, text} = event;
    if (authorizations[0].user_id === user) {
      return;
    }

    functions.logger.info("Event message to app", request.body);
    const message = {
      channel: channel,
      text: "Je n'ai pas compris. Les commandes acceptés sont: help, aide moi",
    };
    if (text.indexOf("help") !== -1 || text.indexOf("aide") !== -1) {
      message.text = "Va dans la home page de l'app pour plus d'info.";
    }

    await createRequest(
        "https://slack.com/api/chat.postMessage",
        "POST",
        JSON.stringify(message),
    );
    response.header("content-type", "application/json");
    response.send({});
    return;
  }

  response.statusCode = 404;
  response.header("content-type", "application/json");
  response.send({"message": "route not found"});
};

const homepageView = {
  type: "home",
  callback_id: "home_view",
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
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Vous pouvez aussi voter pour la pire phrase avec un beau :hankey:, " +
          "les perdants seront bien entendu shame comme il se doit !",
      },
    },
  ],
};

export {httpWebhookController};
