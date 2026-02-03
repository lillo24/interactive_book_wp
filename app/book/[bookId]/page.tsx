"use client";

import { use } from "react";
import Link from "next/link";
import Menu from "../../components/Menu";
import StepRenderer from "../StepRenderer";
import { getMockBook } from "../mockBook";
import { useBookProgress } from "../useBookProgress";

export default function BookPlayerPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const book = getMockBook(bookId);

  const {
    currentPageIndex,
    setCurrentPageIndex,
    stepResults,
    setStepResult,
    clearStepResults,
    resetProgress,
    isLoaded
  } = useBookProgress(bookId, book);

  if (!book) {
    return (
      <div className="min-h-screen bg-rose-50 text-rose-900">
        <Menu />
        <main className="container mx-auto px-4 py-24">
          <div className="bg-white/90 border border-rose-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Libro non trovato</h1>
            <p className="text-rose-700 mb-6">
              Non esiste un libro con id "{bookId}".
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
            >
              Torna alla home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentPage = book.pages[currentPageIndex];
  const totalPages = book.pages.length;
  const isPageComplete = currentPage.steps.every(
    step => stepResults[step.id]?.status === "success"
  );

  const canGoPrev = currentPageIndex > 0;
  const canGoNext = currentPageIndex < totalPages - 1 && isPageComplete;
  const canSkip = currentPageIndex < totalPages - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 text-rose-900">
      <Menu />

      <main className="container mx-auto px-4 py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif">{book.title}</h1>
            <p className="text-rose-700 text-sm mt-1">
              Pagina {currentPageIndex + 1} di {totalPages}
            </p>
          </div>
          <button
            type="button"
            onClick={resetProgress}
            className="self-start md:self-auto px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm hover:bg-white/70"
          >
            Reset progress
          </button>
        </div>

        <section className="bg-white/90 rounded-3xl border border-rose-200 p-6 md:p-10 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold">{currentPage.title}</h2>
            <span className="text-sm text-rose-600">
              {isPageComplete ? "Pagina completata" : "Puoi saltare questa pagina"}
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {currentPage.steps.map(step => (
              <StepRenderer
                key={step.id}
                step={step}
                onComplete={setStepResult}
                onResetStep={stepId => clearStepResults([stepId])}
                existingResult={stepResults[step.id]}
              />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentPageIndex(index => Math.max(index - 1, 0))}
            disabled={!canGoPrev || !isLoaded}
            className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm disabled:cursor-not-allowed disabled:text-rose-300"
          >
            Pagina precedente
          </button>
          <div className="text-sm text-rose-600">
            {isPageComplete
              ? "Pagina completata: puoi continuare."
              : "Puoi continuare anche senza completare gli step."}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => clearStepResults(currentPage.steps.map(step => step.id))}
              disabled={!isLoaded}
              className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm disabled:cursor-not-allowed disabled:text-rose-300 hover:bg-white/70"
            >
              Riprova pagina
            </button>
            <button
              type="button"
              onClick={() => setCurrentPageIndex(index => Math.min(index + 1, totalPages - 1))}
              disabled={!isLoaded || !canSkip}
              className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 text-sm disabled:cursor-not-allowed disabled:text-rose-300 hover:bg-white/70"
            >
              Salta pagina
            </button>
            <button
              type="button"
              onClick={() => setCurrentPageIndex(index => Math.min(index + 1, totalPages - 1))}
              disabled={!canGoNext || !isLoaded}
              className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-rose-300 hover:bg-rose-700"
            >
              Pagina successiva
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
