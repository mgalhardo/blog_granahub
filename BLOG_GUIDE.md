# 📘 Guia Completo — Blog Next.js com Automação IA

> Documentação baseada no projeto **GranaHub Blog** para replicação em outros sites/clientes.
> Criado em: 30 de Abril de 2026 | Última atualização: 30 de Abril de 2026

---

## 1. Visão Geral do Projeto

O blog é uma aplicação **Next.js 16** com **exportação estática** (`output: 'export'`), hospedada em servidor Apache (Hostinger). Os posts são escritos em **Markdown** com frontmatter YAML e um robô de IA gera conteúdo diário automaticamente via GitHub Actions.

### Por que essa stack?

| Decisão | Motivo |
|---------|--------|
| **Next.js Static Export** | Zero custo de servidor Node.js. Funciona em qualquer hosting compartilhado (Apache/Nginx) |
| **Markdown como CMS** | Sem banco de dados externo, sem custos. O Git é o CMS. Painel admin protegido para gestão |
| **Tailwind CSS v4** | Design system moderno com tokens customizados via `@theme` |
| **GitHub Actions** | CI/CD gratuito — build, deploy e geração de conteúdo automatizados |
| **IA com Triple Failover** | Gemini → Groq → Ollama Local: zero downtime na geração |

---

## 2. Stack Técnica Completa

```
Framework:      Next.js 16.2.2 (App Router)
React:          19.2.4
TypeScript:     5.x
CSS:            Tailwind CSS 4 + @tailwindcss/typography
Markdown:       gray-matter (frontmatter) + react-markdown (render)
Ícones:         lucide-react
UI:             Radix UI (slots) + class-variance-authority
IA:             @google/generative-ai (Gemini)
Analytics:      googleapis (GA4 + Search Console)
Hospedagem:     Hostinger (Apache com .htaccess)
Deploy:         lftp via SFTP (porta 65002)
CI/CD:          GitHub Actions
Notificações:   Telegram Bot API
Admin Panel:    Rota protegida com autenticação simples
```

> [!IMPORTANT]
> **Cada projeto/cliente deve ter seu próprio repositório Git** dedicado ao blog. Isso garante isolamento de secrets, workflows independentes e histórico de conteúdo separado. Exemplo: `github.com/seuusuario/blog-jardimlar`, `github.com/seuusuario/blog-granahub`.

---

## 3. Estrutura de Pastas

```
blog/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Deploy automático ao push na main
│       └── ai-agent.yml        # Geração diária de post via IA
├── content/
│   ├── posts/                  # Arquivos .md dos posts (o "banco de dados")
│   │   ├── meu-primeiro-post.md
│   │   └── ...
│   └── sugestoes.md            # Fila manual de temas (opcional)
├── public/
│   ├── .htaccess               # Configuração Apache (CRÍTICO)
│   ├── covers/                 # Imagens de capa geradas por IA
│   ├── images/                 # Imagens gerais
│   ├── logo-icon.png
│   ├── logo-transparent.png
│   └── sitemap.xml             # Gerado automaticamente no build
├── src/
│   ├── app/
│   │   ├── globals.css         # Design tokens (cores, animações)
│   │   ├── layout.tsx          # Layout raiz (Header, Footer, GTM, Meta Pixel)
│   │   ├── page.tsx            # Home — lista de posts
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Página individual do post
│   │   └── admin-blog-HASH/    # Painel admin (rota secreta com hash único)
│   │       └── page.tsx        # Gerenciar posts + solicitar criação
│   ├── components/
│   │   ├── Header.tsx          # Navegação com scroll effect + mobile menu
│   │   ├── Footer.tsx          # Rodapé com links e social
│   │   ├── PostList.tsx        # Grid de posts com filtro por categoria
│   │   └── ShareArticle.tsx    # Botões WhatsApp + Copiar Link
│   ├── data/
│   │   └── analytics.json      # Dados GA4/Search Console (gerado no build)
│   └── lib/
│       ├── posts.ts            # Lógica de leitura dos Markdowns
│       └── utils.ts            # Utilitários (cn, etc.)
├── tools/
│   ├── agent.mjs               # Robô de IA (geração de posts)
│   ├── fetch-analytics.mjs     # Busca dados do GA4/Search Console
│   └── sitemap-generator.mjs   # Gera sitemap.xml no build
├── next.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── MEMORY.md                   # Base de conhecimento do projeto
```

