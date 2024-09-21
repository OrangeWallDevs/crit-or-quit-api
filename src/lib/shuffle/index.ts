import { randomIntBetween } from "../randomIntBetween";

export const shuffle = <ElementType extends unknown>(
  collection: Array<ElementType>
) => {
  const shuffledCollection: typeof collection = [];

  for (let i = 0; i < collection.length; i++) {
    const j = randomIntBetween(0, i);

    if (i !== j) {
      shuffledCollection[i] = shuffledCollection[j];
    }

    shuffledCollection[j] = collection[i];
  }

  return shuffledCollection;
};
