import type { Book } from "./types";

const demoBook: Book = {
  id: "demo",
  title: "Demo: Il Nostro Viaggio",
  pages: [
    {
      id: "page-1",
      title: "Benvenuti",
      steps: [
        {
          id: "p1-step-1",
          type: "text",
          text: "Benvenuti nel vostro libro interattivo. Ogni pagina contiene piccoli momenti da vivere insieme."
        },
        {
          id: "p1-step-2",
          type: "text",
          text: "Leggete con calma e completate ogni passaggio per sbloccare la pagina successiva."
        }
      ]
    },
    {
      id: "page-2",
      title: "Sfida del Tempo",
      steps: [
        {
          id: "p2-step-1",
          type: "tap_timing",
          prompt: "Tocca quando il cursore entra nella zona evidenziata.",
          durationMs: 2400,
          targetStartPct: 42,
          targetEndPct: 58,
          attemptsAllowed: 3
        }
      ]
    },
    {
      id: "page-3",
      title: "Versa senza farti vedere",
      steps: [
        {
          id: "p3-step-1-stealth",
          type: "stealth_pour",
          prompt: "Tieni premuto per versare, ma solo quando e sicuro.",
          totalHoldMs: 15000,
          safeMinMs: 1500,
          safeMaxMs: 3200,
          unsafeMinMs: 1200,
          unsafeMaxMs: 2800
        }
      ]
    },
    {
      id: "page-4",
      title: "Difendi la ragazza",
      steps: [
        {
          id: "p4-step-1-mosquito",
          type: "mosquito_defense",
          prompt: "Schiaccia le zanzare prima che raggiungano il centro.",
          durationMs: 30000
        }
      ]
    },
    {
      id: "page-5",
      title: "Conclusione",
      steps: [
        {
          id: "p5-step-1",
          type: "text",
          text: "Avete completato la demo! Questo e solo l'inizio della vostra storia."
        }
      ]
    }
  ]
};

export const getMockBook = (bookId: string): Book | null => {
  if (bookId === demoBook.id) {
    return demoBook;
  }

  return null;
};
