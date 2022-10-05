import { postToSlack, getReplies, getHistories } from './slack';

const gather = async () => {
    console.log('Start');
    const histories = await getHistories();
    const tsLastMessage = JSON.parse(histories)?.messages[0]?.ts;
    const replies = await getReplies(tsLastMessage)
    const messages = JSON.parse(replies).messages?.slice(1);

    const aggregation = messages.map((current: { reactions: any[]; user: any; }) => {
        const totalReaction = current?.reactions?.find((el) => el.name === 'white_check_mark')?.count

        console.log(totalReaction);
        return {
            user: current?.user,
            totalReaction: totalReaction ?? 0,
        };
    })

    console.log(aggregation);

    // const lol = aggregation.reduce((previousValue, currentValue) => {
    //     if (previousValue.length === 0) {
    //         return currentValue;
    //     }
    //
    //     if (previousValue[0]?.totalReaction < currentValue?.total) {
    //         return [currentValue];
    //     }
    //
    //     if (previousValue[0]?.totalReaction === currentValue?.totalReaction) {
    //         return [...previousValue, currentValue];
    //     }
    //
    //     return previousValue;
    // }, [])

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

    await postToSlack(`Le gagnant est <@${aggregation[0].user}>`);

    console.log(aggregation);
    // console.log(Math.max.apply(Math, aggregation.map((o) => { return o?.totalReaction || 0; })));
}
gather().then(() => {})
