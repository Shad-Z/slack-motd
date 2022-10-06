import {postToSlack, getReplies, getHistories} from "./slack";

const gather = async () => {
  console.log("Start");
  const histories = await getHistories();
  const tsLastMessage = histories?.messages[0]?.ts;
  const replies = await getReplies(tsLastMessage);
  const messages = replies.messages?.slice(1);

  const aggregation = messages.map((current: { reactions: { name: string, count: number }[]; user: string; }) => {
    const totalReaction = current?.reactions?.find((el) => el.name === "white_check_mark")?.count;

    return {
      user: current?.user,
      totalReaction: totalReaction ?? 0,
    };
  });


  if (!aggregation) {
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

  await postToSlack(`Le gagnant est <@${aggregation[0].user}> avec ${aggregation[0].totalReaction}`);
};

export {gather};
