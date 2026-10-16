import { describe, expect, it } from "vitest";
import {
  buildWaterfall,
  circuitLabel,
  commitUrl,
  formatMs,
  formatRecordedAt,
  groupAudit,
  guardrailLabel,
  modelStatusLabel,
  priorityLabel,
  reviewLabel,
  sourceLabel,
  triageScenarioLabel,
  propagationMs,
  recording,
  serviceName,
  stepLabel,
  whatsapp,
  type AuditEntry,
  type Propagation,
  type Span,
  type Trace,
  type Triage,
} from "./painel";

function span(overrides: Partial<Span> & Pick<Span, "spanId">): Span {
  return {
    parentSpanId: null,
    service: "careflow-scheduling",
    name: "op",
    kind: "internal",
    startedAt: "2026-10-15T12:00:00.000Z",
    durationMs: 10,
    status: "unset",
    attributes: {},
    events: [],
    ...overrides,
  };
}

function audit(sequence: number, action: string, at: string, source = "scheduling"): AuditEntry {
  return { sequence, occurredAt: at, sourceService: source, action, resourceType: "patient" };
}

const chain = { intact: true, entriesVerified: 1, lastSequence: 1 };

describe("buildWaterfall", () => {
  it("ordena por início, esconde spans de banco e mantém a profundidade pelos ancestrais visíveis", () => {
    // Arrange
    const trace: Trace = {
      traceId: "t",
      spans: [
        span({ spanId: "c", parentSpanId: "db", startedAt: "2026-10-15T12:00:00.030Z" }),
        span({ spanId: "root", service: "careflow-demo", durationMs: 50 }),
        span({
          spanId: "db",
          parentSpanId: "root",
          startedAt: "2026-10-15T12:00:00.010Z",
          attributes: { "db.system.name": "postgresql" },
          durationMs: 40,
        }),
      ],
    };

    // Act
    const waterfall = buildWaterfall(trace);

    // Assert
    expect(waterfall.rows.map((row) => [row.spanId, row.depth, row.offsetMs])).toEqual([
      ["root", 0, 0],
      ["c", 1, 30],
    ]);
    expect(waterfall.hiddenDatabaseSpans).toBe(1);
    expect(waterfall.totalMs).toBe(50);
    expect(waterfall.services).toEqual(["careflow-demo", "careflow-scheduling"]);
  });

  it("não entra em laço com pais cíclicos nem quebra com pai ausente", () => {
    // Arrange
    const trace: Trace = {
      traceId: "t",
      spans: [
        span({ spanId: "a", parentSpanId: "b" }),
        span({ spanId: "b", parentSpanId: "a" }),
        span({ spanId: "orphan", parentSpanId: "missing" }),
      ],
    };

    // Act
    const rows = buildWaterfall(trace).rows;

    // Assert
    expect(rows).toHaveLength(3);
    expect(rows.find((row) => row.spanId === "orphan")?.depth).toBe(0);
  });

  it("trace vazio tem duração zero", () => {
    expect(buildWaterfall({ traceId: "t", spans: [] }).totalMs).toBe(0);
  });
});

describe("groupAudit", () => {
  it("agrupa por ação na ordem da cadeia, com os serviços de origem", () => {
    // Arrange
    const entries = [
      audit(3, "appointment.read", "2026-10-15T12:00:03Z", "scheduling"),
      audit(1, "consent.revoked", "2026-10-15T12:00:01Z", "consent"),
      audit(2, "appointment.read", "2026-10-15T12:00:02Z", "notifications"),
    ];

    // Act
    const groups = groupAudit(entries);

    // Assert
    expect(groups).toEqual([
      { action: "consent.revoked", count: 1, services: ["consent"] },
      { action: "appointment.read", count: 2, services: ["notifications", "scheduling"] },
    ]);
  });
});

describe("propagationMs", () => {
  const base: Propagation = { appointments: [], notifications: [], audit: [], chain };

  it("mede da revogação ao último cancelamento por revogação", () => {
    const propagation = {
      ...base,
      audit: [
        audit(1, "consent.revoked", "2026-10-15T12:00:00.000Z", "consent"),
        audit(2, "appointment.cancelled.consent-revoked", "2026-10-15T12:00:00.120Z"),
        audit(3, "appointment.cancelled.consent-revoked", "2026-10-15T12:00:00.250Z"),
      ],
    };

    expect(propagationMs(propagation)).toBe(250);
  });

  it("sem revogação ou sem cancelamento não mede", () => {
    expect(propagationMs(base)).toBeUndefined();
    expect(
      propagationMs({ ...base, audit: [audit(1, "consent.revoked", "2026-10-15T12:00:00Z")] }),
    ).toBeUndefined();
  });
});

describe("rótulos e formatos", () => {
  it("traduz serviços, circuitos e passos, e devolve o valor original quando não conhece", () => {
    expect(serviceName("careflow-patient-vault")).toBe("Cofre do paciente");
    expect(serviceName("outro")).toBe("outro");
    expect(circuitLabel("Open")).toBe("Aberto");
    expect(circuitLabel("Strange")).toBe("Strange");
    expect(stepLabel("whatsapp-fora")).toMatch(/WhatsApp derrubado/);
    expect(stepLabel("x")).toBe("x");
  });

  it("formata milissegundos e a data da gravação em UTC", () => {
    expect(formatMs(1234.56)).toBe("1.234,6 ms");
    expect(formatRecordedAt("2026-10-15T18:32:44Z")).toBe("15 de outubro de 2026 às 18:32 (UTC)");
  });

  it("só gera link para um SHA completo", () => {
    expect(commitUrl("a".repeat(40))).toBe(
      `https://github.com/cleberSan/careflow/commit/${"a".repeat(40)}`,
    );
    expect(commitUrl("local")).toBeUndefined();
    expect(commitUrl("javascript:alert(1)")).toBeUndefined();
  });
});

