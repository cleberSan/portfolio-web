import type { CaseId, CaseText } from "./cases";
import { careflow, careflowPhases } from "./careflow";

const careflowPhasesDone = careflowPhases.filter((phase) => phase.status === "concluida").length;

/** "93,6%" vira "93.6%": em inglês o separador decimal é o ponto. */
const triageWithinOneLevel = careflow.triageEval.withinOneLevel.replace(",", ".");

/** Destinos que só existem em português ganham o aviso no rótulo e o `hrefLang`. */
const inPortuguese = { hrefLang: "pt-BR" } as const;

/**
 * Textos dos cases em inglês, indexados pelo id de `cases.ts`: o TypeScript recusa um case sem
 * tradução. Contexto, destinos dos links e números vêm dos mesmos dados do português.
 */
export const casesTextEn: Record<CaseId, CaseText> = {
  "pagamentos-resilientes": {
    tag: "Payments",
    title: "Payments that don't cancel blindly",
    problem:
      "Pix, card payments, refunds and subscription renewals depend on external providers that sometimes respond ambiguously or deliver the same event twice. Cancelling at the first sign of an error can undo a payment that actually went through.",
    approach:
      ".NET microservices with Service Bus queues and topics and RabbitMQ/AMQP on AWS, with idempotency, duplicate handling, retry and state reconciliation. An ambiguous provider response is treated as a potential success and reconciled, not cancelled.",
    result:
      "Pix, card, refund and recurring subscription journeys that handle duplicates and reconcile state with the provider, instead of firing blind cancellations.",
    stack: [".NET", "Azure Service Bus", "RabbitMQ", "AWS", "React"],
  },
  "scripts-mongodb": {
    tag: "Data",
    title: "Data scripts with a way back",
    problem:
      "Data fixes in staging change MongoDB directly. A script with no way back leaves the environment in a state nobody can explain or undo.",
    approach:
      "Operational scripts with the rollback designed before execution and paired validation of every write: each change has its own check.",
    result: "Reversible, auditable data operations in staging.",
    stack: ["MongoDB", "Rollback", "Auditing"],
  },
  "fundos-cotas": {
    tag: "Investment funds",
    title: "Fund share calculation and asset pricing",
    problem:
      "Fund share (NAV) calculation, asset pricing and regulatory and accounting processes tolerate neither silent errors nor regressions between versions.",
    approach:
      ".NET backend and Vue.js and React frontend integrated through REST APIs, messaging with RabbitMQ, caching with Redis and unit and integration tests with xUnit, on Docker and Kubernetes with Rancher.",
    result:
      "Deliveries that pass the SonarQube quality gate on Azure DevOps and are monitored in production with Datadog.",
    stack: [".NET", "Vue.js", "React", "RabbitMQ", "Redis", "Kubernetes"],
  },
  "estacionamento-3ds": {
    tag: "Payments",
    title: "Ticket purchases with 3DS, end to end",
    problem:
      "Parking meters, parking cards and tickets need card payments with strong authentication, in systems that range from .NET Framework 4 to .NET 8.",
    approach:
      "Integration with Adyen and 3DS, and cards with Firebase pay card, Redis and Blob Storage, Docker and Kubernetes on Azure, with Angular and React on the frontend.",
    result:
      "End-to-end purchase of parking cards and tickets in the parking applications, monitored with Datadog.",
    stack: [".NET 8", "Adyen", "3DS", "Azure", "Kubernetes", "Angular"],
  },
  careflow: {
    tag: "Healthcare · personal project",
    title: "Scheduling and triage with privacy built into the design",
    problem:
      "Clinics that share scheduling, patient records and AI handle health data, which is sensitive data under LGPD, Brazil's data protection law: it needs a legal basis, an access trail and the right to erasure.",
    approach: `${careflow.services.length} .NET services, each with its own database, exchanging events over RabbitMQ with Outbox and Inbox. Row-Level Security per clinic, field-level encryption, an HMAC-chained audit trail and AI only on pseudonymized data.`,
    result: `${careflowPhasesDone} phases delivered in public, with ADRs and CI, and ${triageWithinOneLevel} AI triage accuracy within a tolerance band. The Panel replays a real CI run.`,
    stack: [".NET 10", "RabbitMQ", "PostgreSQL", "OpenTelemetry", "AI"],
    links: [
      { label: "Architecture and roadmap (in Portuguese)", ...inPortuguese },
      { label: "Open the CareFlow Panel (in Portuguese)", ...inPortuguese },
    ],
  },
  "lojinha-da-lua": {
    tag: "Retail · personal project",
    title: "A catalog with WhatsApp ordering and no fixed cost",
    problem:
      "The store sells custom T-shirts and mugs on Instagram and closes orders on WhatsApp. Prices lived in flyer images, and anyone who wanted more than one product typed the order by hand.",
    approach:
      "A static Astro site, with React only on the ordering screens, published on a Cloudflare Worker. No backend and no personal data stored, with a hash-based CSP and the E2E suite checking production every day.",
    result:
      "R$ 0 per month in hosting with commercial use allowed, 0 KB of JavaScript on pages without ordering and 8 decisions recorded as ADRs.",
    stack: ["Astro", "React", "Cloudflare", "Playwright"],
    links: [
      { label: "Read the Lojinha case study (in Portuguese)", ...inPortuguese },
      { label: "Open the Lojinha site (in Portuguese)", ...inPortuguese },
    ],
  },
};