---

## 4. Configurações Críticas

### 4.1 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',       // Exportação estática (sem servidor Node)
  trailingSlash: true,     // OBRIGATÓRIO para Apache — evita 403
  images: {
    unoptimized: true,     // Necessário em static export
  },
};

export default nextConfig;
```

> [!CAUTION]
> **Nunca desabilite `trailingSlash: true`** em hospedagem Apache/Nginx. Sem isso, acessos diretos a URLs resultam em **Erro 403 Forbidden** porque o servidor busca pastas, não arquivos. Com `trailingSlash`, o Next.js gera `posts/slug/index.html` em vez de `posts/slug.html`.

### 4.2 `public/.htaccess` (Apache)

Regras essenciais que devem existir na `public/` (copiadas automaticamente para `out/` no build):

```apache
# Cache longo para assets estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Rewrite para trailing slash + fallback
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve arquivos e diretórios existentes
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Adiciona trailing slash se falta
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_URI} -d
  RewriteRule ^(.+[^/])$ /$1/ [R=301,L]

  # Serve index.html de subdiretórios
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.+)/?$ $1/index.html [L]

  # Fallback para .html
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.+)$ $1.html [L]

  ErrorDocument 404 /404.html
</IfModule>

# Headers de segurança + Cache inteligente
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  
  # Assets do _next com hash = cache imutável
  <FilesMatch "\.(js|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  
  # HTML sempre revalidado
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

### 4.3 Formato dos Posts (Markdown + Frontmatter)

```markdown
---
title: "Título do Post para SEO"
date: "2026-04-30"
description: "Descrição curta para metadados e preview (2 linhas)"
coverImage: "https://images.pexels.com/photos/123456/photo.jpeg?auto=compress&cs=tinysrgb&w=1260"
category: "Economia Doméstica"
---

Corpo do post em Markdown aqui...

## Subtítulo

Texto com **negrito**, *itálico* e [links](https://exemplo.com).

### Sub-subtítulo

- Lista
- De
- Itens
```

**Categorias válidas**: Devem ser definidas **por projeto**. Cada nicho tem suas próprias categorias.

> [!IMPORTANT]
> **Defina as categorias ANTES de começar a gerar conteúdo.** O robô de IA tende a inventar categorias se não forem restringidas. Exemplos por nicho:
> - **Finanças**: `Economia Doméstica`, `Investimentos`, `Planejamento`, `Imposto de Renda`
> - **Imobiliário**: `Compra`, `Venda`, `Locação`, `Financiamento`, `Dicas de Decoração`
> - **Saúde**: `Nutrição`, `Exercícios`, `Bem-estar`, `Prevenção`
> - **Tecnologia**: `Tutoriais`, `Reviews`, `Notícias`, `Dicas`

---

## 5. Pipeline de CI/CD

### 5.1 Deploy Automático (`deploy.yml`)

**Trigger**: Push na branch `main`

```
Checkout → Setup Node 20 → npm ci → npm run build → lftp SFTP → Telegram
```

O `npm run build` executa em sequência:
1. `fetch-analytics` — Busca dados do GA4/Search Console
2. `sitemap` — Gera `public/sitemap.xml`
3. `next build` — Gera a pasta `out/`

O deploy usa `lftp` com `mirror -R --delete` via **SFTP na porta 65002**.

### 5.2 Agente de IA (`ai-agent.yml`)

**Trigger**: CRON `0 10 * * *` (07:00 BRT) + dispatch manual

