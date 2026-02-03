"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StepResult, TapTimingStep } from "./types";

type TapTimingGameProps = {
  step: TapTimingStep;
  onComplete: (result: StepResult) => void;
  existingResult?: StepResult;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Difficulty = "easy" | "medium" | "hard" | "impossible";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    requiredStreak: number;
    shrinkFactor: number;
    speedIncrease: number;
    minTargetWidthPct: number;
    minCycleMs: number;
  }
> = {
  easy: {
    label: "Easy",
    requiredStreak: 3,
    shrinkFactor: 0.9,
    speedIncrease: 1.05,
    minTargetWidthPct: 12,
    minCycleMs: 220
  },
  medium: {
    label: "Medium",
    requiredStreak: 5,
    shrinkFactor: 0.8,
    speedIncrease: 1.15,
    minTargetWidthPct: 8,
    minCycleMs: 160
  },
  hard: {
    label: "Hard",
    requiredStreak: 6,
    shrinkFactor: 0.7,
    speedIncrease: 1.25,
    minTargetWidthPct: 6,
    minCycleMs: 120
  },
  impossible: {
    label: "Impossible",
    requiredStreak: 8,
    shrinkFactor: 0.6,
    speedIncrease: 1.35,
    minTargetWidthPct: 4,
    minCycleMs: 90
  }
};

