import * as crypto from "crypto";
import {SLACK_SIGNING_SECRET} from "./config";


export const verifySlackSignature = (signature: string, timestamp: string, rawBody: string): boolean => {
  const [version, hash] = signature.split("=");
  const hmac = crypto.createHmac("sha256", SLACK_SIGNING_SECRET as string);
  hmac.update(`${version}:${timestamp}:${rawBody}`);
  const calculatedHash = hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
};
