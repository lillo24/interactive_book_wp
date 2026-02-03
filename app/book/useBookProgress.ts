"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Book, StepResult } from "./types";

type StoredProgress = {
  currentPageIndex: number;
  stepResults: Record<string, StepResult>;
};

const STORAGE_PREFIX = "interactive_book_progress";

const getStorageKey = (bookId: string) => `${STORAGE_PREFIX}:${bookId}`;

const getStepIdSet = (book: Book) => {
  const ids = new Set<string>();
  for (const page of book.pages) {
    for (const step of page.steps) {
      ids.add(step.id);
    }
  }
  return ids;
};

export const useBookProgress = (bookId: string, book: Book | null) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, StepResult>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const stepIdSet = useMemo(() => (book ? getStepIdSet(book) : new Set<string>()), [book]);

  useEffect(() => {
    if (!book) {
      return;
    }

    const key = getStorageKey(bookId);
    const raw = localStorage.getItem(key);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredProgress;
        const safeResults: Record<string, StepResult> = {};

        for (const [stepId, result] of Object.entries(parsed.stepResults ?? {})) {
          if (stepIdSet.has(stepId)) {
            safeResults[stepId] = result;
          }
        }

        const clampedIndex = Math.min(
          Math.max(parsed.currentPageIndex ?? 0, 0),
          Math.max(book.pages.length - 1, 0)
        );

        setStepResults(safeResults);
        setCurrentPageIndex(clampedIndex);
      } catch {
        setStepResults({});
        setCurrentPageIndex(0);
      }
    }

    setIsLoaded(true);
  }, [book, bookId, stepIdSet]);

  useEffect(() => {
    if (!book || !isLoaded) {
      return;
    }

    const key = getStorageKey(bookId);
    const payload: StoredProgress = {
      currentPageIndex,
      stepResults
    };

    localStorage.setItem(key, JSON.stringify(payload));
  }, [book, bookId, currentPageIndex, stepResults, isLoaded]);

  const setStepResult = useCallback((result: StepResult) => {
    setStepResults(prev => ({
      ...prev,
      [result.stepId]: result
    }));
  }, []);

  const clearStepResults = useCallback((stepIds: string[]) => {
    setStepResults(prev => {
      const next = { ...prev };
      for (const stepId of stepIds) {
        delete next[stepId];
      }
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setStepResults({});
    setCurrentPageIndex(0);
    localStorage.removeItem(getStorageKey(bookId));
  }, [bookId]);

  return {
    currentPageIndex,
    setCurrentPageIndex,
    stepResults,
    setStepResult,
    clearStepResults,
    resetProgress,
    isLoaded
  };
};