```
Checkout → Setup Node 24 → npm ci → agent.mjs → git commit/push → build → deploy → Telegram
```

O agente:
1. Verifica se há tema na fila manual (`content/sugestoes.md`)
2. Se não, faz brainstorming consultando notícias reais (G1, InfoMoney)
3. Gera o post completo via IA (triple failover)
4. Busca imagem de capa no Pexels (com fallback Unsplash)
5. Salva o Markdown em `content/posts/`
6. Faz commit direto na `main` e deploy
7. Notifica via Telegram

> [!WARNING]
> **Integração com Threads (Instagram/Meta)**: A publicação automática no Threads está em fase experimental no projeto GranaHub. O código existe em `tools/agent.mjs` mas ainda **não está finalizado e validado em produção**. Quando estiver estável, este guia será atualizado com as instruções completas. Por enquanto, **não configure** `THREADS_ACCESS_TOKEN` e `THREADS_USER_ID` em novos projetos.

### 5.3 Secrets Necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `GROQ_API_KEY` | Chave da API Groq (fallback) |
| `PEXELS_API_KEY` | Chave da API Pexels (imagens) |
| `FTP_SERVER` | IP do servidor SFTP (ex: `82.29.199.52`) |
| `FTP_USERNAME` | Usuário SFTP (ex: `u624347113`) |
| `FTP_PASSWORD` | Senha SFTP/SSH |
| `TELEGRAM_TOKEN` | Token do bot Telegram (via @BotFather) |
| `TELEGRAM_CHAT_ID` | ID numérico do chat/grupo |
| `LOCAL_AI_URL` | URL do Ollama local via Cloudflare (**ver pergunta na seção 7**) |
| `CF_ACCESS_CLIENT_ID` | Service Token Cloudflare (**ver pergunta na seção 7**) |
| `CF_ACCESS_CLIENT_SECRET` | Service Token Cloudflare (**ver pergunta na seção 7**) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da Service Account (Analytics) |
| `GA4_PROPERTY_ID` | ID numérico da propriedade GA4 |
| `SEARCH_CONSOLE_SITE_URL` | URL do site no Search Console |

---

## 6. Como Reproduzir em Outro Projeto

### Passo a Passo

#### 1. Criar o repositório dedicado ao blog do cliente

Cada blog deve ter **seu próprio repositório Git**, separado do site principal:
```bash
mkdir blog-nomedocliente && cd blog-nomedocliente
git init
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-turbopack
```

#### 2. Instalar dependências extras

