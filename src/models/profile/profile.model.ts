import { Schema, model } from "mongoose";

const ProfileSchema = new Schema({
  name: String,
  description: String,
  interests: [String],
  image: String,
  meta: {
    originalName: String,
  },
});

export const Profile = model("Profile", ProfileSchema);
