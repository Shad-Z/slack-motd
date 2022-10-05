import * as appConfig from "./config";
import {createRequest, responseReader} from "./http";

const postToSlack = async (text: string): Promise<string> => {
  const message = {
    channel: appConfig.SLACK_CHANNEL,
    text: text,
  };
  const slackRes = await createRequest(
      "https://slack.com/api/chat.postMessage",
      "POST",
      JSON.stringify(message),
  );
  return await responseReader(slackRes);
};

const getHistories = async () => {
  const slackRes = await createRequest(
      `https://slack.com/api/conversations.history?channel=${appConfig.SLACK_CHANNEL}&limit=1`,
      "GET",
  );
  return await responseReader(slackRes);
};

const getReplies = async (tsLastMessage: string) => {
  const slackRes = await createRequest(
      `https://slack.com/api/conversations.replies?channel=${appConfig.SLACK_CHANNEL}&ts=${tsLastMessage}`,
      "GET",
  );
  return await responseReader(slackRes);
};

export {postToSlack, getHistories, getReplies};