```bash
npm install gray-matter react-markdown @tailwindcss/typography lucide-react
npm install @google/generative-ai dotenv googleapis
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

#### 3. Configurar `next.config.ts`

Adicionar `output: 'export'`, `trailingSlash: true` e `images: { unoptimized: true }`.

#### 4. Montar a estrutura de pastas

Criar `content/posts/`, `tools/`, e os componentes base em `src/components/`.

#### 5. Criar o `public/.htaccess`

Copiar o modelo da seção 4.2 acima.

#### 6. Copiar os scripts de ferramentas

- `tools/agent.mjs` — Adaptar prompts para o nicho
- `tools/sitemap-generator.mjs` — Trocar `BASE_URL`
- `tools/fetch-analytics.mjs` — Adaptar IDs do GA4

#### 7. Configurar GitHub Actions

Copiar os dois workflows e adaptar:
- Caminho remoto do SFTP
- Nomes e mensagens de notificação

#### 8. Configurar deploy para subdiretório `/blog`

Como o blog é um **complemento do site principal**, ele roda no subdiretório `/blog`. O deploy envia os arquivos para a pasta `blog/` dentro do `public_html` do domínio principal:
```
/home/USUARIO/domains/seudominio.com.br/public_html/blog
```

Se for subdomínio (ex: `blog.seudominio.com.br`), use:
```
/home/USUARIO/domains/blog.seudominio.com.br/public_html
```

#### 9. Definir as categorias do projeto

Antes de qualquer geração de conteúdo, defina as categorias específicas do nicho. Adicione-as:
- No prompt do `tools/agent.mjs`
- No painel admin (para filtros e validação)
- No `MEMORY.md` do projeto

---

## 7. Decisões por Projeto (Perguntas Obrigatórias)

Antes de iniciar um novo blog, responda estas perguntas:

### 📋 Checklist de Decisões

| # | Pergunta | Exemplo GranaHub |
|---|----------|------------------|
| 1 | **Quais são as categorias do blog?** (mínimo 3, máximo 6) | Economia Doméstica, Investimentos, Planejamento, Imposto de Renda |
| 2 | **O blog roda em subdomínio ou subdiretório?** | Subdomínio: `blog.granahub.com.br` |
| 3 | **Qual o repositório Git do blog?** | `github.com/usuario/blog-granahub` |
| 4 | **Qual o tom editorial?** (formal, casual, técnico) | Encorajador, simples, profissional |
| 5 | **Quais fontes de notícias RSS usar no brainstorming?** | G1 Economia, InfoMoney |
| 6 | **Vai usar LLMs locais (Ollama) como fallback?** Se sim, qual o endpoint Cloudflare? Se não, usar apenas Gemini + Groq. | Sim: `scribe.granahub.com.br` |
| 7 | **Qual o CTA padrão dos posts?** (link de conversão) | `https://app.granahub.com.br/auth?mode=register` |
| 8 | **Credenciais do Telegram para notificações?** | Bot token + Chat ID |

> [!NOTE]
> **Sobre LLMs Locais (pergunta 6)**: A camada de IA Local (Ollama via Cloudflare Tunnel) é **opcional** e requer infraestrutura própria (servidor local com mínimo 4GB RAM + Cloudflare Zero Trust configurado). Se o cliente/projeto **não possui** servidor local, simplesmente não configure os secrets `LOCAL_AI_URL`, `CF_ACCESS_CLIENT_ID` e `CF_ACCESS_CLIENT_SECRET`. O agente funcionará normalmente com Gemini + Groq (dual failover em vez de triple).

---

## 8. Painel Administrativo do Blog

Cada blog deve ter um **painel admin protegido** acessível via rota secreta (ex: `/admin-blog-x7k9m2/`). O painel é uma página estática com funcionalidades client-side.

### Funcionalidades do Painel

| Funcionalidade | Descrição |
|---------------|-----------|
| **Listar posts** | Exibe todos os posts com título, data, categoria e status |
| **Deletar post** | Remove o arquivo `.md` via GitHub API (commit automático) |
| **Solicitar novo post** | Botão que dispara o workflow `ai-agent.yml` via GitHub API (`workflow_dispatch`) |
| **Filtrar por categoria** | Filtra posts pelas categorias definidas do projeto |
| **Preview** | Link direto para o post publicado |

### Implementação

```typescript
// src/app/admin-blog-HASH/page.tsx
// Rota protegida por:
// 1. URL secreta com hash único (security through obscurity)
// 2. Meta tag noindex/nofollow
// 3. Autenticação simples via senha no localStorage

// Ações que o painel executa:
// - GET  /api.github.com/repos/OWNER/REPO/contents/content/posts  → Listar
// - DELETE /api.github.com/repos/OWNER/REPO/contents/content/posts/SLUG.md → Deletar
// - POST /api.github.com/repos/OWNER/REPO/actions/workflows/ai-agent.yml/dispatches → Gerar novo
```

