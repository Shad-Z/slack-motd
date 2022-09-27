import {IncomingMessage, ServerResponse} from "http";

const http = require("http");
const port = process.env.HTTP_PORT || 3000;
const host = process.env.HTTP_HOST || "0.0.0.0";

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    res.write("Hello world")
    res.end()
});
server.listen(port, host, null, () => {
    console.log(`Server is running on ${host}:${port}`);
});

const gracefulShutdown = () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    server.close(() => {
        console.log('Http server closed.');
    });
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
