import gravacao from "./painel/gravacao.json";

/**
 * Gravação real dos quatro cenários do Painel, feita pelo teste `PanelRecordingTests` do
 * CareFlow contra o sistema inteiro (ADR-0010 do CareFlow). O site só reproduz: nada aqui é
 * simulado. Para atualizar, troque `gravacao.json` pelo artefato `panel-recording` do CI.
 */

export type SpanEvent = { name: string; attributes: Readonly<Record<string, string>> };

export type Span = {
  spanId: string;
  parentSpanId: string | null;
  service: string;
  name: string;
  kind: string;
  startedAt: string;
  durationMs: number;
  status: string;
  attributes: Readonly<Record<string, string>>;
  events: readonly SpanEvent[];
};

export type Trace = { traceId: string; spans: readonly Span[] };

export type LogLine = { at: string; service: string; severity: string; message: string };

export type Appointment = {
  id: string;
  patientRef: string;
  startsAt: string;
  status: string;
  cancellationReason: string | null;
};

export type Consent = {
  purpose: string;
  legalBasis: string;
  status: string;
  grantedAt: string;
  revokedAt: string | null;
};

export type Attempt = { round: number; channel: string; outcome: string };

export type Notice = {
  appointmentId: string;
  kind: string;
  status: string;
  sentVia: string | null;
  notSentReason: string | null;
  attempts: readonly Attempt[];
};

export type AuditEntry = {
  sequence: number;
  occurredAt: string;
  sourceService: string;
  action: string;
  resourceType: string;
};

export type Chain = { intact: boolean; entriesVerified: number; lastSequence: number };

export type Propagation = {
  appointments: readonly Appointment[];
  notifications: readonly Notice[];
  audit: readonly AuditEntry[];
  chain: Chain;
};

export type ChannelState = {
  channel: string;
  fault: string | null;
  faultExpiresAt: string | null;
  circuit: string;
};

export type Booking = {
  appointmentId: string;
  startsAt: string;
  traceId: string;
  attempts: number;
  refusals: readonly string[];
};

export type ResilienceStep = {
  atMs: number;
  action: string;
  channels: { partition: string; channels: readonly ChannelState[] };
  booking: Booking | null;
  notification: Notice | null;
};

export type PanelRecording = {
  schema: number;
  recordedAt: string;
  commit: string;
  source: string;
  patient: {
    vault: {
      patientRef: string;
      fullName: string;
      cpf: string;
      birthDate: string;
      email: string | null;
      phone: string | null;
    };
    pseudonym: string;
    logMask: string;
  };
  booking: { booking: Booking; trace: Trace; logs: readonly LogLine[] };
  views: {
    scheduling: readonly Appointment[];
    consentPatientRef: string;
    consent: readonly Consent[];
    notifications: readonly Notice[];
    logMask: string;
    logs: readonly LogLine[];
  };
  resilience: { steps: readonly ResilienceStep[]; fallbackTrace: Trace };
  revocation: {
    action: { traceId: string };
    before: Propagation;
    after: Propagation;
    trace: Trace;
    logs: readonly LogLine[];
  };
};

export const recording = gravacao as unknown as PanelRecording;

export const repositoryUrl = "https://github.com/cleberSan/careflow";

export function commitUrl(commit: string): string | undefined {
  return /^[0-9a-f]{40}$/.test(commit) ? `${repositoryUrl}/commit/${commit}` : undefined;
}

const serviceNames: Readonly<Record<string, string>> = {
  "careflow-demo": "Demo (BFF do Painel)",
  "careflow-scheduling": "Agenda",
  "careflow-patient-vault": "Cofre do paciente",
  "careflow-consent": "Consentimento",
  "careflow-notifications": "Notificações",
  "careflow-audit": "Auditoria",
};

export function serviceName(service: string): string {
  return serviceNames[service] ?? service;
}

export function isDatabaseSpan(span: Span): boolean {
  return Object.keys(span.attributes).some((key) => key.startsWith("db.system"));
}

export type WaterfallRow = {
  spanId: string;
  service: string;
  name: string;
  kind: string;
  status: string;
  depth: number;
  offsetMs: number;
  durationMs: number;
  events: readonly SpanEvent[];
};

