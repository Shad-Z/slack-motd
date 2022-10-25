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
  return responseReader(slackRes);
};

const getHistories = async () => {
  const slackRes = await createRequest(
      `https://slack.com/api/conversations.history?channel=${appConfig.SLACK_CHANNEL}&limit=1`,
      "GET",
  );
  return responseReader(slackRes);
};

const getReplies = async (tsLastMessage: string) => {
  const slackRes = await createRequest(
      `https://slack.com/api/conversations.replies?channel=${appConfig.SLACK_CHANNEL}&ts=${tsLastMessage}`,
      "GET",
  );
  return responseReader(slackRes);
};

const postView = async (userId: string, view: string) => {
  const message = {
    user_id: userId,
    view: view,
  };
  const slackRes = await createRequest(
      "https://slack.com/api/views.publish",
      "POST",
      JSON.stringify(message),
  );
  return responseReader(slackRes);
};

export {postToSlack, getHistories, getReplies, postView};
