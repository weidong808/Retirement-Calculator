// Runtime config for the optional AI plan-explainer. Disabled (and the UI
// entry point hidden) unless an API key is present, so the calculator works
// exactly as before when unconfigured.

export type ExplainerConfig = {
  configured: boolean;
  apiKey: string;
  model: string;
  baseUrl: string;
};

export function getExplainerConfig(): ExplainerConfig {
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const disabled = process.env.EXPLAINER_AI_DISABLED === "1";
  return {
    configured: apiKey.length > 0 && !disabled,
    apiKey,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    baseUrl:
      process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
  };
}
