import { vi } from "vitest";

/**
 * Síntese de fala simulada para os testes da voz do Sinapse: o jsdom não tem `speechSynthesis`.
 * Guarda o que foi falado e deixa o teste trocar as vozes e disparar `voiceschanged`.
 */
export type FalaSimulada = {
  falas: { texto: string; lang: string; voz: string | null }[];
  cancel: ReturnType<typeof vi.fn>;
  trocarVozes: (vozes: Partial<SpeechSynthesisVoice>[]) => void;
};

export function simularFala(vozesIniciais: Partial<SpeechSynthesisVoice>[]): FalaSimulada {
  let vozes = vozesIniciais;
  const ouvintes = new Set<() => void>();
  const falas: FalaSimulada["falas"] = [];
  const cancel = vi.fn();

  class Fala {
    voice: SpeechSynthesisVoice | null = null;
    lang = "";
    constructor(readonly text: string) {}
  }

  vi.stubGlobal("SpeechSynthesisUtterance", Fala);
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => vozes,
    speak: (fala: Fala) =>
      falas.push({ texto: fala.text, lang: fala.lang, voz: fala.voice?.name ?? null }),
    cancel,
    addEventListener: (_tipo: string, ouvinte: () => void) => ouvintes.add(ouvinte),
    removeEventListener: (_tipo: string, ouvinte: () => void) => ouvintes.delete(ouvinte),
  });

  return {
    falas,
    cancel,
    trocarVozes(novas) {
      vozes = novas;
      for (const ouvinte of ouvintes) {
        ouvinte();
      }
    },
  };
}

export const vozPtBrLocal = { name: "Luciana", lang: "pt-BR", localService: true };
export const vozPtBrRemota = {
  name: "Google português do Brasil",
  lang: "pt-BR",
  localService: false,
};
export const vozPtPtLocal = { name: "Joana", lang: "pt-PT", localService: true };
export const vozInglesa = { name: "Samantha", lang: "en-US", localService: true };
