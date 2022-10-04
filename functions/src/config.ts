import * as functions from "firebase-functions";

export const SLACK_TOKEN = functions.config().slack?.token || process.env.SLACK_TOKEN;
export const SLACK_CHANNEL = functions.config().slack?.channel ||
    process.env.SLACK_CHANNEL ||
    "meme-of-the-day-game";
export const FIREBASE_STORAGE_BUCKET_NAME = functions.config().storage?.bucketname ||
    process.env.FIREBASE_STORAGE_BUCKET_NAME;
export const FIREBASE_STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s";
