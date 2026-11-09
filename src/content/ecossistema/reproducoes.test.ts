import { describe, it } from "vitest";

// Esqueleto da spec 0001 (docs/specs/0001-ecossistema-em-3d): os testes ganham corpo na tarefa T02,
// depois do OK da spec.
describe("reproduções do ecossistema", () => {
  // spec 0001 CA-03
  it.todo("traz a data e o commit da gravação do CI e marca o fluxo dos agentes como roteiro");

  // spec 0001 CA-06
  it.todo("mantém a ordem e a proporção de tempo dos spans gravados, esticadas para 12 a 20 s");

  // spec 0001 CA-06
  it.todo("deixa de fora os spans de banco, como o Painel");

  // spec 0001 CA-06
  it.todo(
    "liga cada evento ao serviço de origem e ao de destino, passando pelo RabbitMQ no consumo",
  );

  // spec 0001 CA-06
  it.todo("cabe em 40 KB serializado, sem levar a gravação inteira ao navegador");
});
