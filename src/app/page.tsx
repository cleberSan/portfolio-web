import { ExternalLink } from "@/components/external-link";
import { site } from "@/config/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-12 px-6 py-24">
      <header className="space-y-4">
        <p className="text-foreground/60 text-sm font-medium tracking-widest uppercase">
          Portfólio em construção
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="text-foreground/80 text-xl">{site.role}</p>
        <p className="text-foreground/70 leading-relaxed">{site.description}</p>
      </header>

      <section aria-labelledby="foco" className="space-y-4">
        <h2 id="foco" className="text-lg font-semibold">
          Foco
        </h2>
        <ul className="text-foreground/80 list-disc space-y-1 pl-5">
          {site.focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="careflow" className="space-y-3">
        <h2 id="careflow" className="text-lg font-semibold">
          Projeto em destaque: CareFlow
        </h2>
        <p className="text-foreground/70 leading-relaxed">
          Plataforma multi-clínica de agendamento e triagem assistida por IA, com privacidade por
          design (LGPD), construída em etapas públicas com .NET e microsserviços.
        </p>
        <ExternalLink
          href={site.links.careflow}
          className="inline-block font-medium underline underline-offset-4"
        >
          Acompanhar o CareFlow no GitHub
        </ExternalLink>
      </section>
    </main>
  );
}
