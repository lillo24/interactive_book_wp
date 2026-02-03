"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StealthPourStep, StepResult } from "./types";

type StealthPourGameProps = {
  step: StealthPourStep;
  onComplete: (result: StepResult) => void;
  existingResult?: StepResult;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const DEFAULT_SAFE_RANGE = { min: 1600, max: 3200 };
const DEFAULT_UNSAFE_RANGE = { min: 1200, max: 2600 };
const WARNING_MS = 350;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * Math.max(0, max - min);

export default function StealthPourGame({ step, onComplete, existingResult }: StealthPourGameProps) {
  const [phase, setPhase] = useState<"safe" | "warning" | "unsafe">("safe");
  const [isHolding, setIsHolding] = useState(false);
  const [heldMs, setHeldMs] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resets, setResets] = useState(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const totalHoldMs = step.totalHoldMs;
  const safeRange = useMemo(
    () => ({
      min: step.safeMinMs ?? DEFAULT_SAFE_RANGE.min,
      max: step.safeMaxMs ?? DEFAULT_SAFE_RANGE.max
    }),
    [step.safeMaxMs, step.safeMinMs]
  );
  const unsafeRange = useMemo(
    () => ({
      min: step.unsafeMinMs ?? DEFAULT_UNSAFE_RANGE.min,
      max: step.unsafeMaxMs ?? DEFAULT_UNSAFE_RANGE.max
    }),
    [step.unsafeMaxMs, step.unsafeMinMs]
  );

  const isCompleted = existingResult?.status === "success";
  const isSafe = phase !== "unsafe";
  const isWarning = phase === "warning";
  const displayedHeldMs =
    typeof existingResult?.meta?.heldMs === "number"
      ? (existingResult.meta.heldMs as number)
      : heldMs;

  const scheduleNext = (nextPhase: "safe" | "warning" | "unsafe") => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    if (nextPhase === "warning") {
      timerRef.current = window.setTimeout(() => {
        setPhase("warning");
      }, randomBetween(safeRange.min, safeRange.max));
      return;
    }

    if (nextPhase === "unsafe") {
      timerRef.current = window.setTimeout(() => {
        setPhase("unsafe");
      }, WARNING_MS);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setPhase("safe");
    }, randomBetween(unsafeRange.min, unsafeRange.max));
  };

  useEffect(() => {
    scheduleNext("warning");
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCompleted) {
      return;
    }
    if (phase === "safe") {
      scheduleNext("warning");
      return;
    }
    if (phase === "warning") {
      scheduleNext("unsafe");
      return;
    }
    scheduleNext("safe");
  }, [phase, isCompleted, safeRange.max, safeRange.min, unsafeRange.max, unsafeRange.min]);

  useEffect(() => {
    if (isCompleted) {
      return;
    }

    if (phase === "unsafe" && isHolding && heldMs > 0) {
      setHeldMs(0);
      setResets(prev => prev + 1);
      setFeedback("Ti hanno visto! Riparti da zero.");
    }
  }, [heldMs, isHolding, isCompleted, phase]);

  useEffect(() => {
    if (!isHolding || !isSafe || isCompleted) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTickRef.current = null;
      return;
    }

    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      const delta = now - last;
      lastTickRef.current = now;

      setHeldMs(prev => {
        const next = clamp(prev + delta, 0, totalHoldMs);
        if (next >= totalHoldMs) {
          onComplete({
            stepId: step.id,
            status: "success",
            score: 100,
            meta: {
              heldMs: totalHoldMs,
              resets
            }
          });
          setFeedback("Versato tutto! Ottimo lavoro.");
          return totalHoldMs;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isHolding, isSafe, isCompleted, onComplete, resets, step.id, totalHoldMs]);

  const handleHoldStart = () => {
    if (isCompleted) {
      return;
    }
    if (phase === "unsafe") {
      setHeldMs(0);
      setResets(prev => prev + 1);
      setFeedback("Ti hanno visto! Riparti da zero.");
      setIsHolding(false);
      return;
    }
    setFeedback(null);
    setIsHolding(true);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    lastTickRef.current = null;
  };

  const progressPct = clamp((displayedHeldMs / totalHoldMs) * 100, 0, 100);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-rose-900 font-medium">{step.prompt}</p>
        <p className="text-sm text-rose-600">
          Tieni premuto solo quando non ti vedono. Serve un totale di {(totalHoldMs / 1000).toFixed(1)}s.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isSafe
              ? isWarning
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {isSafe ? (isWarning ? "Attento" : "Sicuro") : "Visto"}
        </span>
        <span className="text-sm text-rose-700">
          Stato: {isHolding ? "Premuto" : "Rilasciato"}
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-rose-100 border border-rose-200 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-emerald-400 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="text-sm text-rose-700">
        Tempo versato: {(displayedHeldMs / 1000).toFixed(1)}s / {(totalHoldMs / 1000).toFixed(1)}s
      </div>

      <button
        type="button"
        onPointerDown={handleHoldStart}
        onPointerUp={handleHoldEnd}
        onPointerLeave={handleHoldEnd}
        onPointerCancel={handleHoldEnd}
        disabled={isCompleted}
        className="px-5 py-2 rounded-full bg-rose-600 text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-rose-300 hover:bg-rose-700"
      >
        {isCompleted ? "Completato" : isHolding ? "Versando..." : "Tieni premuto"}
      </button>

      {feedback && <div className="text-sm text-rose-700">{feedback}</div>}
    </div>
  );
}
