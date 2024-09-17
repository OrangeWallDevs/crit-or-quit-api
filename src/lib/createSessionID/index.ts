import crypto from "node:crypto";

export const createSessionID = () => crypto.randomBytes(16).toString("hex");
