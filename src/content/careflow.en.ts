import type { careflow } from "./careflow";

type ServiceName = (typeof careflow.services)[number]["name"];

/**
 * Nome e sinal de cada serviço do CareFlow em inglês, para a topologia da home. Indexado pelo nome
 * em português: o TypeScript recusa um serviço sem tradução. Cabe na caixa de 150 px do desenho.
 */
export const careflowServicesEn: Record<ServiceName, { name: string; signal: string }> = {
  Agenda: { name: "Scheduling", signal: "no double booking" },
  "Cofre do paciente": { name: "Patient vault", signal: "per-field encryption" },
  Consentimento: { name: "Consent", signal: "revocation by event" },
  Triagem: { name: "Triage", signal: "pseudonymized AI" },
  Notificações: { name: "Notifications", signal: "channel fallback" },
  Auditoria: { name: "Audit", signal: "HMAC chain" },
  "Pedidos do titular": { name: "Data rights", signal: "FHIR R4" },
};
