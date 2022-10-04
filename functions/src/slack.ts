import * as functions from "firebase-functions";
import * as https from "https";
import * as http from "http";
import * as appConfig from "./config"

const postToSlack = async (text: string, callback: { (jsonBody: string): void; } | null) => {
  const slackReq = (text: string): Promise<http.IncomingMessage> => {
    return new Promise((resolve) => {
      functions.logger.info("Prepare posting meme to slack channel");
      const message = {
        channel: appConfig.SLACK_CHANNEL,
        text: text,
      };
      const url = "https://slack.com/api/chat.postMessage";
      const options = {
        headers: {
          "Authorization": "Bearer " + appConfig.SLACK_TOKEN,
          "Content-Type": "application/json; charset=utf-8",
        },
        method: "POST",
      };
      const req = https.request(url, options, resolve);
      req.write(JSON.stringify(message));
      req.end();
      functions.logger.info("Posting meme to slack channel", {payload: message});
    });
  };
  const promiseRes = (slackRes: http.IncomingMessage): Promise<string> => {
    return new Promise((res) => {
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
        res(jsonBody);
      });
    })
  }

  const slackRes = await slackReq(text);
  const jsonBody = await promiseRes(slackRes)
  if (callback) {
    callback(jsonBody)
  }
};

export {postToSlack}
