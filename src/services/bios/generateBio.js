import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { BIO_TRAITS } from "./bioTraits.js";
import { getRandomItemFromArray } from "../../utils/arrayUtils.js";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DatingProfile = z.object({
  name: z.string(),
  description: z.string(),
  interests: z.array(z.string()),
});

export const generateBio = async (monsterInfo) => {
  const bioRules = BIO_TRAITS.map((rule) => {
    const randomTrait = rule.customPicking
      ? rule.customPicking(rule.options)
      : getRandomItemFromArray(rule.options);

    return `- ${rule.text(randomTrait)}`;
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert writer and understand everything about love. Your job is to take a D&D 5th edition monster name and description and create a bio for them to put on a dating app.
        Also, you will generate a list of interest inspired on Tinder's options with up to 5 items that match the monsters personality and favorite activities. Here are the rules:
        - You can give the monster a name, but you cant wipe the original name. Things like "Gerald, the Mage" are allowed, but "Gerald" is not.
        - Make sure the bio make their most iconic features shine.
        - You may use emojis if you think it fits the text tone.
        - Feel free to add the modern dating app flair.
        - If the description is empty, you can make one up.
        ${bioRules.join("\n")}`,
      },
      {
        role: "user",
        content: `I am ${
          monsterInfo.name
        }. About me: ${monsterInfo.description.join(" ")}`,
      },
    ],
    response_format: zodResponseFormat(DatingProfile, "dating_profile"),
  });

  const message = completion.choices[0]?.message;

  if (message?.parsed) {
    return { ...message.parsed, meta: { originalName: monsterInfo.name } };
  } else {
    console.log("No parsed message");
    console.log({ completion });
    return {};
  }
};
