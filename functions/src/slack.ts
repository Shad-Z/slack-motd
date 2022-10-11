import * as appConfig from "./config";
import {createRequest, responseReader} from "./http";

const postToSlack = async (text: string): Promise<string> => {
  const message = {
    channel: appConfig.SLACK_CHANNEL,
    text: text,
  };
  const slackRes = await createRequest(
      "chat.postMessage",
      "POST",
      JSON.stringify(message),
  );
  return responseReader(slackRes);
};

const getHistories = async () => {
  const slackRes = await createRequest(
      `conversations.history?channel=${appConfig.SLACK_CHANNEL}&limit=1`,
      "GET",
  );
  return responseReader(slackRes);
};

const getReplies = async (tsLastMessage: string) => {
  const slackRes = await createRequest(
      `conversations.replies?channel=${appConfig.SLACK_CHANNEL}&ts=${tsLastMessage}`,
      "GET",
  );
  return responseReader(slackRes);
};

export {postToSlack, getHistories, getReplies};
