"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MosquitoDefenseStep, StepResult } from "./types";

type MosquitoDefenseGameProps = {
  step: MosquitoDefenseStep;
  onComplete: (result: StepResult) => void;
  existingResult?: StepResult;
};

type Difficulty = "easy" | "medium" | "hard" | "impossible";

type Mosquito = {
  id: string;
  x: number;
  y: number;
  speed: number;
};

type Splat = {
  id: string;
  x: number;
  y: number;
};

type HitPing = {
  id: string;
  x: number;
  y: number;
};

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    speedMin: number;
    speedMax: number;
    baseSpawnMs: number;
    minSpawnMs: number;
    spawnRampMsPerSec: number;
    maxMosquitoes: number;
  }
> = {
  easy: {
    label: "Easy",
    speedMin: 30,
    speedMax: 60,
    baseSpawnMs: 1400,
    minSpawnMs: 700,
    spawnRampMsPerSec: 8,
    maxMosquitoes: 16
  },
  medium: {
    label: "Medium",
    speedMin: 40,
    speedMax: 80,
    baseSpawnMs: 1100,
    minSpawnMs: 520,
    spawnRampMsPerSec: 12,
    maxMosquitoes: 22
  },
  hard: {
    label: "Hard",
    speedMin: 55,
    speedMax: 100,
    baseSpawnMs: 850,
    minSpawnMs: 380,
    spawnRampMsPerSec: 16,
    maxMosquitoes: 28
  },
  impossible: {
    label: "Impossible",
    speedMin: 70,
    speedMax: 120,
    baseSpawnMs: 650,
    minSpawnMs: 260,
    spawnRampMsPerSec: 20,
    maxMosquitoes: 34
  }
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const randomBetween = (min: number, max: number) =>
  min + Math.random() * Math.max(0, max - min);

export default function MosquitoDefenseGame({
  step,
  onComplete,
  existingResult
}: MosquitoDefenseGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mosquitoes, setMosquitoes] = useState<Mosquito[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [squashed, setSquashed] = useState(0);
  const [resets, setResets] = useState(0);
  const [damage, setDamage] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [splats, setSplats] = useState<Splat[]>([]);
  const [hitPings, setHitPings] = useState<HitPing[]>([]);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const spawnAccumulatorRef = useRef(0);
  const elapsedRef = useRef(0);
  const squashedRef = useRef(0);
  const resetsRef = useRef(0);
  const damageRef = useRef(0);
  const mosquitoesRef = useRef<Mosquito[]>([]);
  const flashTimerRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];
  const durationMs = step.durationMs;

  const isCompleted = existingResult?.status === "success";
  const displayedElapsed =
    typeof existingResult?.meta?.elapsedMs === "number"
      ? (existingResult.meta.elapsedMs as number)
      : elapsedMs;

  useEffect(() => {
    squashedRef.current = squashed;
  }, [squashed]);

  useEffect(() => {
    resetsRef.current = resets;
  }, [resets]);

  useEffect(() => {
    damageRef.current = damage;
  }, [damage]);

  useEffect(() => {
    const updateBounds = () => {
      if (!arenaRef.current) {
        return;
      }
      const rect = arenaRef.current.getBoundingClientRect();
      boundsRef.current = { width: rect.width, height: rect.height };
    };

    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    if (arenaRef.current) {
      observer.observe(arenaRef.current);
    }

    window.addEventListener("resize", updateBounds);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  const resetGame = useCallback(() => {
    setIsRunning(false);
    setElapsedMs(0);
    elapsedRef.current = 0;
    setMosquitoes([]);
    mosquitoesRef.current = [];
    setFeedback(null);
    setSquashed(0);
    setResets(0);
    setDamage(0);
    setHitFlash(false);
    setSplats([]);
    setHitPings([]);
    squashedRef.current = 0;
    resetsRef.current = 0;
    damageRef.current = 0;
    lastTickRef.current = null;
    spawnAccumulatorRef.current = 0;
  }, []);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const getBounds = () => {
    let { width, height } = boundsRef.current;
    if ((width === 0 || height === 0) && arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      boundsRef.current = { width, height };
    }
    return { width, height };
  };

  const spawnMosquito = (now: number) => {
    const { width, height } = getBounds();
    if (width === 0 || height === 0) {
      return null;
    }

    const padding = 0;
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = randomBetween(0, width);
      y = -padding;
    } else if (side === 1) {
      x = width + padding;
      y = randomBetween(0, height);
    } else if (side === 2) {
      x = randomBetween(0, width);
      y = height + padding;
    } else {
      x = -padding;
      y = randomBetween(0, height);
    }

    const speed = randomBetween(config.speedMin, config.speedMax);

    return {
      id: `${now}-${Math.random().toString(16).slice(2)}`,
      x,
      y,
      speed
    };
  };

  const playTone = (frequency: number, durationMs: number) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => undefined);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = frequency;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Ignore audio errors.
    }
  };

  const triggerHitFlash = () => {
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    setHitFlash(true);
    flashTimerRef.current = window.setTimeout(() => {
      setHitFlash(false);
    }, 200);
  };

  const triggerHitPing = () => {
    const { width, height } = getBounds();
    if (width === 0 || height === 0) {
      return;
    }
    const pingId = `hit-${performance.now()}-${Math.random().toString(16).slice(2)}`;
    const ping = { id: pingId, x: width / 2, y: height / 2 };
    setHitPings(prev => [...prev, ping]);
    window.setTimeout(() => {
      setHitPings(prev => prev.filter(item => item.id !== pingId));
    }, 350);
  };

  useEffect(() => {
    if (!isRunning || isCompleted) {
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

      const nextElapsed = Math.min(elapsedRef.current + delta, durationMs);
      elapsedRef.current = nextElapsed;
      setElapsedMs(nextElapsed);

      const elapsedSeconds = nextElapsed / 1000;
      const spawnInterval = Math.max(
        config.minSpawnMs,
        config.baseSpawnMs - elapsedSeconds * config.spawnRampMsPerSec
      );
      const spawnBurst = Math.min(1 + Math.floor(elapsedSeconds / 6), 5);

      let didFail = false;
      let newDamage = 0;
      const currentMosquitoes = mosquitoesRef.current;
      const next: Mosquito[] = [];
      const { width, height } = getBounds();
      const centerX = width / 2;
      const centerY = height / 2;
      const centerRadius = Math.min(width, height) * 0.08;

      if (width === 0 || height === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const spawnList = [...currentMosquitoes];
      spawnAccumulatorRef.current += delta;
      while (
        spawnAccumulatorRef.current >= spawnInterval &&
        spawnList.length < config.maxMosquitoes
      ) {
        for (let i = 0; i < spawnBurst && spawnList.length < config.maxMosquitoes; i += 1) {
          const created = spawnMosquito(now);
          if (created) {
            spawnList.push(created);
          }
        }
        spawnAccumulatorRef.current -= spawnInterval;
      }

      for (const mosquito of spawnList) {
        const dx = centerX - mosquito.x;
        const dy = centerY - mosquito.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance <= centerRadius) {
          newDamage += 1;
          continue;
        }
        const stepSize = (mosquito.speed * delta) / 1000;
        next.push({
          ...mosquito,
          x: mosquito.x + (dx / distance) * stepSize,
          y: mosquito.y + (dy / distance) * stepSize
        });
      }

      if (newDamage > 0) {
        const nextDamage = Math.min(damageRef.current + newDamage, 5);
        damageRef.current = nextDamage;
        setDamage(nextDamage);
        mosquitoesRef.current = next;
        setMosquitoes(next);
        triggerHitFlash();
        triggerHitPing();
        playTone(180, 120);
        if (nextDamage >= 5) {
          didFail = true;
        }
      } else {
        mosquitoesRef.current = next;
        setMosquitoes(next);
      }

      if (didFail) {
        setIsRunning(false);
        setElapsedMs(0);
        setMosquitoes([]);
        mosquitoesRef.current = [];
        setResets(prev => prev + 1);
        setDamage(0);
        damageRef.current = 0;
        setFeedback("Le zanzare ti hanno raggiunta! Riparti da zero.");
        lastTickRef.current = null;
        spawnAccumulatorRef.current = 0;
        return;
      }

      if (nextElapsed >= durationMs) {
        setIsRunning(false);
        setFeedback("Hai protetto la ragazza per abbastanza tempo!");
        onComplete({
          stepId: step.id,
          status: "success",
          score: 100,
          meta: {
            elapsedMs: durationMs,
            squashed: squashedRef.current,
            resets: resetsRef.current,
            damage: damageRef.current,
            difficulty
          }
        });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    config.baseSpawnMs,
    config.maxMosquitoes,
    config.minSpawnMs,
    config.spawnRampMsPerSec,
    config.speedMax,
    config.speedMin,
    difficulty,
    durationMs,
    isCompleted,
    isRunning,
    onComplete,
    step.id
  ]);

  const handleStart = () => {
    if (isCompleted) {
      return;
    }
    getBounds();
    setFeedback(null);
    setIsRunning(true);
    if (mosquitoesRef.current.length === 0) {
      const now = performance.now();
      const first = spawnMosquito(now);
      const second = spawnMosquito(now);
      const seeded = [first, second].filter(Boolean) as Mosquito[];
      if (seeded.length > 0) {
        mosquitoesRef.current = seeded;
        setMosquitoes(seeded);
      }
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    resetGame();
  };

  const handleSquash = (id: string) => {
    const current = mosquitoesRef.current;
    const target = current.find(mosquito => mosquito.id === id);
    const next = current.filter(mosquito => mosquito.id !== id);
    mosquitoesRef.current = next;
    setMosquitoes(next);
    setSquashed(prev => prev + 1);
    if (target) {
      const splatId = `${id}-splat`;
      setSplats(prev => [...prev, { id: splatId, x: target.x, y: target.y }]);
      window.setTimeout(() => {
        setSplats(prev => prev.filter(splat => splat.id !== splatId));
      }, 300);
    }
    playTone(520, 80);
  };

  const progressPct = clamp((displayedElapsed / durationMs) * 100, 0, 100);

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
          Proteggi la ragazza per {(durationMs / 1000).toFixed(0)}s senza far arrivare le zanzare.
        </p>
      </div>

      <div
        ref={arenaRef}
        className="relative h-96 md:h-[540px] w-full rounded-3xl bg-rose-50 border border-rose-200 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-xs font-semibold shadow-sm transition ${
                hitFlash
                  ? "bg-rose-400 border-rose-500 text-white animate-pulse"
                  : "bg-rose-200 border-rose-300 text-rose-800"
              }`}
            >
              Ragazza
            </div>
          </div>
        </div>
        {hitPings.map(ping => (
          <div
            key={ping.id}
            className="absolute z-10 w-20 h-20 rounded-full border-2 border-rose-400/70 animate-ping pointer-events-none"
            style={{ left: ping.x, top: ping.y, transform: "translate(-50%, -50%)" }}
          />
        ))}
        {splats.map(splat => (
          <div
            key={splat.id}
            className="absolute z-10 w-8 h-8 rounded-full bg-rose-300/70 animate-ping pointer-events-none"
            style={{ left: splat.x, top: splat.y, transform: "translate(-50%, -50%)" }}
          />
        ))}
        {mosquitoes.map(mosquito => (
          <button
            key={mosquito.id}
            type="button"
            onPointerDown={() => handleSquash(mosquito.id)}
            aria-label="Mosquito"
            className="absolute z-10 w-9 h-9 text-stone-900"
            style={{ left: mosquito.x, top: mosquito.y, transform: "translate(-50%, -50%)" }}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-full h-full"
              aria-hidden="true"
            >
              <g fill="currentColor">
                <circle cx="32" cy="14" r="3" />
                <circle cx="32" cy="20" r="4" />
                <ellipse cx="32" cy="36" rx="4" ry="14" />
                <ellipse cx="16" cy="30" rx="14" ry="3" />
                <ellipse cx="48" cy="30" rx="14" ry="3" />
              </g>
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M32 10l0-6" />
                <path d="M28 12l-6-6" />
                <path d="M36 12l6-6" />
                <path d="M28 24l-12 8" />
                <path d="M26 28l-16 16" />
                <path d="M28 32l-10 20" />
                <path d="M36 24l12 8" />
                <path d="M38 28l16 16" />
                <path d="M36 32l10 20" />
              </g>
            </svg>
          </button>
        ))}
      </div>

      <div className="relative h-2 rounded-full bg-rose-100 border border-rose-200 overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-emerald-400" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="text-sm text-rose-700">
        Tempo: {(displayedElapsed / 1000).toFixed(1)}s / {(durationMs / 1000).toFixed(0)}s - Schiacciate:{" "}
        {squashed}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-rose-700">Danno:</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={`damage-${index}`}
              className={`h-3 w-3 rounded-full border ${
                index < damage ? "bg-rose-500 border-rose-600" : "bg-rose-100 border-rose-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onPointerDown={handleStart}
          disabled={isRunning || isCompleted}
          className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-rose-300 hover:bg-rose-700"
        >
          {isCompleted ? "Completato" : isRunning ? "In corso..." : "Start"}
        </button>
        <button
          type="button"
          onPointerDown={handleStop}
          disabled={!isRunning || isCompleted}
          className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm transition disabled:cursor-not-allowed disabled:text-rose-300 hover:bg-white/70"
        >
          Stop
        </button>
        <button
          type="button"
          onPointerDown={handleReset}
          disabled={isCompleted}
          className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm transition disabled:cursor-not-allowed disabled:text-rose-300 hover:bg-white/70"
        >
          Reset
        </button>
      </div>

      {feedback && <div className="text-sm text-rose-700">{feedback}</div>}
    </div>
  );
}
