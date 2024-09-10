import { getRandomIntegerBetween } from "./randomUtils.js";

export const getRandomItemFromArray = (array) => {
  const randomIndex = getRandomIntegerBetween(0, array.length - 1);

  return array[randomIndex];
};
