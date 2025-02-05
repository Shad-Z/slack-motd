import {postToSlack, getReplies} from "./slack";
import {logger} from "firebase-functions";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;


const gather = async (tsLastMessage: string, db: Firestore) => {
  const replies = await getReplies(tsLastMessage);
  const messages = replies.messages?.slice(1);

  const aggregation = messages.map((current: { reactions: { name: string, count: number }[]; user: string; text: string; }) => {
    const totalPositiveReaction = current?.reactions?.find((el) => el.name === "white_check_mark")?.count ?? 0;
    const totalNegativeReaction = current?.reactions?.find((el) => el.name === "hankey")?.count ?? 0;


    return {
      user: current?.user,
      totalPositiveReaction,
      totalNegativeReaction,
      message: current.text,
    };
  });

  logger.debug(aggregation);
  await db.collection("result").doc().set({createdAt: new Date(), raw: aggregation});


  const maxPositiveReaction = Math.max(...aggregation.map(
    (current: { totalPositiveReaction: number; }) => current.totalPositiveReaction)
  );
  const maxNegativeReaction = Math.max(...aggregation.map(
    (current: { totalNegativeReaction: number; }) => current.totalNegativeReaction)
  );

  if (maxPositiveReaction === 0) {
    await postToSlack("<!channel> Pas de gagnant aujourd'hui bande de fainéant");

    return;
  }

  const winners = aggregation.filter(
    (current: {totalPositiveReaction: number;}) => current.totalPositiveReaction === maxPositiveReaction
  );
  const losers = aggregation.filter(
    (current: {totalNegativeReaction: number;}) => current.totalNegativeReaction === maxNegativeReaction
  );


  const msg = `<!channel>
  Les gagnants sont :
    ${winners.map((winner: {user: string; totalPositiveReaction: number; message: string;}) => `
    * <@${winner.user}> avec ${winner.totalPositiveReaction} réactions :white_check_mark: et la phrase _*${winner.message}*_`
  ).join("")}
  ${maxNegativeReaction === 0 ? "" : `Les personnes absolument pas drôles sont :
    ${losers.map((loser: {user: string; totalNegativeReaction: number; message: string;}) => `
    * <@${loser.user}> avec ${loser.totalNegativeReaction} réactions :hankey: et la phrase _*${loser.message}*_`
  ).join("")}
  `}`;

  await postToSlack(msg);
};

export {gather};