describe("gravação publicada", () => {
  const json = JSON.stringify(recording);

  it("tem data, commit e os cinco cenários", () => {
    expect(recording.schema).toBe(2);
    expect(recording.triage.steps.length).toBeGreaterThan(0);
    expect(commitUrl(recording.commit)).toBeDefined();
    expect(recording.booking.trace.spans.length).toBeGreaterThan(0);
    expect(recording.resilience.steps.length).toBeGreaterThan(0);
    expect(recording.revocation.after.chain.intact).toBe(true);
  });

  it("mostra a queda do WhatsApp com fallback para SMS e o circuito abrindo e fechando", () => {
    const steps = recording.resilience.steps;
    const sentVia = steps.flatMap((step) =>
      step.notification?.sentVia ? [step.notification.sentVia] : [],
    );
    expect(sentVia[0]).toBe("Sms");
    expect(sentVia.at(-1)).toBe("WhatsApp");
    expect(steps.some((step) => whatsapp(step)?.circuit === "Open")).toBe(true);
    expect(whatsapp(steps.at(-1)!)?.circuit).toBe("Closed");
  });

  it("não publica CPF nem telefone completos, e o nome só aparece no cofre", () => {
    const vault = recording.patient.vault;
    expect(vault.cpf).toMatch(/^•••\.•••\.•••-\d{2}$/);
    expect(vault.phone).toMatch(/^\+55 •• •••••-••\d{2}$/);
    expect(vault.email).toMatch(/@example\.com$/);
    expect(json).not.toMatch(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
    // Fora do cofre, o nome só aparece no que o paciente escreveu na queixa da triagem.
    const withoutComplaints = JSON.stringify({
      ...recording,
      triage: {
        ...recording.triage,
        steps: recording.triage.steps.map((step) => ({
          ...step,
          complaint: "",
          submitted: { ...step.submitted, complaint: "" },
          reviewed: { ...step.reviewed, complaint: "" },
        })),
      },
    });
    expect(withoutComplaints.split(vault.fullName)).toHaveLength(2);
    expect(withoutComplaints.split(vault.email!)).toHaveLength(2);
  });

  it("na triagem, nada do paciente sai para o modelo e toda sugestão tem decisão humana", () => {
    const { steps, audit, chain } = recording.triage;
    const vault = recording.patient.vault;
    for (const step of steps) {
      expect(step.submitted.sentToModel ?? "").not.toContain(vault.fullName.split(" ").at(-1));
      expect(step.submitted.sentToModel ?? "").not.toContain(vault.email!);
      expect(["confirmed", "corrected"]).toContain(step.reviewed.decision);
    }
    expect(steps.map((step) => step.scenario)).toEqual([
      "dados-pessoais",
      "sinal-de-alarme",
      "tentativa-de-manipulacao",
      "sem-consentimento",
    ]);
    expect(steps[0].submitted.sentToModel).toContain("[nome]");
    expect(steps[1].reviewed.finalPriority).toBe("emergency");
    expect(steps[2].submitted.sentToModel).toBeNull();
    expect(steps[3].submitted.modelStatus).toBe("skipped-no-consent");
    expect(audit.some((entry) => entry.contentDigest === steps[0].submitted.promptDigest)).toBe(
      true,
    );
    expect(chain.intact).toBe(true);
  });
});

describe("rótulos da triagem", () => {
  function triage(overrides: Partial<Triage>): Triage {
    return {
      id: "t",
      complaint: "",
      ageBand: "18-39",
      sentToModel: null,
      promptDigest: null,
      promptVersion: null,
      modelName: null,
      modelStatus: "accepted",
      modelPriority: null,
      suggestedPriority: null,
      source: "none",
      rationale: null,
      guardrails: [],
      alarmSigns: [],
      masks: {},
      decision: "pending",
      finalPriority: null,
      reviewedAt: null,
      traceId: "x",
      ...overrides,
    };
  }

  it("traduz prioridades, estados, origens, proteções e cenários", () => {
    expect(priorityLabel("less-urgent")).toBe("Pouco urgente");
    expect(priorityLabel(null)).toBe("Sem sugestão");
    expect(priorityLabel("outra")).toBe("outra");
    expect(modelStatusLabel("skipped-injection")).toMatch(/manipular/);
    expect(modelStatusLabel("novo")).toBe("novo");
    expect(sourceLabel("model-raised-by-rules")).toMatch(/elevada por regra/);
    expect(sourceLabel("x")).toBe("x");
    expect(guardrailLabel("alarm:falta-de-ar")).toBe("Alarme: falta de ar");
    expect(guardrailLabel("novo:a-b")).toBe("novo: a b");
    expect(guardrailLabel("consent")).toBe("Consentimento");
    expect(triageScenarioLabel("sinal-de-alarme")).toMatch(/alarme/);
    expect(triageScenarioLabel("x")).toBe("x");
  });

  it("descreve a decisão do profissional", () => {
    expect(reviewLabel(triage({ decision: "confirmed", finalPriority: "urgent" }))).toBe(
      "Confirmou: Urgente",
    );
    expect(reviewLabel(triage({ decision: "corrected", finalPriority: "non-urgent" }))).toBe(
      "Corrigiu para: Não urgente",
    );
    expect(reviewLabel(triage({}))).toBe("Pendente");
  });
});