### Secrets Adicionais para o Painel

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_GITHUB_TOKEN` | Personal Access Token com scope `repo` e `workflow` |
| `NEXT_PUBLIC_GITHUB_OWNER` | Usuário/org dono do repo |
| `NEXT_PUBLIC_GITHUB_REPO` | Nome do repositório do blog |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Senha de acesso ao painel (hash SHA-256 recomendado) |

> [!CAUTION]
> O `NEXT_PUBLIC_GITHUB_TOKEN` fica exposto no client-side. Use um token com **permissões mínimas** (apenas o repo do blog) e **validade curta** (90 dias). Rotacione periodicamente.

---

## 9. Lições Aprendidas

### 🔴 Crítico — Erros que Quebraram Produção

1. **`trailingSlash: true` é obrigatório** em Apache/Nginx. Sem isso, qualquer acesso direto a uma URL retorna 403 Forbidden. O Next.js precisa gerar `slug/index.html` em vez de `slug.html` para que servidores que esperam diretórios funcionem.

2. **O caminho SFTP na Hostinger é completo**: `/home/USUARIO/domains/subdominio/public_html`. Usar só `/public_html` **não funciona** e o deploy silenciosamente falha sem erro claro.

3. **`images: { unoptimized: true }` é obrigatório** em static export. Sem isso, o `next/image` tenta usar otimização do servidor (que não existe em hosting estático) e quebra todas as imagens.

### 🟡 Importante — Decisões de Design

4. **Autor "Da Redação" em vez de "IA"**: Mesmo que o conteúdo seja gerado por IA, exibir "GranaHub IA" como autor transmite amadorismo. "Da Redação" é profissional e aceito editorialmente.

5. **Slugs atemporais (sem anos)**: Nunca incluir `2024`, `2025` etc. nos slugs. O post pode ser relevante por anos e um slug datado perde autoridade SEO e parece desatualizado. Se precisar corrigir um slug antigo, use redirect 301 no `.htaccess`.

6. **Categorias restritas**: O robô de IA tende a inventar categorias novas a cada post. Restringir a um set fixo evita fragmentação e melhora a navegação.

7. **Revisão de títulos**: A IA frequentemente gera títulos sensacionalistas/clickbait. Definir no prompt um tom "prático e direto" ajuda, mas revisão humana eventual ainda é necessária.

### 🟢 Boas Práticas Validadas

8. **Triple Failover de IA**: Gemini → Groq → Ollama Local. Em 2+ meses de operação, nunca falhamos em gerar um post. Quando o Google tem "High Demand", o Groq assume instantaneamente.

9. **Pexels com deduplicação**: O agente verifica quais imagens já foram usadas em posts anteriores antes de selecionar uma nova, evitando capas repetidas.

10. **Notificações imediatas**: Telegram para o admin ver o post publicado em tempo real e poder deletar/refazer se necessário.

11. **`mirror --delete` no deploy**: Garante que arquivos removidos do repo também sejam removidos do servidor, mantendo sincronização perfeita.

12. **Sitemap gerado no build**: O `sitemap-generator.mjs` roda automaticamente antes do `next build`, garantindo que novos posts sempre apareçam no sitemap sem intervenção manual.

13. **`.htaccess` na pasta `public/`**: Colocar o `.htaccess` em `public/` garante que ele é automaticamente copiado para `out/` durante o build e deployado junto com o site.

14. **`git pull --rebase` antes do push**: Evita conflitos quando o deploy workflow e o agent workflow rodam próximos. Se o push falhar, tenta novamente após 5 segundos.

### 🔵 Armadilhas Técnicas Específicas

15. **Ícones do lucide-react**: Nem todos os ícones do site oficial existem na versão instalada. Sempre verificar se o ícone existe antes de usar (`CursorClick` não existia, substituído por `MousePointer2`).

16. **JSON da IA com quebras de linha**: LLMs frequentemente retornam JSON com `\n` reais dentro de strings, quebrando o parse. O `extractJSON()` do agente trata isso limpando caracteres de controle dentro de aspas.

17. **Escapes de Markdown no JSON**: A IA às vezes retorna `\*`, `\_`, `\!` no conteúdo Markdown dentro do JSON, que são escapes inválidos em JSON. O regex `replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1')` corrige isso.

18. **RSS Feed como fonte de notícias**: Parsear RSS com regex simples (`<title>` extraction) é mais confiável e leve que depender de bibliotecas XML completas no contexto de GitHub Actions.

