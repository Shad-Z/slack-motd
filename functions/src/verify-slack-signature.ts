import * as crypto from "crypto";
import {SLACK_SIGNING_SECRET} from "./config";


export const verifySlackSignature = (request: any): boolean => {
  const hmac = crypto.createHmac("sha256", SLACK_SIGNING_SECRET as string);
  hmac.update(`v0:${request.headers["x-slack-request-timestamp"]}:${request.rawBody}`);

  const [, hash] = request.headers["x-slack-signature"].split("=");
  const calculatedHash = hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
};
