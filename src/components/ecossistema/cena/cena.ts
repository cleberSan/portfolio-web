import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  regiaoIds,
  type EventoReproducao,
  type NoId,
  type RegiaoId,
} from "@/content/ecossistema/modelo";
import { regiaoDoNo } from "../layout";
import { ancoras, gerarCerebro, pontosNoCelular, pontosNoComputador, semRegiao } from "./cerebro";
import { criarCiclo } from "./ciclo";
import {
  ligacoesDaReproducao,
  maximoDeLigacoes,
  maximoDePulsos,
  nosAcesos,
  pontoNoArco,
  posicaoDoPulso,
  pulsosAtivos,
} from "./sinais";
import type { CriarCena } from "./tipos";

/**
 * Cena 3D de /ecossistema (spec 0001, CA-04 a CA-10, ADR-0009). Único módulo que importa o three
 * (regra do ESLint) e só é baixado por import dinâmico da experiência. Desenha o cérebro como
 * nuvem de pontos com brilho aditivo, os nós e os pulsos da reprodução; gira devagar, para na
 * pausa e quando sai da tela ou da aba, e avisa a experiência se o WebGL cair.
 *
 * Coberta pelos testes E2E (precisa de WebGL); a geometria, os sinais e o laço de quadros são
 * puros e têm teste de unidade.
 */

/** Giro automático, em radianos por segundo: uma volta a cada 50 s. */
const velocidadeDeGiro = 0.125;
/** Pontos de rastro atrás de cada pulso. */
const rastro = 5;
const passoDoRastro = 0.035;
/** Arrasto horizontal, em radianos por pixel. */
const giroPorPixel = 0.01;
/** Movimento mínimo, em pixels, para o toque contar como arrasto e não como escolha. */
const toleranciaDoToque = 5;
/** Segmentos de cada arco das ligações. */
const segmentosDoArco = 16;

function corDoCss(elemento: HTMLElement, variavel: string, reserva: string): Color {
  const valor = getComputedStyle(elemento).getPropertyValue(variavel).trim();
  return new Color(valor || reserva);
}

/** Disco com borda suave, para os pontos não serem quadrados. */
function texturaDoPonto(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const contexto = canvas.getContext("2d");
  if (contexto) {
    const gradiente = contexto.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradiente.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradiente.addColorStop(0.35, "rgba(255, 255, 255, 0.6)");
    gradiente.addColorStop(1, "rgba(255, 255, 255, 0)");
    contexto.fillStyle = gradiente;
    contexto.fillRect(0, 0, 64, 64);
  }
  return new CanvasTexture(canvas);
}