---

## 10. Prompt Sugerido para Novos Projetos

> [!IMPORTANT]
> Cole o prompt abaixo nas **User Rules** do Antigravity (ou no `MEMORY.md` do projeto) quando for adicionar um blog como complemento de um site existente.

---

````markdown
# Instruções para o Blog (Subdiretório /blog)

## Contexto
Este projeto tem um blog integrado que roda como um site Next.js com exportação estática.
O blog é um **complemento do site principal** e roda no subdiretório `/blog`.
O blog tem seu **próprio repositório Git** dedicado: `github.com/OWNER/REPO`.

## Stack do Blog
- **Framework**: Next.js 16+ com App Router
- **Exportação**: Static Export (`output: 'export'` no next.config.ts)
- **CSS**: Tailwind CSS v4 com tokens customizados via `@theme` no globals.css
- **Conteúdo**: Posts em Markdown (`.md`) na pasta `content/posts/` com frontmatter YAML
- **Parser**: `gray-matter` para frontmatter + `react-markdown` para renderização
- **Tipografia**: `@tailwindcss/typography` para estilização automática do conteúdo Markdown
- **Ícones**: `lucide-react`
- **Admin**: Painel em rota secreta para gerenciar posts via GitHub API
- **Deploy**: Exportação estática para `out/` → upload via SFTP para Hostinger (Apache)

## Configurações OBRIGATÓRIAS no next.config.ts
```typescript
{
  output: 'export',
  trailingSlash: true,        // NUNCA desabilitar — causa 403 em Apache
  basePath: '/blog',           // Subdiretório do site principal
  images: { unoptimized: true } // Obrigatório em static export
}
```

## Categorias do Blog
**DEFINIR POR PROJETO.** As categorias devem ser específicas para o nicho do cliente.
Exemplos: [SUBSTITUIR pelas categorias reais do projeto]
- Categoria 1
- Categoria 2
- Categoria 3
- Categoria 4

O robô de IA e o painel admin devem usar APENAS estas categorias.

## Estrutura de Posts
Cada post é um arquivo `.md` em `content/posts/` com este frontmatter:
```yaml
---
title: "Título do Post"
date: "2026-01-15"
description: "Descrição curta para SEO"
coverImage: "https://url-da-imagem-de-capa.jpg"
category: "Nome da Categoria"
---
```

## Regras de Conteúdo
1. **Slugs atemporais**: Nunca incluir anos nos slugs (ex: usar `dicas-investimento` em vez de `dicas-investimento-2026`)
2. **Categorias fixas**: Usar APENAS as categorias definidas acima
3. **Autor**: Exibir como "Da Redação" (nunca "IA" ou nome do modelo)
4. **SEO**: Todo post deve ter title, description e coverImage no frontmatter

## Painel Admin
- Rota secreta: `/admin-blog-HASH/` (com noindex/nofollow)
- Funcionalidades: Listar posts, Deletar posts, Solicitar novo post (via workflow_dispatch)
- Autenticação: Senha simples armazenada no localStorage
- API: Usa GitHub REST API para gerenciar conteúdo

## Arquivos Críticos
- `public/.htaccess` — Regras Apache para trailing slash, cache e compressão. NUNCA remover
- `tools/sitemap-generator.mjs` — Gera sitemap no build. Atualizar BASE_URL
- `src/lib/posts.ts` — Lógica de leitura dos Markdowns

## Pipeline de Build
O `npm run build` executa em sequência:
1. `npm run fetch-analytics` — Busca dados do GA4 (com fallback gracioso)
2. `npm run sitemap` — Gera `public/sitemap.xml`
3. `next build` — Gera a pasta `out/`

## Deploy
- Via GitHub Actions com `lftp` sobre SFTP
- Caminho Hostinger (subdiretório): `/home/USUARIO/domains/DOMINIO/public_html/blog`
- Porta SFTP: `65002`
- Usar `mirror -R --delete` para sincronização completa

