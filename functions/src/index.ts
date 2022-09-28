import * as functions from "firebase-functions";
import * as https from "https";

const SLACK_TOKEN = functions.config().slack?.token || process.env.SLACK_TOKEN;
const SLACK_CHANNEL = functions.config().slack?.channel ||
    process.env.SLACK_CHANNEL ||
    "meme-of-the-day-game";

const postMeme = (callback: { (jsonBody: string): void; }) => {
  functions.logger.info("Start function postMeme");
  const message = {
    channel: SLACK_CHANNEL,
    text: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
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
      callback(body);
    });
  });
  functions.logger.info("Posting meme to slack channel", {payload: message});
  slackReq.write(JSON.stringify(message));
  slackReq.end();
};

export const fnPostMeme = functions.https.onRequest((request, response) => {
  postMeme((jsonBody: string) => {
    response.header("content-type", "application/json");
    response.send(jsonBody);
  });
});
