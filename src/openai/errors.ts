export class OpenAIConfigurationError extends Error {
  constructor() {
    super("Live GPT-5.6 mode is unavailable because OPENAI_API_KEY is not configured.");
    this.name = "OpenAIConfigurationError";
  }
}

export class OpenAIIntegrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIIntegrationError";
  }
}