## Automação de Conteúdo
- Robô em `tools/agent.mjs` gera posts diários via IA
- Failover: Gemini → Groq (+ Ollama Local se disponível)
- Imagens via Pexels API com deduplicação
- Notificações via Telegram Bot API
- CRON no GitHub Actions: `0 10 * * *` (07:00 BRT)
- Pode ser disparado manualmente via painel admin ou GitHub UI

## Armadilhas Conhecidas
- ❌ NUNCA desabilitar `trailingSlash` — causa 403 em Apache
- ❌ NUNCA usar caminho SFTP parcial na Hostinger — usar caminho COMPLETO
- ❌ NUNCA confiar que ícones do lucide-react existem — verificar antes
- ❌ JSON da IA pode vir com quebras de linha reais — sempre sanitizar
- ✅ SEMPRE colocar `.htaccess` na pasta `public/` (copiado para `out/` no build)
- ✅ SEMPRE usar `git pull --rebase` antes de push automatizado
- ✅ SEMPRE gerar sitemap antes do build
- ✅ SEMPRE definir as categorias do projeto ANTES de gerar conteúdo
````

---

## 11. Checklist de Reprodução Rápida

Use esta checklist ao criar um novo blog:

### Preparação
- [ ] Responder todas as perguntas da Seção 7 (Decisões por Projeto)
- [ ] Criar repositório Git dedicado para o blog do cliente
- [ ] Definir categorias específicas do nicho (mínimo 3, máximo 6)

### Estrutura
- [ ] Inicializar Next.js com TypeScript + Tailwind + App Router
- [ ] Instalar: `gray-matter`, `react-markdown`, `@tailwindcss/typography`, `lucide-react`
- [ ] Configurar `next.config.ts` (export + trailingSlash + basePath `/blog` + unoptimized images)
- [ ] Criar pasta `content/posts/` e escrever 2-3 posts iniciais
- [ ] Criar `src/lib/posts.ts` com funções `getAllPosts`, `getPostBySlug`, `getPostSlugs`
- [ ] Criar componentes: Header, Footer, PostList, ShareArticle
- [ ] Criar página home (`src/app/page.tsx`) com lista de posts
- [ ] Criar página de post (`src/app/posts/[slug]/page.tsx`) com `generateStaticParams`
- [ ] Configurar design tokens no `globals.css` via `@theme`

### Admin
- [ ] Criar painel admin em rota secreta (`src/app/admin-blog-HASH/page.tsx`)
- [ ] Implementar listagem, deleção e disparo de geração via GitHub API
- [ ] Configurar autenticação simples (senha + localStorage)
- [ ] Adicionar meta noindex/nofollow na rota admin

### Infraestrutura
- [ ] Criar `public/.htaccess` com regras de cache, rewrite e compressão
- [ ] Criar `tools/sitemap-generator.mjs` com a URL base correta
- [ ] Atualizar `package.json` scripts: `"build": "npm run sitemap && next build"`
- [ ] Criar `.github/workflows/deploy.yml` com build + SFTP para `/public_html/blog`
- [ ] Configurar secrets no GitHub (SFTP, Telegram, APIs de IA, GitHub Token)
- [ ] Configurar subdiretório `/blog` na hospedagem
- [ ] Testar build local: `npm run build` → verificar pasta `out/`
- [ ] Fazer primeiro deploy e testar URLs diretamente no navegador

### Automação (Opcional)
- [ ] Criar `tools/agent.mjs` com prompts adaptados ao nicho e categorias do projeto
- [ ] Criar `.github/workflows/ai-agent.yml` com CRON
- [ ] Decidir se usará LLMs locais ou apenas Gemini + Groq
- [ ] Testar disparo manual do agent pelo painel admin

---

> [!TIP]
> Este documento pode ser salvo como `BLOG_GUIDE.md` na raiz de qualquer novo projeto para servir como referência rápida durante o desenvolvimento.
