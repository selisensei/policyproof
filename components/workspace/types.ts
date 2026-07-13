export type AppMode = "DETERMINISTIC_DEMO" | "LIVE_GPT_5_6";

export type AiAvailability = {
  available: boolean;
  model: string;
  checking: boolean;
};
