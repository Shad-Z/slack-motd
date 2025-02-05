interface UserReaction {
    user: string;
    totalPositiveReaction: number;
    totalNegativeReaction: number;
    message: string;
}

interface Result {
    createdAt: Date;
    raw: UserReaction[];
}

const leaderboard = (results: Result[]) => {
  const userReactions = results.flatMap((v) => v.raw);
    userReactions.reduce((acc, curr) => {

    });
};
export {leaderboard, Result, UserReaction};
