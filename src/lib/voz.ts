/**
 * Voz do Sinapse (spec 0001, CA-18 e CA-19; ADR-0009): só leitura em voz alta, com a síntese de
 * fala do próprio navegador. Lê só respostas gravadas, que são texto público; nunca usa microfone.
 * Entre as vozes em português, prefere pt-BR e, dentro dela, a que roda no aparelho.
 */

function sintetizador(): SpeechSynthesis | null {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof window.SpeechSynthesisUtterance !== "function"
  ) {
    return null;
  }
  return window.speechSynthesis;
}

function nota(voz: SpeechSynthesisVoice): number {
  return (/^pt[-_]br$/i.test(voz.lang) ? 2 : 0) + (voz.localService ? 1 : 0);
}

/** A melhor voz em português, ou nada: pt-BR antes de outro pt, local antes de remota. */
export function escolherVoz(vozes: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  let melhor: SpeechSynthesisVoice | null = null;
  for (const voz of vozes) {
    if (/^pt([-_]|$)/i.test(voz.lang) && (melhor === null || nota(voz) > nota(melhor))) {
      melhor = voz;
    }
  }
  return melhor;
}

/** Há síntese de fala e alguma voz em português? Sem isso, o controle de voz some (CA-19). */
export function podeFalar(): boolean {
  const sintese = sintetizador();
  return sintese !== null && escolherVoz(sintese.getVoices()) !== null;
}

/** As vozes chegam depois da carga, pelo evento `voiceschanged`; avisa a cada mudança. */
export function observarVozes(aoMudar: () => void): () => void {
  const sintese = sintetizador();
  if (!sintese) {
    return () => {};
  }
  sintese.addEventListener("voiceschanged", aoMudar);
  return () => sintese.removeEventListener("voiceschanged", aoMudar);
}

/**
 * Frases, para falar uma de cada vez: o Chrome corta falas longas com vozes remotas, e frases
 * curtas também param mais rápido quando a voz é desligada.
 */
export function frases(texto: string): string[] {
  return texto
    .split(/(?<=[.!?])\s+/)
    .map((frase) => frase.trim())
    .filter((frase) => frase.length > 0);
}

/** Lê o texto do começo, interrompendo o que estava sendo lido. */
export function falar(texto: string): void {
  const sintese = sintetizador();
  const voz = sintese ? escolherVoz(sintese.getVoices()) : null;
  if (!sintese || !voz) {
    return;
  }
  sintese.cancel();
  for (const frase of frases(texto)) {
    const fala = new window.SpeechSynthesisUtterance(frase);
    fala.voice = voz;
    fala.lang = voz.lang;
    sintese.speak(fala);
  }
}

export function parar(): void {
  sintetizador()?.cancel();
}
