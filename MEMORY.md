# Memória e Conhecimento do Projeto GranaHub Blog

Este arquivo tem como objetivo registrar configurações, lógicas aplicadas e o histórico de como o projeto funciona, para garantir que qualquer assistência futura conte com o mesmo contexto e não seja perdida após reinicializações.

## 1. Stack e Arquitetura Principal
- **Framework**: Next.js (App Router ou Pages Router configurado para exportação estática).
- **Destino de Hospedagem**: Hostinger (via servidor Apache).
- **Conteúdo**: Arquivos Markdown (`.md`) armazenados na pasta `content/posts/`.

## 2. Configurações Estruturais Críticas (`next.config.ts`)
- **Exportação Estática**: O painel e o blog do GranaHub funcionam com hospedagem estática e sem servidor NodeJS próprio. Por causa disso, o arquivo de configuração exporta o build usando o comando `output: 'export'`.
- **Roteamento de Diretórios (`trailingSlash: true`)**: Extremamente crítico. Habilitamos `trailingSlash: true`. Se isso for desligado, um acesso direto a um link gerará **Erro 403 Forbidden**. Isso ocorre pois servidores Apache (Hostinger) buscam a rota internamente como pastas. Tendo essa tag ativada, o Next.js constrói uma página física real `index.html` dentro da pasta exata da URL, fazendo com que o acesso direto pelos navegadores encontre a página correspondente.
- **Imagens Não-Otimizadas**: `images: { unoptimized: true }` habilitado para contornar limitações do Server Side do componente `next/image` quando combinados em build local ou Actions que não contam com o processamento otimizado de imagens no servidor e causam a quebra de caminhos ou URLs remotas, facilitando também a exibição de capas salvas externamente, como links do Unsplash e Pexels.
- **Autor Padrão**: Foi definido que o autor dos posts deve ser exibido como **"Da Redação"** em vez de "GranaHub IA" para transmitir mais profissionalismo. Esta alteração é feita em `src/app/posts/[slug]/page.tsx`.

## 3. Comportamento do Servidor (`public/.htaccess`)
Foi adaptado um arquivo `.htaccess` inserido na pasta `public` do projeto Next.js. O conteúdo desse arquivo será jogado em `out/.htaccess` após cada compilação e é vital para que a configuração estática funcione bem no Hostinger:
- Possui regras que direcionam para cache longo pastas nativas (como a do Next.js) pra evitar latência excessiva.
- Processa roteamentos diretos fallback caso algum `.html` não seja encontrado.

## 4. Deploy Automatizado (GitHub Actions)
- O processo de *Deploy* ocorre automaticamente ao disparar commits na branch `main`.
- Um *Agent* (agente de IA auxiliar) tem uma pipeline programada isolada que pode gerar novos artigos, fazer commit e atualizar o blog por conta própria.
- Esteja a postos após um pull do Agente de IA para checar se ele adicionou imagens Unsplash com caminhos válidos (caminhos que retornem 200 OK sem cair e sem erro 404). As imagens não aparecerem e sumirem nos posts é sinal de links corrompidos e gerados acidentalmente pelo Agent (alucinação) e requer substituição pelo método de edição no Front-Matter `coverImage`.

## 5. Robô de IA e Gerenciamento de Imagens (Agente)
- **Integração Pexels**: O robô (`tools/agent.mjs`) utiliza a `PEXELS_API_KEY` (configurada nos Secrets do GitHub) para buscar imagens de capa dinâmicas e contextuais.
- **Sistema de Fallback (Reserva)**: Caso a API do Pexels falhe ou a chave não esteja presente, o robô conta com uma lista de URLs validadas do Unsplash. Ele seleciona uma aleatoriamente para garantir que nenhum post fique sem imagem ou com imagem quebrada (Erro 404).
- **Refinamento de Títulos**: Observou-se que o robô pode gerar títulos excessivamente sensacionalistas (estilo "clickbait"). O fluxo recomendado é revisar o título no Pull Request e ajustar para um tom mais prático e direto, condizente com a voz da marca GranaHub, antes de realizar o Merge.
- **Slugs Atemporais**: O robô está proibido de incluir anos (ex: 2024, 2025) nos slugs dos posts para garantir que os links permaneçam válidos e relevantes por longo prazo sem parecerem datados.
- **Categorias Restritas**: O robô deve usar apenas categorias pré-aprovadas: "Economia Doméstica", "Investimentos", "Planejamento", "Imposto de Renda" ou "GranaHub".

## 6. Como Manter este Documento
Ao realizar qualquer mudança arquitetural, adicionar integrações de Banco de Dados, regras de redirecionamento ou novos plug-ins no Front-End, por favor, proceda com o apêndice neste documento em novas sessões para que a base de conhecimento (Brain) ou seu assistente mantenha-se com máxima consciência sobre a máquina do GranaHub!

## 7. Dashboard de Analytics (`/gh-secret-stats-2026`)
- **Rota**: `/gh-secret-stats-2026` — protegida com `noindex, nofollow`
- **Dados em tempo de build**: O script `tools/fetch-analytics.mjs` é executado antes do `next build` (via `npm run build`). Ele busca dados reais do GA4 e Search Console e grava em `src/data/analytics.json`.
- **Fallback gracioso**: Se as variáveis de ambiente não estiverem disponíveis (ex: build local), o script grava dados zerados e o build conclui normalmente sem erros.
- **Secrets necessários no GitHub Actions** (Settings → Secrets → Actions):
  - `GOOGLE_SERVICE_ACCOUNT_JSON`: JSON completo da Service Account do Google Cloud
  - `GA4_PROPERTY_ID`: ID numérico da propriedade GA4 (ex: `123456789`)
  - `SEARCH_CONSOLE_SITE_URL`: URL do site no Search Console (ex: `https://blog.granahub.com.br/`)
- **APIs habilitadas**: Google Analytics Data API + Google Search Console API
- **Permissões da Service Account**: Leitor no GA4 + Restrito no Search Console
- **Status Atual**: Atualmente o dashboard pode exibir `isReal: false` se as credenciais não forem validadas corretamente ou se as APIs estiverem desativadas no console do Google Cloud.

## 8. Componente de Compartilhamento
- **Arquivo**: `src/components/ShareArticle.tsx`
- **Funcionalidades**: Botão dedicado para compartilhamento via WhatsApp e botão para copiar o link do artigo. Localizado acima do CTA final de cada post.

## 9. Política de Publicação e Infraestrutura
- **Deploy**: Realizado via GitHub Actions usando `lftp` sobre **SFTP** (porta **65002**). Host: `82.29.199.52`, Usuário: `u624347113`.
- **Path de Deploy**: Caminho absoluto completo: `/home/u624347113/domains/blog.granahub.com.br/public_html`
- **Secrets GitHub**: `SFTP_HOST`, `SFTP_USER`, `SFTP_PASS` (configurados em Settings → Secrets → Actions)
- **Referência completa**: Ver arquivo `kodee_hostinger.md` na raiz do projeto com todas as informações do suporte Hostinger.
- **Sitemap**: Gerado dinamicamente em `public/sitemap.xml` pelo script `tools/sitemap-generator.mjs` durante o processo de build. Inclui a página inicial e todos os posts.

