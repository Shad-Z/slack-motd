import * as functions from "firebase-functions";
import * as https from "https";
import * as http from "http";
import * as appConfig from "./config";

const createRequest = (url: string, method: string, jsonContent = ""): Promise<http.IncomingMessage> => {
  return new Promise((resolve) => {
    const options = {
      headers: {
        "Authorization": "Bearer " + appConfig.SLACK_TOKEN,
        "Content-Type": "application/json; charset=utf-8",
      },
      method: method,
    };
    const req = https.request(url, options, resolve);
    if (jsonContent) {
      req.write(jsonContent);
    }
    req.end();
  });
};

const responseReader = (httpResponse: http.IncomingMessage): Promise<any> => {
  return new Promise((resolve) => {
    let body = "";
    httpResponse.on("data", (data: string) => {
      body += data;
    });

    httpResponse.on("end", () => {
      const jsonBody = JSON.parse(body);
      const logResponseAs = jsonBody.ok ?
          functions.logger.info :
          functions.logger.error;
      logResponseAs(
          "Output slack response",
          {ok: jsonBody.ok, error: jsonBody?.error}
      );
      resolve(jsonBody);
    });
  });
};

export {createRequest, responseReader};
