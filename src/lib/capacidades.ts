/**
 * Decide como a página /ecossistema mostra o mapa (spec 0001, CA-04, CA-08 e CA-09): cena 3D quando
 * o navegador tem WebGL e o sistema não pede menos movimento, mapa 2D nos outros casos, e texto
 * estático enquanto o JavaScript não roda.
 */

export type Modo = "3d" | "2d" | "estatico";

export function decidirModo({
  webgl,
  menosMovimento,
}: {
  webgl: boolean;
  menosMovimento: boolean;
}): Exclude<Modo, "estatico"> {
  return webgl && !menosMovimento ? "3d" : "2d";
}

/** Cria um contexto WebGL e o libera em seguida; qualquer erro conta como falta de WebGL. */
export function temWebGL(documento: Document = document): boolean {
  try {
    const canvas = documento.createElement("canvas");
    const contexto = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!contexto) {
      return false;
    }
    contexto.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

let webglEmCache: boolean | undefined;

/** `temWebGL` uma vez por carga de página: criar contexto à toa gasta memória de GPU. */
export function webglDisponivel(): boolean {
  webglEmCache ??= temWebGL();
  return webglEmCache;
}

const consultaMenosMovimento = "(prefers-reduced-motion: reduce)";

export function pedeMenosMovimento(janela: Window = window): boolean {
  return janela.matchMedia?.(consultaMenosMovimento).matches ?? false;
}

/** Avisa quando o visitante muda a preferência de movimento com a página aberta. */
export function observarMenosMovimento(aoMudar: () => void, janela: Window = window): () => void {
  const consulta = janela.matchMedia?.(consultaMenosMovimento);
  if (!consulta) {
    return () => {};
  }
  consulta.addEventListener("change", aoMudar);
  return () => consulta.removeEventListener("change", aoMudar);
}
