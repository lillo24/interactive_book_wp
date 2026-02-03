"use client";

import type { Step, StepResult } from "./types";
import TapTimingGame from "./TapTimingGame";
import StealthPourGame from "./StealthPourGame";
import MosquitoDefenseGame from "./MosquitoDefenseGame";

type StepRendererProps = {
  step: Step;
  onComplete: (result: StepResult) => void;
  existingResult?: StepResult;
  onResetStep?: (stepId: string) => void;
};

export default function StepRenderer({
  step,
  onComplete,
  existingResult,
  onResetStep
}: StepRendererProps) {
  if (step.type === "text") {
    const isComplete = existingResult?.status === "success";

    return (
      <div className="rounded-2xl border border-rose-200 bg-white/90 p-6 shadow-sm">
        <p className="text-rose-900 leading-relaxed">{step.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              onComplete({
                stepId: step.id,
                status: "success"
              })
            }
            disabled={isComplete}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-rose-300 hover:bg-rose-700"
          >
            {isComplete ? "Completato" : "Segna come letto"}
          </button>
          {isComplete && (
            <span className="text-sm text-rose-500">Step completato</span>
          )}
        </div>
      </div>
    );
  }

  if (step.type === "tap_timing") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white/90 p-6 shadow-sm">
        <TapTimingGame
          key={`${step.id}-${existingResult?.status ?? "new"}`}
          step={step}
          onComplete={onComplete}
          existingResult={existingResult}
        />
        {existingResult?.status === "success" && onResetStep && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onResetStep(step.id)}
              className="px-3 py-1 rounded-full border border-rose-300 text-rose-700 text-xs hover:bg-white/70"
            >
              Riprova
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step.type === "stealth_pour") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white/90 p-6 shadow-sm">
        <StealthPourGame
          key={`${step.id}-${existingResult?.status ?? "new"}`}
          step={step}
          onComplete={onComplete}
          existingResult={existingResult}
        />
        {existingResult?.status === "success" && onResetStep && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onResetStep(step.id)}
              className="px-3 py-1 rounded-full border border-rose-300 text-rose-700 text-xs hover:bg-white/70"
            >
              Riprova
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step.type === "mosquito_defense") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white/90 p-6 shadow-sm">
        <MosquitoDefenseGame
          key={`${step.id}-${existingResult?.status ?? "new"}`}
          step={step}
          onComplete={onComplete}
          existingResult={existingResult}
        />
        {existingResult?.status === "success" && onResetStep && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onResetStep(step.id)}
              className="px-3 py-1 rounded-full border border-rose-300 text-rose-700 text-xs hover:bg-white/70"
            >
              Riprova
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
