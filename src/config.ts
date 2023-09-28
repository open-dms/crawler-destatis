import "dotenv/config";

const { LOG_LEVEL } = process.env;

export const level = LOG_LEVEL || "info";
