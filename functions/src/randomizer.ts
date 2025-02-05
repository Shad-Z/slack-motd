export const pickOne = (list: { url: string, name: string }[]): { url: string, name: string } => {
  const element = list[Math.floor(Math.random() * list.length)];
  if (!element) {
    throw Error("no element picked in list. add mooarrr meme!");
  }
  return element;
};
