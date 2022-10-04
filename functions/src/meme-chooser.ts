import * as fileFetcher from "./file-fetcher";
import * as randomizer from "./randomizer";

export const chooseMeme = async () => {
  const memeUrls = await fileFetcher.getMemeUrls();
  return randomizer.pickOne(memeUrls);
};