function materialDePontos(tamanho: number, textura: CanvasTexture): PointsMaterial {
  return new PointsMaterial({
    size: tamanho,
    map: textura,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
}

export const criarCena: CriarCena = (container, opcoes) => {
  const celular =
    container.clientWidth < 640 || Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  const cerebro = gerarCerebro({ pontos: celular ? pontosNoCelular : pontosNoComputador });
  const posicoesDosNos = ancoras();
  const idsDosNos = Object.keys(posicoesDosNos) as NoId[];

  // Lança erro sem WebGL: a experiência pega e cai no mapa 2D.
  const renderer = new WebGLRenderer({ antialias: !celular, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(corDoCss(container, "--monitor-bg", "#050b14"), 1);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.cursor = "grab";
  // Arrasto horizontal gira o cérebro; o vertical continua rolando a página no celular.
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const cena = new Scene();
  const camera = new PerspectiveCamera(38, 4 / 3, 0.1, 50);
  // Vista de cima e de frente: os dois hemisférios e a fissura, como no mapa 2D.
  camera.position.set(0, 3.7, 2.8);
  camera.lookAt(0, 0.1, 0);
  const grupo = new Group();
  cena.add(grupo);

  const textura = texturaDoPonto();
  const coresDasRegioes = regiaoIds.map((id) => corDoCss(container, `--regiao-${id}`, "#ffffff"));
  const neutra = corDoCss(container, "--monitor-muted", "#9fb0c5");
  const clara = corDoCss(container, "--monitor-fg", "#dbe6f3");
  const corDoNo = (id: NoId): Color => {
    const regiao = regiaoDoNo(id);
    return regiao ? coresDasRegioes[regiaoIds.indexOf(regiao)] : clara;
  };

  // Cérebro.
  const geometria = new BufferGeometry();
  geometria.setAttribute("position", new BufferAttribute(cerebro.posicoes, 3));
  const cores = new Float32Array(cerebro.total * 3);
  const atributoDeCor = new BufferAttribute(cores, 3);
  geometria.setAttribute("color", atributoDeCor);
  const material = materialDePontos(celular ? 0.085 : 0.07, textura);
  const pontos = new Points(geometria, material);
  grupo.add(pontos);

  let destaque: RegiaoId | null = null;
  const pintarCerebro = () => {
    const ativa = destaque ? regiaoIds.indexOf(destaque) : -1;
    for (let i = 0; i < cerebro.total; i += 1) {
      const regiao = cerebro.regioes[i];
      const base = regiao === semRegiao ? neutra : coresDasRegioes[regiao];
      let fator = cerebro.brilho[i] * (regiao === semRegiao ? 0.3 : 0.75);
      if (ativa >= 0) {
        fator *= regiao === ativa ? 1.35 : 0.3;
      }
      cores[i * 3] = base.r * fator;
      cores[i * 3 + 1] = base.g * fator;
      cores[i * 3 + 2] = base.b * fator;
    }
    atributoDeCor.needsUpdate = true;
  };

  // Nós.
  const geometriaDosNos = new BufferGeometry();
  geometriaDosNos.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(idsDosNos.flatMap((id) => [...posicoesDosNos[id]])), 3),
  );
  const coresDosNos = new Float32Array(idsDosNos.length * 3);
  const atributoDosNos = new BufferAttribute(coresDosNos, 3);
  geometriaDosNos.setAttribute("color", atributoDosNos);
  const materialDosNos = materialDePontos(0.24, textura);
  grupo.add(new Points(geometriaDosNos, materialDosNos));

  let chaveDosAcesos: string | null = null;
  const pintarNos = (acesos: ReadonlySet<NoId>) => {
    const chave = [...acesos].sort().join(",");
    if (chave === chaveDosAcesos) {
      return;
    }
    chaveDosAcesos = chave;
    idsDosNos.forEach((id, i) => {
      const cor = corDoNo(id);
      const fator = acesos.has(id) ? 1 : id === "cleber" ? 0.7 : 0.45;
      coresDosNos.set([cor.r * fator, cor.g * fator, cor.b * fator], i * 3);
    });
    atributoDosNos.needsUpdate = true;
  };

  // Pulsos com rastro.
  const capacidade = maximoDePulsos * rastro;
  const posicoesDosPulsos = new Float32Array(capacidade * 3);
  const coresDosPulsos = new Float32Array(capacidade * 3);
  const geometriaDosPulsos = new BufferGeometry();
  const atributoPosicaoDosPulsos = new BufferAttribute(posicoesDosPulsos, 3);
  const atributoCorDosPulsos = new BufferAttribute(coresDosPulsos, 3);
  geometriaDosPulsos.setAttribute("position", atributoPosicaoDosPulsos);
  geometriaDosPulsos.setAttribute("color", atributoCorDosPulsos);
  geometriaDosPulsos.setDrawRange(0, 0);
  const materialDosPulsos = materialDePontos(0.18, textura);
  const pulsos = new Points(geometriaDosPulsos, materialDosPulsos);
  pulsos.frustumCulled = false;
  grupo.add(pulsos);

  // Ligações: o caminho da reprodução, em arcos finos e fixos.
  const verticesDasLigacoes = maximoDeLigacoes * segmentosDoArco * 2;
  const posicoesDasLigacoes = new Float32Array(verticesDasLigacoes * 3);
  const coresDasLigacoes = new Float32Array(verticesDasLigacoes * 3);
  const geometriaDasLigacoes = new BufferGeometry();
  const atributoPosicaoDasLigacoes = new BufferAttribute(posicoesDasLigacoes, 3);
  const atributoCorDasLigacoes = new BufferAttribute(coresDasLigacoes, 3);
  geometriaDasLigacoes.setAttribute("position", atributoPosicaoDasLigacoes);
  geometriaDasLigacoes.setAttribute("color", atributoCorDasLigacoes);
  geometriaDasLigacoes.setDrawRange(0, 0);
  const materialDasLigacoes = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const ligacoes = new LineSegments(geometriaDasLigacoes, materialDasLigacoes);
  ligacoes.frustumCulled = false;
  grupo.add(ligacoes);

  const desenharLigacoes = (novos: readonly EventoReproducao[]) => {
    let vertice = 0;
    for (const [de, para] of ligacoesDaReproducao(novos)) {
      const cor = corDoNo(para);
      for (let k = 0; k < segmentosDoArco; k += 1) {
        for (const t of [k / segmentosDoArco, (k + 1) / segmentosDoArco]) {
          posicoesDasLigacoes.set(
            pontoNoArco(posicoesDosNos[de], posicoesDosNos[para], t),
            vertice * 3,
          );
          coresDasLigacoes.set([cor.r * 0.22, cor.g * 0.22, cor.b * 0.22], vertice * 3);
          vertice += 1;
        }
      }
    }
    geometriaDasLigacoes.setDrawRange(0, vertice);
    atributoPosicaoDasLigacoes.needsUpdate = true;
    atributoCorDasLigacoes.needsUpdate = true;
  };

  let eventos: readonly EventoReproducao[] = [];
  const atualizarPulsos = () => {
    const ativos = pulsosAtivos(eventos, opcoes.tempo());
    let desenhados = 0;
    for (const { indice, progresso } of ativos) {
      const evento = eventos[indice];
      const cor = corDoNo(evento.destino);
      const parado = evento.origem === evento.destino;
      for (let k = 0; k < rastro; k += 1) {
        const t = progresso - k * passoDoRastro;
        if (t < 0 || (parado && k > 0)) {
          break;
        }
        posicoesDosPulsos.set(posicaoDoPulso(evento, t, posicoesDosNos), desenhados * 3);
        const fator = (1 - k / rastro) * (parado ? 1 - progresso : 1);
        coresDosPulsos.set([cor.r * fator, cor.g * fator, cor.b * fator], desenhados * 3);
        desenhados += 1;
      }
    }
    geometriaDosPulsos.setDrawRange(0, desenhados);
    atributoPosicaoDosPulsos.needsUpdate = true;
    atributoCorDosPulsos.needsUpdate = true;
    pintarNos(nosAcesos(eventos, ativos));
  };

  let arrastando = false;
  const ciclo = criarCiclo(
    (deltaMs, animando) => {
      if (animando && !arrastando) {
        grupo.rotation.y += (deltaMs / 1000) * velocidadeDeGiro;
      }
      atualizarPulsos();
      renderer.render(cena, camera);
    },
    {
      agendar: (quadro) => requestAnimationFrame(quadro),
      cancelar: (id) => cancelAnimationFrame(id),
    },
    { pausado: false, oculta: document.hidden, naTela: true },
  );

  const ajustar = () => {
    const largura = container.clientWidth;
    const altura = container.clientHeight;
    if (largura === 0 || altura === 0) {
      return;
    }
    renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
    ciclo.redesenhar();
  };
  const observadorDeTamanho = new ResizeObserver(ajustar);
  observadorDeTamanho.observe(container);
  ajustar();

  // Suspensão (CA-10): aba oculta ou cena fora da tela param o laço.
  const aoMudarVisibilidade = () => ciclo.definir({ oculta: document.hidden });
  document.addEventListener("visibilitychange", aoMudarVisibilidade);
  const observadorDeTela = new IntersectionObserver((entradas) => {
    const entrada = entradas.at(-1);
    if (entrada) {
      ciclo.definir({ naTela: entrada.isIntersecting });
    }
  });
  observadorDeTela.observe(container);

  // Escolha por clique ou toque (CA-05) e giro por arrasto.
  const raycaster = new Raycaster();
  raycaster.params.Points = { threshold: 0.06 };
  const ponteiro = new Vector2();
  let inicioX = 0;
  let rotacaoNoInicio = 0;
  let moveu = false;

  const selecionar = (evento: PointerEvent) => {
    const caixa = canvas.getBoundingClientRect();
    ponteiro.set(
      ((evento.clientX - caixa.left) / caixa.width) * 2 - 1,
      -((evento.clientY - caixa.top) / caixa.height) * 2 + 1,
    );
    raycaster.setFromCamera(ponteiro, camera);
    // O ponto mais próximo que pertence a uma região; os neutros não escolhem nada.
    for (const { index } of raycaster.intersectObject(pontos)) {
      const regiao = index === undefined ? semRegiao : cerebro.regioes[index];
      if (regiao !== semRegiao) {
        opcoes.aoSelecionar(regiaoIds[regiao]);
        return;
      }
    }
  };
  const aoPressionar = (evento: PointerEvent) => {
    arrastando = true;
    moveu = false;
    inicioX = evento.clientX;
    rotacaoNoInicio = grupo.rotation.y;
    // O arrasto continua mesmo se o ponteiro sair do canvas antes de soltar.
    canvas.setPointerCapture?.(evento.pointerId);
  };
  const aoMover = (evento: PointerEvent) => {
    if (!arrastando) {
      return;
    }
    const deslocamento = evento.clientX - inicioX;
    if (Math.abs(deslocamento) > toleranciaDoToque) {
      moveu = true;
      canvas.style.cursor = "grabbing";
    }
    grupo.rotation.y = rotacaoNoInicio + deslocamento * giroPorPixel;
    ciclo.redesenhar();
  };
  const aoSoltar = (evento: PointerEvent) => {
    if (!arrastando) {
      return;
    }
    arrastando = false;
    canvas.style.cursor = "grab";
    if (!moveu) {
      selecionar(evento);
    }
  };
  const aoCancelar = () => {
    arrastando = false;
    canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointerdown", aoPressionar);
  canvas.addEventListener("pointermove", aoMover);
  canvas.addEventListener("pointerup", aoSoltar);
  canvas.addEventListener("pointercancel", aoCancelar);

  // Contexto perdido (CA-09): a experiência troca para o mapa 2D e descarta a cena.
  let contextoPerdido = false;
  const aoPerderContexto = (evento: Event) => {
    evento.preventDefault();
    contextoPerdido = true;
    ciclo.parar();
    opcoes.aoPerderContexto();
  };
  canvas.addEventListener("webglcontextlost", aoPerderContexto);

  pintarCerebro();
  pintarNos(new Set());

  return {
    destacar(regiao) {
      destaque = regiao;
      pintarCerebro();
      ciclo.redesenhar();
    },
    reproduzir(novos) {
      eventos = novos;
      desenharLigacoes(novos);
      ciclo.redesenhar();
    },
    pausar(pausado) {
      ciclo.definir({ pausado });
      ciclo.redesenhar();
    },
    descartar() {
      ciclo.parar();
      observadorDeTamanho.disconnect();
      observadorDeTela.disconnect();
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      canvas.removeEventListener("webglcontextlost", aoPerderContexto);
      canvas.removeEventListener("pointerdown", aoPressionar);
      canvas.removeEventListener("pointermove", aoMover);
      canvas.removeEventListener("pointerup", aoSoltar);
      canvas.removeEventListener("pointercancel", aoCancelar);
      for (const recurso of [
        geometria,
        geometriaDosNos,
        geometriaDosPulsos,
        geometriaDasLigacoes,
        material,
        materialDosNos,
        materialDosPulsos,
        materialDasLigacoes,
        textura,
      ]) {
        recurso.dispose();
      }
      renderer.dispose();
      // Libera o contexto já, sem esperar o coletor de lixo; perdido, não há o que liberar.
      if (!contextoPerdido) {
        renderer.forceContextLoss();
      }
      canvas.remove();
    },
  };
};
