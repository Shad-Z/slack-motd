import * as fileFetcher from "./file-fetcher";
import * as randomizer from "./randomizer";

export const chooseMeme = async (history: string[]): Promise<{ url: string, name: string }> => {
  const memeUrls = await fileFetcher.getMemeUrls();
  const filteredMemeUrl = memeUrls.filter((v) => {
    return !history.includes(v.name);
  });

  return randomizer.pickOne(filteredMemeUrl);
};
