import { getRandomItemFromArray } from "../../utils/arrayUtils.js";

export const BIO_TRAITS = [
  {
    text: (option) => `The bio must convey a ${option} tone.`,
    options: [
      "playful",
      "humorous",
      "sincere",
      "introspective",
      "bold",
      "confident",
      "romantic",
      "dreamy",
      "mysterious",
      "enigmatic",
      "adventurous",
      "thrill-seeking",
      "caring",
      "nurturing",
      "dark",
      "brooding",
      "eccentric",
      "quirky",
      "wise",
      "philosophical",
      "confident",
      "assertive",
      "loyal",
      "devoted",
      "cautious",
      "guarded",
      "flirty",
      "charming",
      "gentle",
      "compassionate",
      "proud",
      "majestic",
      "energetic",
      "enthusiastic",
      "sarcastic",
      "witty",
      "hopeful",
      "optimistic",
      "pragmatic",
      "realistic",
    ],
    customPicking: (options) => {
      const firstTrait = getRandomItemFromArray(options);
      const remainingOptions = options.filter((trait) => trait !== firstTrait);
      const secondTrait = getRandomItemFromArray(remainingOptions);

      return `${firstTrait} and ${secondTrait}`;
    },
  },
  {
    text: (option) => `The bio must be ${option}.`,
    options: [
      "short like a tweet",
      "short like a letter to a friend",
      "short like an elevator small-talk",
      "short like it's superficial and has nothing to say for real",
      "short like a list of activities they want to do with their SO",
      "short like they were forced by their friends to make a dating profile",
      "a short blurb, up to 3 senteces",
      "medium like a letter to a friend",
      "long like you're trying to defend yourself from a very serious accusation",
    ],
  },
  {
    text: (option) => `This monster is looking for a ${option} partner.`,
    options: ["short-term", "long-term"],
  },
  {
    text: (option) => `This monster is ${option}.`,
    options: [
      "single",
      "single",
      "already in a relationship and doesn't want other people to know",
      "already in a relationship and does want other people to know",
      "is in a non-monogamic relationship",
    ],
  },
  {
    text: (option) =>
      `This monster ${option} show subtle signs of being a toxic partner.`,
    options: ["does", "does not"],
  },
  {
    text: (option) => `The monster sexuality is ${option}.`,
    options: ["bisexual", "straight", "homossexual", "pansexual", "assexual"],
  },
];