export default function TapTimingGame({ step, onComplete, existingResult }: TapTimingGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isRunning, setIsRunning] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [totalTaps, setTotalTaps] = useState(0);
  const [successStreak, setSuccessStreak] = useState(0);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [targetStart, setTargetStart] = useState(0);
  const [targetEnd, setTargetEnd] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

  const baseTarget = useMemo(() => {
    const startRaw = clamp(step.targetStartPct, 0, 100);
    const endRaw = clamp(step.targetEndPct, 0, 100);
    const start = Math.min(startRaw, endRaw);
    const end = Math.max(startRaw, endRaw);
    const width = clamp(Math.abs(end - start), config.minTargetWidthPct, 80);
    const center = clamp((start + end) / 2, width / 2, 100 - width / 2);
    return {
      width,
      center,
      start: clamp(center - width / 2, 0, 100),
      end: clamp(center + width / 2, 0, 100)
    };
  }, [config.minTargetWidthPct, step.targetEndPct, step.targetStartPct]);

  const targetCenter = useMemo(() => (targetStart + targetEnd) / 2, [targetStart, targetEnd]);
  const targetHalfWidth = useMemo(() => {
    const half = Math.abs(targetEnd - targetStart) / 2;
    return half > 0 ? half : 0.01;
  }, [targetStart, targetEnd]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const tick = (now: number) => {
      const startTime = startTimeRef.current ?? now;
      const elapsed = now - startTime;
      const cycleMs = Math.max(step.durationMs / speedMultiplier, config.minCycleMs);
      const phase = elapsed % (cycleMs * 2);
      const pct =
        phase <= cycleMs
          ? (phase / cycleMs) * 100
          : (1 - (phase - cycleMs) / cycleMs) * 100;
      setProgressPct(pct);

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.minCycleMs, isRunning, speedMultiplier, step.durationMs]);

  useEffect(() => {
    setTargetStart(baseTarget.start);
    setTargetEnd(baseTarget.end);
  }, [baseTarget]);

  const randomizeTarget = (width: number) => {
    const clampedWidth = clamp(width, config.minTargetWidthPct, 90);
    const minCenter = clampedWidth / 2;
    const maxCenter = 100 - clampedWidth / 2;
    const center = minCenter + Math.random() * (maxCenter - minCenter);
    setTargetStart(clamp(center - clampedWidth / 2, 0, 100));
    setTargetEnd(clamp(center + clampedWidth / 2, 0, 100));
  };

  const resetGame = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    setProgressPct(0);
    setFeedback(null);
    setTotalTaps(0);
    setSuccessStreak(0);
    setScoreTotal(0);
    setTargetStart(baseTarget.start);
    setTargetEnd(baseTarget.end);
    setSpeedMultiplier(1);
  };

  useEffect(() => {
    resetGame();
  }, [baseTarget.start, baseTarget.end, difficulty]);

  const handleStart = () => {
    if (existingResult?.status === "success") {
      return;
    }
    setFeedback(null);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    startTimeRef.current = null;
  };

  const handleTap = () => {
    if (!isRunning || existingResult?.status === "success") {
      return;
    }

    const currentPct = progressPct;
    const isSuccess = currentPct >= targetStart && currentPct <= targetEnd;
    const nextTotalTaps = totalTaps + 1;
    setTotalTaps(nextTotalTaps);

    if (isSuccess) {
      const distance = Math.abs(currentPct - targetCenter);
      const normalized = clamp(1 - distance / targetHalfWidth, 0, 1);
      const score = Math.round(normalized * 100);
      const nextScoreTotal = scoreTotal + score;
      const nextStreak = successStreak + 1;

      setScoreTotal(nextScoreTotal);
      setSuccessStreak(nextStreak);
      setSpeedMultiplier(prev => prev * config.speedIncrease);

      if (nextStreak >= config.requiredStreak) {
        const finalScore = Math.round(nextScoreTotal / config.requiredStreak);
        setFeedback(`Successo! Hai completato la sfida.`);
        setIsRunning(false);
        startTimeRef.current = null;

        onComplete({
          stepId: step.id,
          status: "success",
          score: finalScore,
          meta: {
            difficulty,
            totalTaps: nextTotalTaps,
            successStreak: nextStreak,
            averageScore: finalScore,
            lastTapScore: score,
            finalPositionPct: Number(currentPct.toFixed(2))
          }
        });

        return;
      }

      setFeedback(`Colpito! (${nextStreak}/${config.requiredStreak}) Punteggio ${score}.`);

      const nextWidth = Math.max(
        config.minTargetWidthPct,
        Math.abs(targetEnd - targetStart) * config.shrinkFactor
      );
      randomizeTarget(nextWidth);

      return;
    }

    const missBy =
      currentPct < targetStart ? targetStart - currentPct : currentPct - targetEnd;

    setSuccessStreak(0);
    setScoreTotal(0);
    setSpeedMultiplier(1);
    setTargetStart(baseTarget.start);
    setTargetEnd(baseTarget.end);
    setFeedback(`Mancato di ${missBy.toFixed(1)}%. Serie azzerata.`);
  };

  const isCompleted = existingResult?.status === "success";
  const storedTotalTaps =
    typeof existingResult?.meta?.totalTaps === "number"
      ? (existingResult.meta.totalTaps as number)
      : null;
  const displayTotalTaps = storedTotalTaps ?? totalTaps;
  const currentWidth = Math.abs(targetEnd - targetStart);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-rose-700">Difficolta:</span>
        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(level => {
          const isActive = level === difficulty;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              disabled={isCompleted}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                isActive
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white/70 text-rose-700 border-rose-300 hover:bg-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {DIFFICULTY_CONFIG[level].label}
            </button>
          );
        })}
      </div>
      <div>
        <p className="text-rose-900 font-medium">{step.prompt}</p>
        <p className="text-sm text-rose-600">
          Durata: {(step.durationMs / 1000).toFixed(1)}s - Zona target {targetStart.toFixed(1)}% to{" "}
          {targetEnd.toFixed(1)}%
        </p>
      </div>

      <div className="relative h-4 rounded-full bg-rose-100 border border-rose-200 overflow-hidden">
        <div
          className="absolute top-0 h-full bg-rose-300/70"
          style={{ left: `${targetStart}%`, width: `${targetEnd - targetStart}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-600 shadow"
          style={{ left: `${progressPct}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onPointerDown={isRunning ? handleTap : handleStart}
          disabled={isCompleted}
          className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-rose-300 hover:bg-rose-700"
        >
          {isCompleted ? "Completato" : isRunning ? "Tap!" : "Start"}
        </button>
        <button
          type="button"
          onClick={isRunning ? handleStop : resetGame}
          disabled={isCompleted}
          className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm transition disabled:cursor-not-allowed disabled:text-rose-300 hover:bg-white/70"
        >
          {isRunning ? "Stop" : "Reset"}
        </button>
        <div className="text-sm text-rose-700">
          Tap: {displayTotalTaps} - Serie: {successStreak}/{config.requiredStreak} - Larghezza:{" "}
          {currentWidth.toFixed(1)}% - Velocita: {speedMultiplier.toFixed(2)}x
        </div>
      </div>

      {feedback && <div className="text-sm text-rose-700">{feedback}</div>}

      {isCompleted && existingResult?.score !== undefined && (
        <div className="text-sm text-rose-700">
          Punteggio finale: {existingResult.score}
        </div>
      )}
    </div>
  );
}
