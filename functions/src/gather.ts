import {postToSlack, getReplies} from "./slack";

const gather = async (tsLastMessage: string) => {
  const replies = await getReplies(tsLastMessage);
  const messages = replies.messages?.slice(1);

  const aggregation = messages.map((current: { reactions: { name: string, count: number }[]; user: string; }) => {
    const totalReaction = current?.reactions?.find((el) => el.name === "white_check_mark")?.count ?? 0;

    if (totalReaction <= 0) {
      return;
    }

    return {
      user: current?.user,
      totalReaction: totalReaction,
    };
  });

  if (aggregation.filter((el: { user: string; totalReaction: number}) => el).length === 0) {
    await postToSlack("Pas de gagnant aujourd'hui bande de fainéant");

    return;
  }

  aggregation.sort((a: { totalReaction: number; }, b: { totalReaction: number; }) => {
    if (a?.totalReaction > b?.totalReaction) {
      return -1;
    }
    if (a?.totalReaction < b?.totalReaction) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  await postToSlack(`Le gagnant est <@${aggregation[0].user}> avec ${aggregation[0].totalReaction} réactions`);
};

export {gather};
