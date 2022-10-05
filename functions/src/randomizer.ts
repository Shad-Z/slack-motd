export const pickOne = (list: string[]): string => {
  const element = list[Math.floor(Math.random() * list.length)];
  if (!element) {
    throw Error("no element picked in list");
  }
  return element;
};
