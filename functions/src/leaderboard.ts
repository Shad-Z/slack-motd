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

  const r: {[key: string]: {totalPositiveReaction: number, totalNegativeReaction: number}} = {};
  userReactions.map((v) => {
    if (!r[v.user]) {
      r[v.user] = {
        totalPositiveReaction: v.totalPositiveReaction,
        totalNegativeReaction: v.totalNegativeReaction,
      };
      return;
    }
    r[v.user].totalNegativeReaction += v.totalNegativeReaction;
    r[v.user].totalPositiveReaction += v.totalPositiveReaction;
  });
  const f: {user: string, totalPositiveReaction: number, totalNegativeReaction: number }[] = [];
  for (const i of Object.entries(r)) {
    f.push({user: i[0], ...i[1]});
  }

  return f.sort((a, b) => {
    if (a.totalPositiveReaction < b.totalPositiveReaction) {
      return 1;
    }
    if (a.totalPositiveReaction > b.totalPositiveReaction) {
      return -1;
    }

    return 0;
  });
};

export {leaderboard, Result, UserReaction};
