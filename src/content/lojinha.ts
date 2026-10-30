const repository = "https://github.com/cleberSan/lojinha-da-lua";

/**
 * Estudo de caso do site da Lojinha Da Lua, uma loja real. Os fatos vêm do repositório e dos
 * ADRs dele; nome, marca, preços e textos da loja ficam lá, não aqui.
 */
export const lojinha = {
  name: "Lojinha Da Lua",
  tagline:
    "Site de uma loja real de produtos personalizados: catálogo com preços e pedido montado no navegador, enviado numa mensagem só pelo WhatsApp.",
  site: "https://lojinha-da-lua.clebersan.workers.dev",
  repository,
  adrs: `${repository}/tree/main/docs/adr`,
  stack: "Astro, React e Cloudflare",
  problem:
    "A loja vende camisetas e canecas personalizadas pelo Instagram e fecha os pedidos no WhatsApp. Os preços estavam em imagens de flyer, e quem queria mais de um produto escrevia o pedido à mão.",
  features: [
    {
      title: "Catálogo",
      description:
        "Produtos por categoria com preço a partir de, e uma página para cada um com variações e observações da loja.",
    },
    {
      title: "Montar pedido",
      description:
        "Junta vários produtos no próprio aparelho e envia uma mensagem só, com itens, preços e total de referência.",
    },
    {
      title: "Funciona sem JavaScript",
      description: "Cada variação tem o seu botão de pedido direto pelo WhatsApp.",
    },
    {
      title: "Prévia de link",
      description:
        "Imagem, título e descrição aparecem quando o link é compartilhado no WhatsApp ou no Instagram.",
    },
  ],
  decisions: [
    {
      title: "Hospedagem grátis que permite vender",
      description:
        "Vercel Hobby e GitHub Pages proíbem uso comercial. O site é publicado como arquivos estáticos num Worker da Cloudflare, sem cartão, e a Cloudflare lê o GitHub sem token guardado no repositório.",
      adr: "0002-hospedagem-na-cloudflare",
    },
    {
      title: "Zero JavaScript por padrão",
      description:
        "O Astro gera páginas estáticas. React entra só nas duas telas com interação, o painel Montar pedido e a página Meu pedido.",
      adr: "0006-montar-pedido-no-navegador",
    },
    {
      title: "Sem backend e sem dado pessoal",
      description:
        "O pedido fecha no WhatsApp da loja. O aparelho guarda só produto, variação e quantidade; nome e preço vêm do catálogo do build, então um preço editado no navegador não chega à mensagem.",
      adr: "0005-pedido-pelo-whatsapp-sem-backend",
    },
    {
      title: "Fotos de 1200 px a partir de prints de 720 px",
      description:
        "As únicas imagens da loja eram prints dos flyers. O painel de cada produto foi ampliado 4x com Real-ESRGAN, rodando localmente, e remontado no padrão dos flyers. No telefone impresso na polo, a ampliação é Lanczos, porque a rede trocava dígitos. As estampas são de terceiros, e o ADR registra o risco aceito e como voltar atrás.",
      adr: "0009-fotos-dos-flyers-com-estampas-originais",
    },
    {
      title: "CSP por hash, inclusive nas ilhas React",
      description:
        "Sem 'unsafe-inline'. Os scripts que hidratam o React entram por hash calculado no build, e um teste confere cada hash em cada página.",
      adr: "0004-csp-por-hash-e-cabecalhos",
    },
    {
      title: "SEO sem dependência nova",
      description:
        "Open Graph, JSON-LD de produto com preço em reais e sitemap gerados no build a partir do endereço do site, que fica no código.",
      adr: "0007-seo-e-previa-de-links",
    },
    {
      title: "Produção conferida todo dia",
      description:
        "A mesma suíte E2E do CI roda contra o site publicado e abre uma issue se algo mudar no ar. Na primeira execução, ela mostrou a produção sem canonical e sem sitemap, e o endereço saiu da configuração do painel para o código.",
      adr: "0008-conferencia-do-site-no-ar",
    },
  ],
  indicators: [
    { value: "R$ 0", label: "por mês de hospedagem, com uso comercial permitido" },
    { value: "0 KB", label: "de JavaScript nas páginas sem pedido" },
    { value: "1 vez por dia", label: "a suíte E2E confere o site publicado" },
    { value: "8", label: "decisões registradas em ADR" },
  ],
} as const;

export function lojinhaAdrUrl(adr: string): string {
  return `${repository}/blob/main/docs/adr/${adr}.md`;
}
