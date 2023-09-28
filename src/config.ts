import "dotenv/config";

const { LOG_LEVEL, ENDPOINT } = process.env;

export const level = LOG_LEVEL || "info";
export const endpoint = ENDPOINT || "";
