import { customAlphabet } from "nanoid";

const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";

export const generateEventCode = customAlphabet(alphabet, 6);