export type Waterfall = {
  rows: readonly WaterfallRow[];
  totalMs: number;
  services: readonly string[];
  hiddenDatabaseSpans: number;
};

/**
 * Linhas do trace em ordem de início, com a profundidade na árvore. Spans de banco ficam de
 * fora (são muitos e repetem a mesma informação); a profundidade sobe pelo pai até achar um
 * span visível, então a árvore continua coerente sem eles.
 */
export function buildWaterfall(trace: Trace): Waterfall {
  const byId = new Map(trace.spans.map((span) => [span.spanId, span]));
  const visible = trace.spans.filter((span) => !isDatabaseSpan(span));
  const visibleIds = new Set(visible.map((span) => span.spanId));
  const starts = trace.spans.map((span) => Date.parse(span.startedAt));
  const origin = Math.min(...starts);
  const end = Math.max(...trace.spans.map((span, i) => starts[i] + span.durationMs));

  const depthOf = (span: Span): number => {
    let depth = 0;
    let parentId = span.parentSpanId;
    const seen = new Set<string>();
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = byId.get(parentId);
      if (!parent) {
        break;
      }
      if (visibleIds.has(parent.spanId)) {
        depth++;
      }
      parentId = parent.parentSpanId;
    }
    return depth;
  };

  const rows = visible
    .map((span) => ({
      spanId: span.spanId,
      service: span.service,
      name: span.name,
      kind: span.kind,
      status: span.status,
      depth: depthOf(span),
      offsetMs: Date.parse(span.startedAt) - origin,
      durationMs: span.durationMs,
      events: span.events,
    }))
    .sort((a, b) => a.offsetMs - b.offsetMs || a.depth - b.depth);

  return {
    rows,
    totalMs: Number.isFinite(end - origin) ? end - origin : 0,
    services: [...new Set(rows.map((row) => row.service))],
    hiddenDatabaseSpans: trace.spans.length - visible.length,
  };
}

export type AuditGroup = { action: string; count: number; services: readonly string[] };

/** Ações da trilha agrupadas, na ordem em que aparecem pela primeira vez. */
export function groupAudit(entries: readonly AuditEntry[]): readonly AuditGroup[] {
  const groups = new Map<string, { count: number; services: Set<string> }>();
  for (const entry of [...entries].sort((a, b) => a.sequence - b.sequence)) {
    const group = groups.get(entry.action) ?? { count: 0, services: new Set<string>() };
    group.count++;
    group.services.add(entry.sourceService);
    groups.set(entry.action, group);
  }
  return [...groups].map(([action, group]) => ({
    action,
    count: group.count,
    services: [...group.services],
  }));
}

/** Tempo entre a revogação e o último cancelamento auditado por causa dela. */
export function propagationMs(propagation: Propagation): number | undefined {
  const revoked = propagation.audit.find((entry) => entry.action === "consent.revoked");
  const cancellations = propagation.audit.filter(
    (entry) => entry.action === "appointment.cancelled.consent-revoked",
  );
  if (!revoked || cancellations.length === 0) {
    return undefined;
  }
  const last = Math.max(...cancellations.map((entry) => Date.parse(entry.occurredAt)));
  return Math.max(0, last - Date.parse(revoked.occurredAt));
}

export function whatsapp(step: ResilienceStep): ChannelState | undefined {
  return step.channels.channels.find((channel) => channel.channel === "whatsapp");
}

const circuitLabels: Readonly<Record<string, string>> = {
  Closed: "Fechado",
  Open: "Aberto",
  HalfOpen: "Meio-aberto",
  Isolated: "Isolado",
};

export function circuitLabel(state: string): string {
  return circuitLabels[state] ?? state;
}

const actionLabels: Readonly<Record<string, string>> = {
  inicio: "Sessão aberta, canais normais",
  "whatsapp-fora": "WhatsApp derrubado (falha injetada só nesta clínica)",
  reserva: "Consulta reservada",
  "whatsapp-de-volta": "WhatsApp de volta",
};

export function stepLabel(action: string): string {
  return actionLabels[action] ?? action;
}

const millis = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatMs(value: number): string {
  return `${millis.format(value)} ms`;
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Data e hora em UTC, para o texto não mudar com o fuso de quem faz o build. */
export function formatRecordedAt(value: string): string {
  return `${dateTime.format(new Date(value))} (UTC)`;
}
