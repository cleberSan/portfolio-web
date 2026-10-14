const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const longDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

/** Converte `AAAA-MM-DD` para meia-noite UTC, recusando datas inexistentes como 2026-02-30. */
export function parseIsoDate(value: string): Date {
  if (!isoDate.test(value)) {
    throw new Error(`Data fora do formato AAAA-MM-DD: ${value}`);
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Data inexistente: ${value}`);
  }

  return date;
}

/** Formata em UTC para que a data exibida não mude com o fuso de quem faz o build. */
export function formatLongDate(value: string): string {
  return longDate.format(parseIsoDate(value));
}
