/* eslint-disable */
// @ts-nocheck
// Require the Bolt package (github.com/slackapi/bolt)
import { App, ExpressReceiver } from "@slack/bolt";

// If you deploy this app to FaaS, turning this on is highly recommended
// Refer to https://github.com/slackapi/bolt/issues/395 for details
const processBeforeResponse = false;
// The initialization can be deferred until App#init() call when true
const deferInitialization = false;
// Manually instantiate to add external routes afterwards
export const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || "",
  clientSecret: "",
  processBeforeResponse,
  endpoints: {
    events: "/events",
    actions: "/actions",
  },
});

const app = new App({
  token: process.env.SLACK_TOKEN,
  appToken: "",
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  // clientSecret: "",
  receiver,
  processBeforeResponse,
  deferInitialization,
});

// All the room in the world for your code

app.event("app_home_opened", async ({event, client, context}) => {
  try {
    console.log('hello');
    /* view.publish is the method that your app uses to push a view to the Home tab */
    await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
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
              text: "Tous les jours, un meme est posté à *X* heure du matin dans #motd",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Le but du jeu est de poster une phrase afin de créer le meme le plus *drôle* possible",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Chaque joueur vote ensuite, avec l'emoji :white_check_mark:, pour les phrases qui le font le plus rire ",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Le joueur ayant reçu le plus de :white_check_mark: à la fin de la journée gagne ! (Rien à gagner pour l'instant sauf l'immense honneur d'être *Mr/Mme FUN*)",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Ajouter un nouveau meme",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Puisqu'on est sympa, on vous laisse la possibilité d'ajouter vos propres memes.",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Lien png",
            },
          },
          {
            dispatch_action: true,
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "plain_text_input-action",
            },
            label: {
              type: "plain_text",
              text: "Lien vers votre meme (.png/.jpeg)",
              emoji: true,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});
