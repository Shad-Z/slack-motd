import * as https from 'https';
import { postToSlack } from './slack';

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL ||
    "meme-of-the-day-game";

const url = `https://slack.com/api/conversations.history?channel=${SLACK_CHANNEL}&limit=1`;
const options = {
    headers: {
        "Authorization": "Bearer " + SLACK_TOKEN,
        "Content-Type": "application/json; charset=utf-8",
    },
};

console.log('Start');
https.get(url, options, (response) => {

    let body = '';
    response.on('data', (data: string) => {
        body += data;
    });

    response.on('end', () => {
        const jsonBody = JSON.parse(body);

        const tsLastMessage = jsonBody?.messages[0]?.ts;

        const urlListReply = `https://slack.com/api/conversations.replies?channel=${SLACK_CHANNEL}&ts=${tsLastMessage}`

        https.get(urlListReply, options, (response) => {
            let body = '';
            response.on('data', (data: string) => {
                body += data;
            });

            response.on('end', () => {
                const jsonBody = JSON.parse(body);
                const messages = jsonBody?.messages?.slice(1);
                const aggregation = messages.map((current, index) => {
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

                aggregation.sort((a, b) => {
                    if (a?.totalReaction > b?.totalReaction) {
                        return -1;
                    }
                    if (a?.totalReaction < b?.totalReaction) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                });

                postToSlack(`Le gagnant est <@${aggregation[0].user}>`, null);

                console.log(aggregation);
                // console.log(Math.max.apply(Math, aggregation.map((o) => { return o?.totalReaction || 0; })));
            });
        })
    })
});