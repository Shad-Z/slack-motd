import * as appConfig from "./config";
import {createRequest, responseReader} from "./http";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const postToSlack = async (text: string): Promise<any> => {
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

export {postToSlack, getReplies, postView};
