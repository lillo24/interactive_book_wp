export type Book = {
  id: string;
  title: string;
  pages: Page[];
};

export type Page = {
  id: string;
  title: string;
  steps: Step[];
};

export type TextStep = {
  id: string;
  type: "text";
  text: string;
};

export type TapTimingStep = {
  id: string;
  type: "tap_timing";
  prompt: string;
  durationMs: number;
  targetStartPct: number;
  targetEndPct: number;
  attemptsAllowed?: number;
};

export type StealthPourStep = {
  id: string;
  type: "stealth_pour";
  prompt: string;
  totalHoldMs: number;
  safeMinMs?: number;
  safeMaxMs?: number;
  unsafeMinMs?: number;
  unsafeMaxMs?: number;
};

export type MosquitoDefenseStep = {
  id: string;
  type: "mosquito_defense";
  prompt: string;
  durationMs: number;
};

export type Step = TextStep | TapTimingStep | StealthPourStep | MosquitoDefenseStep;

export type StepResult = {
  stepId: string;
  status: "success" | "fail";
  score?: number;
  meta?: Record<string, unknown>;
};
